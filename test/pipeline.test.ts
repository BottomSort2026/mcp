import assert from 'node:assert/strict';
import test from 'node:test';
import { openCorpus, type Corpus } from '../src/db.ts';
import { UpstreamError } from '../src/errors.ts';
import type { Turn } from '../src/history.ts';
import { ask, fitPassages, MAX_CONTEXT_CHARS, passageBlock, REJECT_MESSAGE } from '../src/pipeline.ts';
import { createPredict } from '../src/predict.ts';
import { createChat, type Chat, type Message } from '../src/provider.ts';
import type { SearchHit } from '../src/rag.ts';
import {
  axis,
  NO_BM25_MATCH,
  readJson,
  SEARCH_K,
  weighted,
  withEngine,
  withIndex,
  type IndexOptions,
} from './fixtures.ts';

const routed = (english: string) => JSON.stringify({ sensible: true, english, intent: 'investigate' });

const SIMULATE = JSON.stringify({
  sensible: true,
  english: 'simulate 30 degrees and 50 percent humidity',
  intent: 'simulate',
  params: { temperature: 30, humidity: 50 },
});

// Passages in a fixed order: [1] fact sheet p. 1-2, [2] SAFFIRE-T card, [3] PSI-2 test sheet.
const RANKED = weighted({ 3: 3, 0: 2, 2: 1 });

function scriptedChat(replies: string[], calls: Message[][] = []): Chat {
  let index = 0;
  return async (messages) => {
    calls.push(messages);
    return replies[index++] ?? replies.at(-1) ?? '';
  };
}

const lastContent = (call: Message[]) => String(call.at(-1)?.content);

async function withCorpus(run: (corpus: Corpus) => Promise<void>, options?: IndexOptions) {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    try {
      await run(corpus);
    } finally {
      corpus.db.close();
    }
  }, options);
}

test('investigate searches the English query and answers from the numbered passages', async () => {
  await withCorpus(async (corpus) => {
    const embedded: string[] = [];
    const calls: Message[][] = [];
    const result = await ask(
      { message: '¿cómo se propagan las llamas en microgravedad?', history: [] },
      {
        corpus,
        chat: scriptedChat([routed('how do flames spread in microgravity'), 'Se propagan contra el flujo [1].'], calls),
        embed: async (text) => {
          embedded.push(text);
          return axis(1);
        },
      },
    );

    assert.deepEqual(embedded, ['how do flames spread in microgravity']);
    assert.equal(result.intent, 'investigate');
    assert.equal(result.retrieval, 'hybrid');
    assert.equal(result.answer, 'Se propagan contra el flujo [1].');
    assert.deepEqual(result.citations.map((c) => c.n), [1]);
    assert.equal(result.citations[0].doc_title, 'Spacecraft Fire Test');

    const prompt = lastContent(calls[1]);
    assert.match(prompt, /^Question:\n¿cómo se propagan las llamas en microgravedad\?/);
    assert.match(prompt, /English search query:\nhow do flames spread in microgravity/);
    assert.match(prompt, /\[1\] Spacecraft Fire Test \| type: metadata \| investigation: SAFFIRE-T \(PSI-1\)\nflame spread against a slow opposed airflow/);
  });
});

test('the context carries a header per passage: number, title, type, page, investigation', async () => {
  await withCorpus(async (corpus) => {
    const calls: Message[][] = [];
    await ask(
      { message: 'fuego' },
      { corpus, chat: scriptedChat([routed(NO_BM25_MATCH), 'ok'], calls), embed: async () => RANKED },
    );

    const passages = lastContent(calls[1]).split('Passages:\n')[1];
    assert.equal(
      passages,
      [
        '[1] Fire in Space Fact Sheet | type: factsheet | pages 1-2',
        'fires in space form spherical flames',
        '',
        '[2] Spacecraft Fire Test | type: metadata | investigation: SAFFIRE-T (PSI-1)',
        'SAFFIRE-T burned cotton and fiberglass fabric in microgravity',
        '',
        '[3] Droplet test sheet A | type: testsheet | investigation: PSI-2',
        'heptane droplet diameter shrank during burning',
      ].join('\n'),
    );
  });
});

