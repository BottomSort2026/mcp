import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { openDb } from '../src/db.ts';
import { embed } from '../src/embeddings.ts';
import { ask, REJECT_MESSAGE } from '../src/pipeline.ts';
import { createPredict } from '../src/predict.ts';
import { createChat } from '../src/provider.ts';
import { axis, DIM, withIndex } from './fixtures.ts';

type Call = { kind: 'route' | 'answer' | 'embed' | 'predict'; body: Record<string, any> };
type Mock = { router: string; answer: string };

// One OpenAI-compatible mock standing in for the translation/routing call, the
// final answer call, the embedding engine and the predict endpoint.
async function withMock(
  mock: Mock,
  run: (base: string, calls: Call[]) => Promise<void>,
): Promise<void> {
  const calls: Call[] = [];
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      const url = req.url ?? '';
      const send = (value: unknown) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(value));
      };

      if (url.includes('/v1/embeddings')) {
        calls.push({ kind: 'embed', body });
        return send({ data: [{ embedding: axis(0) }] });
      }
      if (url.includes('/predict')) {
        calls.push({ kind: 'predict', body });
        return send({ yield: 42, unit: 'kg' });
      }
      if (url.includes('/v1/chat')) {
        const routing = Boolean(body.response_format);
        calls.push({ kind: routing ? 'route' : 'answer', body });
        return send({ choices: [{ message: { content: routing ? mock.router : mock.answer } }] });
      }
      res.writeHead(404).end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`, calls);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function withChatbox(
  mock: Mock,
  run: (
    base: string,
    calls: Call[],
    deps: { db: ReturnType<typeof openDb> },
  ) => Promise<void>,
): Promise<void> {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      await withMock(mock, (base, calls) => run(base, calls, { db }));
    } finally {
      db.close();
    }
  });
}

test('investigate: translate → embed → sqlite retrieval → llm answer', async () => {
  await withChatbox(
    {
      router: JSON.stringify({
        sensible: true,
        english: 'what do cats eat',
        intent: 'investigate',
      }),
      answer: 'Los gatos comen carne.',
    },
    async (base, calls, { db }) => {
      const result = await ask('¿qué comen los gatos?', {
        db,
        chat: createChat({ url: `${base}/v1/chat/completions`, model: 'llm' }),
        embed: (text) => embed(text, { url: `${base}/v1/embeddings`, model: 'emb', dim: DIM }),
        predict: createPredict(`${base}/predict`),
      });

      assert.deepEqual(
        calls.map((call) => call.kind),
        ['route', 'embed', 'answer'],
        'router, then embedding, then the answer call',
      );
      assert.equal(
        calls[0].body.messages.at(-1).content,
        '¿qué comen los gatos?',
        'router receives the original prompt',
      );
      assert.deepEqual(calls[1].body, { model: 'emb', input: ['what do cats eat'] });

      const answerPrompt = String(calls[2].body.messages.at(-1).content);
      assert.match(answerPrompt, /cats are small mammals/, 'context comes from sqlite');
      assert.match(answerPrompt, /¿qué comen los gatos\?/, 'original kept for answer language');

      assert.equal(result.intent, 'investigate');
      assert.equal(result.answer, 'Los gatos comen carne.');
      if (result.intent === 'investigate') {
        assert.equal(result.hits[0].documentId, 'doc-0');
      }
    },
  );
});

test('useless prompt: translation happens, then the fixed rejection, no embed', async () => {
  await withChatbox(
    {
      router: JSON.stringify({ sensible: false }),
      answer: 'must not be used',
    },
    async (base, calls, { db }) => {
      const result = await ask('asdkjhasd !!!', {
        db,
        chat: createChat({ url: `${base}/v1/chat/completions`, model: 'llm' }),
        embed: (text) => embed(text, { url: `${base}/v1/embeddings`, model: 'emb', dim: DIM }),
        predict: createPredict(`${base}/predict`),
      });

      assert.deepEqual(calls.map((call) => call.kind), ['route']);
      assert.deepEqual(result, { answer: REJECT_MESSAGE, intent: 'reject' });
    },
  );
});

test('simulate: routed parameters go to predict and its data reaches the answer', async () => {
  await withChatbox(
    {
      router: JSON.stringify({
        sensible: true,
        english: 'simulate 30 degrees and 50 percent humidity',
        intent: 'simulate',
        params: { temperature: 30, humidity: 50 },
      }),
      answer: 'Simulación: 42 kg.',
    },
    async (base, calls, { db }) => {
      const result = await ask('simula 30 grados y 50% de humedad', {
        db,
        chat: createChat({ url: `${base}/v1/chat/completions`, model: 'llm' }),
        embed: (text) => embed(text, { url: `${base}/v1/embeddings`, model: 'emb', dim: DIM }),
        predict: createPredict(`${base}/predict`),
      });

      assert.deepEqual(
        calls.map((call) => call.kind),
        ['route', 'predict', 'answer'],
        'no embedding on the simulate path',
      );
      assert.deepEqual(calls[1].body, { temperature: 30, humidity: 50 });

      const answerPrompt = String(calls[2].body.messages.at(-1).content);
      assert.match(answerPrompt, /"yield":42/, 'prediction data reaches the llm');

      assert.equal(result.intent, 'simulate');
      assert.equal(result.answer, 'Simulación: 42 kg.');
      if (result.intent === 'simulate') {
        assert.deepEqual(result.prediction, { yield: 42, unit: 'kg' });
      }
    },
  );
});
