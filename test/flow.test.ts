import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { buildApp, type AppDeps, type AppOptions } from '../src/app.ts';
import { openCorpus, type Corpus } from '../src/db.ts';
import { embed } from '../src/embeddings.ts';
import { createPredict } from '../src/predict.ts';
import { createChat } from '../src/provider.ts';
import { embedResponse, weighted, withIndex } from './fixtures.ts';

type Call = { kind: 'route' | 'answer' | 'embed' | 'predict'; body: Record<string, any> };
type Mock = { router: string; answer: string };

const ROUTED = JSON.stringify({
  sensible: true,
  english: 'effect of CO2 on heptane droplet extinction',
  intent: 'investigate',
});

// Vectors alone rank the fact sheet, the SAFFIRE-T card, then the PSI-2 test sheet. With
// ROUTED, BM25 also finds the test sheet ("heptane droplet"), so the fused passages are
// [1] PSI-2 test sheet, [2] fact sheet (external), [3] SAFFIRE-T card.
const RANKED = weighted({ 3: 3, 0: 2, 2: 1 });

// One mock standing in for the engine (/embed, /predict) and for the
// OpenAI-compatible chat provider (routing call and answer call).
async function withMock(mock: Mock, run: (base: string, calls: Call[]) => Promise<void>) {
  const calls: Call[] = [];
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      const send = (value: unknown) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(value));
      };
      if (req.url === '/embed') {
        calls.push({ kind: 'embed', body });
        return send(embedResponse(RANKED));
      }
      if (req.url === '/predict') {
        calls.push({ kind: 'predict', body });
        return send({ yield: 42 });
      }
      if (req.url === '/v1/chat/completions') {
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
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/** A base URL nothing listens on: connecting to it is refused. */
async function closedUrl(): Promise<string> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return `http://127.0.0.1:${port}`;
}

// Wired the way server.ts does it, with the given engine and LLM base URLs.
const depsFor = (corpus: Corpus, engineUrl: string, llmUrl: string): AppDeps => ({
  corpus,
  chat: createChat({ url: `${llmUrl}/v1/chat/completions`, model: 'llm' }),
  embed: (text) =>
    embed(text, {
      engineUrl,
      modelId: corpus.info.embedding.model_id,
      dimension: corpus.info.embedding.dimension,
    }),
  predict: createPredict(`${engineUrl}/predict`),
});

async function withService(
  mock: Mock,
  run: (ctx: { app: ReturnType<typeof buildApp>; calls: Call[]; base: string; corpus: Corpus }) => Promise<void>,
  options: { deps?: (corpus: Corpus, base: string) => AppDeps; app?: AppOptions } = {},
) {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    try {
      await withMock(mock, async (base, calls) => {
        const deps = options.deps?.(corpus, base) ?? depsFor(corpus, base, base);
        const app = buildApp(deps, options.app ?? { logger: false });
        try {
          await run({ app, calls, base, corpus });
        } finally {
          await app.close();
        }
      });
    } finally {
      corpus.db.close();
    }
  });
}

const chat = (app: ReturnType<typeof buildApp>, payload: unknown, headers: Record<string, string> = {}) =>
  app.inject({ method: 'POST', url: '/chat', payload: payload as object, headers });