test('citations follow the markers in the answer, in marker order', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'fuego' },
      {
        corpus,
        chat: scriptedChat([
          routed(NO_BM25_MATCH),
          'SAFFIRE-T quemó algodón [2]. Las llamas son esféricas [1]. Otra fuente [7].',
        ]),
        embed: async () => RANKED,
      },
    );

    // [7] points at no passage: it is removed instead of dangling.
    assert.equal(result.answer, 'SAFFIRE-T quemó algodón [2]. Las llamas son esféricas [1]. Otra fuente.');
    assert.deepEqual(
      result.citations.map((c) => [c.n, c.doc_title]),
      [
        [1, 'Fire in Space Fact Sheet'],
        [2, 'Spacecraft Fire Test'],
      ],
    );
  });
});

test('an answer without markers cites every passage given to the model', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'fuego' },
      {
        corpus,
        chat: scriptedChat([routed(NO_BM25_MATCH), 'Los pasajes no responden la pregunta.']),
        embed: async () => RANKED,
      },
    );

    assert.equal(result.citations.length, SEARCH_K);
    assert.deepEqual(result.citations.map((c) => c.n), [1, 2, 3]);
  });
});

test('PSI citations link the investigation page, external ones the public page; NULL pages print none', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'fuego' },
      { corpus, chat: scriptedChat([routed(NO_BM25_MATCH), 'sin marcas']), embed: async () => RANKED },
    );
    const [external, card, testsheet] = result.citations;

    assert.deepEqual(external, {
      n: 1,
      label: 'NASA (2020), "Fire in Space Fact Sheet", p. 1.',
      doc_title: 'Fire in Space Fact Sheet',
      doc_authors: 'NASA',
      year: 2020,
      doc_type: 'factsheet',
      page: 1,
      page_end: 2,
      accession: null,
      acronym: null,
      related_accessions: ['PSI-1', 'PSI-2'],
      file_name: null,
      psi_folder: null,
      investigation_url: null,
      public_url: 'https://nasa.example/fire-fact-sheet.pdf',
    });

    assert.equal(card.investigation_url, 'https://psi.example/investigations/PSI-1');
    assert.equal(card.public_url, null);
    assert.equal(card.page, null);
    assert.equal(card.label, '"Spacecraft Fire Test". SAFFIRE-T (PSI-1).');

    assert.equal(testsheet.investigation_url, 'https://psi.example/investigations/PSI-2');
    assert.equal(testsheet.public_url, null);
    assert.equal(testsheet.label, '(2019), "Droplet test sheet A". PSI-2, folder Data/Tests.');
    assert.doesNotMatch(testsheet.label, /p\. /);
  });
});

test('the number of passages comes from corpus_info.search.k', async () => {
  for (const k of [SEARCH_K, 2]) {
    await withCorpus(
      async (corpus) => {
        const result = await ask(
          { message: 'flames' },
          { corpus, chat: scriptedChat([routed('flames'), 'sin marcas']), embed: async () => axis(0) },
        );
        assert.equal(result.citations.length, k);
      },
      { patchInfo: (info) => (info.search.k = k) },
    );
  }
});

test('a follow-up reaches the router with the history, and the answer call sees it too', async () => {
  await withCorpus(async (corpus) => {
    const history: Turn[] = [
      { role: 'user', content: 'What did FLEX study?' },
      { role: 'assistant', content: 'FLEX studied droplet flame extinction.' },
    ];
    const calls: Message[][] = [];
    await ask(
      { message: 'and with helium?', history },
      {
        corpus,
        chat: scriptedChat(
          [routed('effect of helium dilution on droplet flame extinction in FLEX'), 'ok'],
          calls,
        ),
        embed: async () => axis(2),
      },
    );

    const [routerCall, answerCall] = calls;
    assert.equal(
      lastContent(routerCall),
      [
        'Conversation so far:',
        'User: What did FLEX study?',
        'Assistant: FLEX studied droplet flame extinction.',
        '',
        'Latest message:',
        'and with helium?',
      ].join('\n'),
    );
    assert.deepEqual(answerCall.slice(1, 3), history);
    assert.match(lastContent(answerCall), /English search query:\neffect of helium dilution/);
  });
});

