import assert from 'node:assert/strict';
import test from 'node:test';
import { openDb } from '../src/db.ts';
import { ask, REJECT_MESSAGE } from '../src/pipeline.ts';
import { createPredict } from '../src/predict.ts';
import { createChat, type Chat, type Message } from '../src/provider.ts';
import { axis, DIM, readJson, withEngine, withIndex } from './fixtures.ts';

const INVESTIGATE = JSON.stringify({
  sensible: true,
  english: 'what do cats eat',
  intent: 'investigate',
});

const SIMULATE = JSON.stringify({
  sensible: true,
  english: 'simulate 30 degrees and 50 percent humidity',
  intent: 'simulate',
  params: { temperature: 30, humidity: 50 },
});

function scriptedChat(replies: string[], calls: Message[][] = []): Chat {
  let index = 0;
  return async (messages) => {
    calls.push(messages);
    return replies[index++] ?? replies.at(-1) ?? '';
  };
}

test('investigate embeds the English translation and answers from context', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const embedded: string[] = [];
      const calls: Message[][] = [];
      const result = await ask('¿qué comen los gatos?', {
        db,
        chat: scriptedChat([INVESTIGATE, 'Los gatos comen carne.'], calls),
        embed: async (text) => {
          embedded.push(text);
          return axis(0);
        },
      });

      assert.equal(result.intent, 'investigate');
      assert.deepEqual(embedded, ['what do cats eat']);
      assert.equal(result.answer, 'Los gatos comen carne.');
      if (result.intent !== 'investigate') return;
      assert.ok(result.hits.length > 0);
      assert.equal(result.hits[0].documentId, 'doc-0');
      assert.match(String(calls[1].at(-1)?.content), /cats are small mammals/);
    } finally {
      db.close();
    }
  });
});

test('nonsense prompts are rejected before embedding or predicting', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const result = await ask('asdkjhasd !!! -- DROP TABLE chunks', {
        db,
        chat: scriptedChat([JSON.stringify({ sensible: false })]),
        embed: async () => {
          throw new Error('must not embed');
        },
        predict: async () => {
          throw new Error('must not predict');
        },
      });

      assert.deepEqual(result, { answer: REJECT_MESSAGE, intent: 'reject' });
    } finally {
      db.close();
    }
  });
});

test('unparseable router output is rejected', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const result = await ask('tell me about the pdfs', {
        db,
        chat: scriptedChat(['I am not JSON at all']),
        embed: async () => {
          throw new Error('must not embed');
        },
      });
      assert.equal(result.intent, 'reject');
      assert.equal(result.answer, REJECT_MESSAGE);
    } finally {
      db.close();
    }
  });
});

test('simulate forwards parameters to predict and reports the result', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const seen: Array<Record<string, unknown>> = [];
      const result = await ask('simula 30 grados y 50% de humedad', {
        db,
        chat: scriptedChat([SIMULATE, 'La simulación proyecta 42 unidades.']),
        embed: async () => {
          throw new Error('must not embed');
        },
        predict: async (params) => {
          seen.push(params);
          return { yield: 42 };
        },
      });

      assert.deepEqual(seen, [{ temperature: 30, humidity: 50 }]);
      assert.equal(result.intent, 'simulate');
      assert.equal(result.answer, 'La simulación proyecta 42 unidades.');
      if (result.intent === 'simulate') assert.deepEqual(result.prediction, { yield: 42 });
    } finally {
      db.close();
    }
  });
});

test('simulate without parameters falls back to retrieval', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      let embedded = 0;
      const result = await ask('run a simulation', {
        db,
        chat: scriptedChat([
          JSON.stringify({ sensible: true, english: 'run a simulation', intent: 'simulate', params: {} }),
          'Which values should I use?',
        ]),
        embed: async () => {
          embedded += 1;
          return axis(0);
        },
        predict: async () => {
          throw new Error('must not predict without parameters');
        },
      });

      assert.equal(embedded, 1);
      assert.equal(result.intent, 'investigate');
    } finally {
      db.close();
    }
  });
});

test('empty prompts are rejected without calling the provider', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const calls: Message[][] = [];
      const result = await ask('   ', {
        db,
        chat: scriptedChat(['should not be used'], calls),
        embed: async () => axis(0),
      });

      assert.equal(result.intent, 'reject');
      assert.equal(calls.length, 0);
    } finally {
      db.close();
    }
  });
});

test('provider failures propagate as errors, not rejections', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      await assert.rejects(
        ask('¿qué comen los gatos?', {
          db,
          chat: async () => {
            throw new Error('llm provider returned 503');
          },
          embed: async () => axis(0),
        }),
        /503/,
      );
    } finally {
      db.close();
    }
  });
});

test('createChat sends model and messages and returns the answer', async () => {
  let seen: unknown;
  await withEngine(
    async (req, res) => {
      seen = await readJson(req);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: 'hola' } }] }));
    },
    async (url) => {
      const chat = createChat({ url, model: 'llama3.1' });
      assert.equal(await chat([{ role: 'user', content: 'hi' }], { json: true }), 'hola');
      assert.deepEqual(seen, {
        model: 'llama3.1',
        messages: [{ role: 'user', content: 'hi' }],
        response_format: { type: 'json_object' },
      });
    },
  );
});

test('createPredict forwards flat parameters and returns the body', async () => {
  let seen: unknown;
  await withEngine(
    async (req, res) => {
      seen = await readJson(req);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ yield: 7 }));
    },
    async (url) => {
      const predict = createPredict(url);
      assert.deepEqual(await predict({ temperature: 30 }), { yield: 7 });
      assert.deepEqual(seen, { temperature: 30 });
    },
  );
});

test('createPredict refuses to run without PREDICT_URL', async () => {
  await assert.rejects(createPredict(undefined)({ temperature: 30 }), /PREDICT_URL/);
});