test('POST /chat answers { answer, intent, retrieval, citations }', async () => {
  await withService(
    { router: ROUTED, answer: 'El CO2 adelanta la extinción [1]. Las llamas son esféricas [2].' },
    async ({ app, calls }) => {
      const response = await chat(app, {
        message: '¿Cómo afecta el CO2 a la extinción de una gota de heptano?',
        history: [],
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.headers['access-control-allow-origin'], undefined, 'CORS belongs to the gateway');
      const body = response.json();
      assert.deepEqual(Object.keys(body), ['answer', 'intent', 'retrieval', 'citations']);
      assert.equal(body.answer, 'El CO2 adelanta la extinción [1]. Las llamas son esféricas [2].');
      assert.equal(body.intent, 'investigate');
      assert.equal(body.retrieval, 'hybrid');
      assert.deepEqual(
        body.citations.map((c: any) => [c.n, c.label, c.investigation_url, c.public_url]),
        [
          [1, '(2019), "Droplet test sheet A". PSI-2, folder Data/Tests.', 'https://psi.example/investigations/PSI-2', null],
          [2, 'NASA (2020), "Fire in Space Fact Sheet", p. 1.', null, 'https://nasa.example/fire-fact-sheet.pdf'],
        ],
      );

      assert.deepEqual(calls.map((call) => call.kind), ['route', 'embed', 'answer']);
      assert.deepEqual(calls[1].body, { text: 'effect of CO2 on heptane droplet extinction' });
      assert.match(
        calls[2].body.messages.at(-1).content,
        /\[3\] Spacecraft Fire Test \| type: metadata \| investigation: SAFFIRE-T \(PSI-1\)\nSAFFIRE-T burned cotton/,
      );
    },
  );
});

test('unknown request fields are ignored, not rejected', async () => {
  await withService({ router: ROUTED, answer: 'ok' }, async ({ app }) => {
    const response = await chat(app, {
      message: '¿qué es una llama?',
      history: [],
      locale: 'es-CL',
      stream: true,
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().intent, 'investigate');
  });
});

test('bad requests answer 400 in the gateway error shape', async () => {
  await withService({ router: ROUTED, answer: 'ok' }, async ({ app, calls }) => {
    const missing = await chat(app, { history: [] });
    assert.equal(missing.statusCode, 400);
    assert.deepEqual(Object.keys(missing.json()), ['error', 'detail']);
    assert.equal(missing.json().error, 'bad_request');
    assert.match(missing.json().detail, /message/);

    const tooLong = await chat(app, { message: 'a'.repeat(4001) });
    assert.equal(tooLong.statusCode, 400);
    assert.equal(tooLong.json().error, 'bad_request');

    const malformed = await app.inject({
      method: 'POST',
      url: '/chat',
      payload: '{"message": ',
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(malformed.statusCode, 400);
    assert.equal(malformed.json().error, 'bad_request');

    assert.equal(calls.length, 0, 'nothing reaches the LLM');
  });
});

test('a follow-up with history reaches the router with that history', async () => {
  await withService({ router: ROUTED, answer: 'ok' }, async ({ app, calls }) => {
    const response = await chat(app, {
      message: '¿y con helio?',
      history: [
        { role: 'user', content: '¿Qué estudió FLEX?' },
        { role: 'assistant', content: 'FLEX estudió la extinción de gotas [1].' },
        { role: 'tool', content: 'dropped' },
      ],
    });
    assert.equal(response.statusCode, 200);

    const routerPrompt = calls[0].body.messages.at(-1).content;
    assert.equal(
      routerPrompt,
      'Conversation so far:\nUser: ¿Qué estudió FLEX?\nAssistant: FLEX estudió la extinción de gotas.\n\nLatest message:\n¿y con helio?',
    );
    const answerMessages = calls.at(-1)!.body.messages;
    assert.deepEqual(answerMessages.slice(1, 3), [
      { role: 'user', content: '¿Qué estudió FLEX?' },
      { role: 'assistant', content: 'FLEX estudió la extinción de gotas.' },
    ]);
  });
});

test('a rejected message is still a 200', async () => {
  await withService({ router: JSON.stringify({ sensible: false }), answer: 'unused' }, async ({ app, calls }) => {
    const response = await chat(app, { message: 'asdkjhasd !!!' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {
      answer: 'no entiendo lo que estas diciendo.',
      intent: 'reject',
      retrieval: 'none',
      citations: [],
    });
    assert.deepEqual(calls.map((call) => call.kind), ['route']);
  });
});

test('LLM down: 502 llm_unavailable', async () => {
  const down = await closedUrl();
  await withService(
    { router: ROUTED, answer: 'ok' },
    async ({ app }) => {
      const response = await chat(app, { message: '¿qué es una llama?' });
      assert.equal(response.statusCode, 502);
      assert.equal(response.json().error, 'llm_unavailable');
      assert.match(response.json().detail, /fetch failed \(.*ECONNREFUSED/);
    },
    { deps: (corpus, base) => depsFor(corpus, base, down) },
  );
});

test('engine down: 200 with retrieval "bm25"', async () => {
  const down = await closedUrl();
  await withService(
    {
      router: JSON.stringify({ sensible: true, english: 'SAFFIRE-T fabric', intent: 'investigate' }),
      answer: 'Algodón [1].',
    },
    async ({ app }) => {
      const response = await chat(app, { message: '¿qué tela quemó SAFFIRE-T?', history: [] });
      assert.equal(response.statusCode, 200);
      const body = response.json();
      assert.equal(body.retrieval, 'bm25');
      assert.equal(body.citations[0].label, '"Spacecraft Fire Test". SAFFIRE-T (PSI-1).');
    },
    { deps: (corpus, base) => depsFor(corpus, down, base) },
  );
});

test('predict failure: 502 predict_unavailable', async () => {
  await withService(
    {
      router: JSON.stringify({ sensible: true, english: 'simulate', intent: 'simulate', params: { o2: 0.21 } }),
      answer: 'unused',
    },
    async ({ app }) => {
      const response = await chat(app, { message: 'simula 21% de oxígeno' });
      assert.equal(response.statusCode, 502);
      assert.equal(response.json().error, 'predict_unavailable');
    },
    {
      deps: (corpus, base) => ({
        ...depsFor(corpus, base, base),
        predict: async () => {
          throw new Error('predict engine returned 500');
        },
      }),
    },
  );
});

test('the X-Request-ID header becomes the request id in the logs', async () => {
  const lines: Array<Record<string, unknown>> = [];
  const stream = { write: (line: string) => void lines.push(JSON.parse(line)) };

  await withService(
    { router: ROUTED, answer: 'ok [1]' },
    async ({ app }) => {
      const response = await chat(app, { message: '¿qué es una llama?' }, { 'x-request-id': 'gw-7f3a' });
      assert.equal(response.statusCode, 200);
    },
    { app: { logger: { level: 'info', stream } } },
  );

  const mine = lines.filter((line) => line.reqId === 'gw-7f3a');
  assert.ok(mine.some((line) => line.msg === 'incoming request'));
  assert.ok(mine.some((line) => line.msg === 'chat answered' && line.retrieval === 'hybrid'));
});

test('GET /health reports corpus_info, /ask is gone', async () => {
  await withService({ router: ROUTED, answer: 'ok' }, async ({ app, calls, corpus }) => {
    const health = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(health.statusCode, 200);
    assert.deepEqual(health.json(), {
      ok: true,
      corpus: {
        built_at: corpus.info.built_at,
        embedding_model: corpus.info.embedding.model_id,
        dimension: corpus.info.embedding.dimension,
        counts: corpus.info.counts,
      },
    });
    assert.equal(calls.length, 0, 'no network call');

    const ask = await app.inject({ method: 'POST', url: '/ask', payload: { prompt: 'hola' } });
    assert.equal(ask.statusCode, 404);
    assert.equal(ask.json().error, 'not_found');
  });
});

test('MCP ask_question appends the cited sources with their links', async () => {
  await withService(
    { router: ROUTED, answer: 'El CO2 apaga la gota [1]. SAFFIRE-T quemó algodón [3].' },
    async ({ app }) => {
      const response = await app.inject({
        method: 'POST',
        url: '/mcp',
        headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' },
        payload: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'ask_question', arguments: { prompt: '¿por qué las llamas son esféricas?' } },
        },
      });

      assert.equal(response.statusCode, 200);
      const text = response.json().result.content[0].text;
      assert.equal(
        text,
        [
          'El CO2 apaga la gota [1]. SAFFIRE-T quemó algodón [3].',
          '',
          'Sources:',
          '[1] (2019), "Droplet test sheet A". PSI-2, folder Data/Tests. https://psi.example/investigations/PSI-2',
          '[3] "Spacecraft Fire Test". SAFFIRE-T (PSI-1). https://psi.example/investigations/PSI-1',
        ].join('\n'),
      );
    },
  );
});