test('the context budget drops whole passages from the end and never cuts one', () => {
  const hit = (id: number, length: number): SearchHit => ({
    id, chunkId: `d#${id}`, text: 'x'.repeat(length), page: null, pageEnd: null, docId: 'd',
    title: `T${id}`, authors: null, year: null, docType: 'book', fileName: null, psiFolder: null,
    publicUrl: null, accession: null, relatedAccessions: [], acronym: null, investigationUrl: null,
    fireRelevance: null, score: 0, similarity: null, methods: ['bm25'],
  });

  // Five chunks at the corpus maximum fit whole.
  const longest = [1, 2, 3, 4, 5].map((id) => hit(id, 2300));
  assert.equal(fitPassages(longest, MAX_CONTEXT_CHARS).length, 5);

  const size = (h: SearchHit, n: number) => passageBlock(h, n).length + 2;
  const hits = [hit(1, 100), hit(2, 100), hit(3, 100)];
  const budget = size(hits[0], 1) + size(hits[1], 2) + 10;
  assert.deepEqual(fitPassages(hits, budget).map((h) => h.id), [1, 2]);
  assert.deepEqual(fitPassages(hits, 1).map((h) => h.id), [1], 'the first passage always goes, whole');
});

test('investigate still answers from BM25 when the engine fails', async () => {
  await withCorpus(async (corpus) => {
    const warnings: string[] = [];
    const calls: Message[][] = [];
    const result = await ask(
      { message: '¿qué tela probó SAFFIRE-T?' },
      {
        corpus,
        chat: scriptedChat([routed('which fabric did SAFFIRE-T test'), 'Algodón y fibra de vidrio [1].'], calls),
        embed: async () => {
          throw new Error('fetch failed');
        },
        warn: (message) => warnings.push(message),
      },
    );

    assert.equal(result.intent, 'investigate');
    assert.equal(result.retrieval, 'bm25');
    assert.equal(result.answer, 'Algodón y fibra de vidrio [1].');
    assert.deepEqual(result.citations.map((c) => c.label), ['"Spacecraft Fire Test". SAFFIRE-T (PSI-1).']);
    assert.match(lastContent(calls[1]), /SAFFIRE-T burned cotton/);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /BM25 only: fetch failed/);
  });
});

test('no passages from either method: the prompt says so and nothing is cited', async () => {
  await withCorpus(
    async (corpus) => {
      const calls: Message[][] = [];
      const result = await ask(
        { message: 'zepelín cuásar' },
        {
          corpus,
          chat: scriptedChat([routed(NO_BM25_MATCH), 'No encuentro información sobre eso.'], calls),
          embed: async () => axis(0),
        },
      );

      assert.equal(result.intent, 'investigate');
      assert.deepEqual(result.citations, []);
      assert.match(lastContent(calls[1]), /Passages:\n\(no matching passages\)$/);
    },
    { withoutVectors: true },
  );
});

test('nonsense messages are rejected before searching or predicting', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'asdkjhasd !!! -- DROP TABLE chunks' },
      {
        corpus,
        chat: scriptedChat([JSON.stringify({ sensible: false })]),
        embed: async () => {
          throw new Error('must not embed');
        },
        predict: async () => {
          throw new Error('must not predict');
        },
      },
    );

    assert.deepEqual(result, { answer: REJECT_MESSAGE, intent: 'reject', retrieval: 'none', citations: [] });
  });
});

test('unparseable router output is rejected', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'tell me about the pdfs' },
      {
        corpus,
        chat: scriptedChat(['I am not JSON at all']),
        embed: async () => {
          throw new Error('must not embed');
        },
      },
    );
    assert.equal(result.intent, 'reject');
    assert.equal(result.answer, REJECT_MESSAGE);
  });
});

test('empty messages are rejected without calling the provider', async () => {
  await withCorpus(async (corpus) => {
    const calls: Message[][] = [];
    const result = await ask(
      { message: '   ' },
      { corpus, chat: scriptedChat(['should not be used'], calls), embed: async () => axis(0) },
    );

    assert.equal(result.intent, 'reject');
    assert.equal(calls.length, 0);
  });
});

test('simulate forwards parameters to predict and reports the result', async () => {
  await withCorpus(async (corpus) => {
    const seen: Array<Record<string, unknown>> = [];
    const calls: Message[][] = [];
    const result = await ask(
      { message: 'simula 30 grados y 50% de humedad' },
      {
        corpus,
        chat: scriptedChat([SIMULATE, 'La simulación proyecta 42 unidades.'], calls),
        embed: async () => {
          throw new Error('must not embed');
        },
        predict: async (params) => {
          seen.push(params);
          return { yield: 42 };
        },
      },
    );

    assert.deepEqual(seen, [{ temperature: 30, humidity: 50 }]);
    assert.deepEqual(result, {
      answer: 'La simulación proyecta 42 unidades.',
      intent: 'simulate',
      retrieval: 'none',
      citations: [],
    });
    assert.match(lastContent(calls[1]), /"yield":42/);
  });
});

test('simulate without predict configured falls back to retrieval', async () => {
  await withCorpus(async (corpus) => {
    let embedded = 0;
    const result = await ask(
      { message: 'simula 30 grados y 50% de humedad' },
      {
        corpus,
        chat: scriptedChat([SIMULATE, 'Respuesta desde los documentos.']),
        embed: async () => {
          embedded += 1;
          return axis(0);
        },
      },
    );

    assert.equal(embedded, 1);
    assert.equal(result.intent, 'investigate');
  });
});

test('simulate without parameters falls back to retrieval', async () => {
  await withCorpus(async (corpus) => {
    const result = await ask(
      { message: 'run a simulation' },
      {
        corpus,
        chat: scriptedChat([
          JSON.stringify({ sensible: true, english: 'run a simulation', intent: 'simulate', params: {} }),
          'Which values should I use?',
        ]),
        embed: async () => axis(0),
        predict: async () => {
          throw new Error('must not predict without parameters');
        },
      },
    );

    assert.equal(result.intent, 'investigate');
  });
});

test('LLM failures become llm_unavailable, predict failures predict_unavailable', async () => {
  await withCorpus(async (corpus) => {
    await assert.rejects(
      ask(
        { message: '¿cómo se propagan las llamas?' },
        {
          corpus,
          chat: async () => {
            throw new Error('llm provider returned 503: overloaded');
          },
          embed: async () => axis(0),
        },
      ),
      (error) =>
        error instanceof UpstreamError &&
        error.code === 'llm_unavailable' &&
        /503: overloaded/.test(error.message),
    );

    await assert.rejects(
      ask(
        { message: 'simula 30 grados' },
        {
          corpus,
          chat: scriptedChat([SIMULATE]),
          embed: async () => axis(0),
          predict: async () => {
            throw new Error('predict engine returned 500');
          },
        },
      ),
      (error) => error instanceof UpstreamError && error.code === 'predict_unavailable',
    );
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

test('createChat gives up after its own timeout', async () => {
  await withEngine(
    () => {
      // Never answers.
    },
    async (url) => {
      const chat = createChat({ url, model: 'llama3.1', timeoutMs: 50 });
      await assert.rejects(chat([{ role: 'user', content: 'hi' }]), { name: 'TimeoutError' });
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

test('createPredict refuses to run while prediction is disabled', async () => {
  await assert.rejects(createPredict(undefined)({ temperature: 30 }), /PREDICT_ENABLED/);
});
