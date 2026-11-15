import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { openCorpus, type Corpus } from '../src/db.ts';
import { embed } from '../src/embeddings.ts';
import { bm25Search, ftsQuery, limitPerDoc, rrf, search, type Embed } from '../src/rag.ts';
import {
  axis,
  CHUNKS,
  DIM,
  embedHandler,
  MODEL_ID,
  NO_BM25_MATCH,
  SEARCH_K,
  sendJson,
  weighted,
  withEngine,
  withIndex,
  type IndexOptions,
} from './fixtures.ts';

const vectorOf = (id: number) => CHUNKS.find((chunk) => chunk.id === id)!.vector;

// Mostly `major`, a little `minor`: ranks the major chunk first and the minor second.
function blend(major: number[], minor: number[]): number[] {
  const raw = major.map((value, i) => 2 * value + minor[i]);
  const norm = Math.hypot(...raw);
  return raw.map((value) => value / norm);
}

const failingEmbed: Embed = async () => {
  throw new Error('embedding engine returned 503: model not loaded');
};

const noWarnings = (message: string) => assert.fail(`unexpected warning: ${message}`);

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

test('ftsQuery keeps search.py terms: lowercased, deduplicated, quoted, OR-joined', () => {
  assert.equal(ftsQuery('SAFFIRE-III'), '"saffire-iii"');
  assert.equal(ftsQuery('index: LOI*'), '"index" OR "loi"');
  assert.equal(ftsQuery('(a) "b" NOT c'), '"a" OR "b" OR "not" OR "c"');
  assert.equal(ftsQuery('What is the LOI of the loi?'), '"what" OR "is" OR "the" OR "loi" OR "of"');
  assert.equal(ftsQuery('---'), null);
  assert.equal(ftsQuery('   '), null);
});

test('queries made of FTS5 syntax do not throw', async () => {
  await withCorpus(async (corpus) => {
    // Unquoted, FTS5 reads '-' as syntax: this is what quoting prevents.
    assert.throws(
      () => corpus.db.prepare('SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH ?').all('SAFFIRE-T large'),
      /no such column/,
    );

    for (const query of ['SAFFIRE-III', 'index: LOI*', '(a) "b" NOT c', '---', 'NEAR AND OR', '"']) {
      assert.doesNotThrow(() => bm25Search(corpus.db, query, 20), query);
      const result = await search(corpus, query, async () => axis(0), noWarnings);
      assert.equal(result.mode, 'hybrid', query);
    }
    assert.deepEqual(bm25Search(corpus.db, '---', 20), [], 'no terms, no query');
    assert.deepEqual(bm25Search(corpus.db, 'SAFFIRE-T', 20), [1]);
  });
});

test('an exact term ranks its chunk first even when the vector points elsewhere', async () => {
  await withCorpus(async (corpus) => {
    // The vector points at the fact sheet chunk (id 4); only chunk 1 contains SAFFIRE-T.
    const { mode, hits } = await search(corpus, 'SAFFIRE-T', async () => axis(3), noWarnings);

    assert.equal(mode, 'hybrid');
    assert.equal(hits[0].chunkId, 'PSI-1:card#0000');
    assert.deepEqual(hits[0].methods, ['bm25', 'vector']);
    assert.equal(hits[1].id, 4, 'the vector favourite comes second');
    assert.deepEqual(hits[1].methods, ['vector']);
    assert.equal(hits[1].similarity, 1);
  });
});

test('hybrid: a chunk found by both methods outranks one found by a single method', async () => {
  await withCorpus(
    async (corpus) => {
      const query = 'SAFFIRE-T airflow';
      const matches = bm25Search(corpus.db, query, 10);
      assert.equal(matches.length, 2, 'two chunks contain a query term');
      const [first, second] = matches;
      const other = CHUNKS.find((chunk) => !matches.includes(chunk.id))!.id;

      // Vectors rank BM25's runner-up first and an unrelated chunk second.
      const vector = blend(vectorOf(second), vectorOf(other));
      const { mode, hits } = await search(corpus, query, async () => vector, noWarnings);

      assert.equal(mode, 'hybrid');
      assert.deepEqual(
        hits.map((hit) => [hit.id, hit.methods]),
        [
          [second, ['bm25', 'vector']],
          [first, ['bm25']],
        ],
      );
      assert.equal(hits[0].score, 1 / 62 + 1 / 61, 'bm25 rank 2 + vector rank 1');
      assert.equal(hits[1].score, 1 / 61, 'bm25 rank 1 only');
      assert.equal(hits[0].similarity, 0.894);
      assert.equal(hits[1].similarity, null);
    },
    { patchInfo: (info) => Object.assign(info.search, { k: 2, candidates_per_method: 2 }) },
  );
});

test('rrf sums 1 / (rrf_k + rank) and keeps first-seen order on ties, like search.py', () => {
  assert.deepEqual(rrf([[1, 2], [3, 1]], 60), [
    [1, 1 / 61 + 1 / 62],
    [3, 1 / 61],
    [2, 1 / 62],
  ]);
  // Ties are not broken by id: BM25's list (first) wins, then vector order.
  assert.deepEqual(
    rrf([[9, 2], [4, 1]], 60).map(([id]) => id),
    [9, 4, 2, 1],
  );
  assert.deepEqual(rrf([[], []], 60), []);
});

test('each method fetches max(candidates_per_method, k) candidates, like search.py', async () => {
  await withCorpus(
    async (corpus) => {
      const { hits } = await search(corpus, '', async () => axis(0), noWarnings);
      assert.equal(hits.length, 3);
    },
    { patchInfo: (info) => Object.assign(info.search, { k: 3, candidates_per_method: 1 }) },
  );
});

test('when embedding fails, search warns once and answers with BM25 alone', async () => {
  await withCorpus(async (corpus) => {
    const warnings: string[] = [];
    const { mode, hits } = await search(corpus, 'SAFFIRE-T fabric', failingEmbed, (message) =>
      warnings.push(message),
    );

    assert.equal(mode, 'bm25');
    assert.deepEqual(hits.map((hit) => hit.id), [1]);
    assert.deepEqual(hits[0].methods, ['bm25']);
    assert.equal(hits[0].similarity, null);
    assert.equal(hits[0].score, 1 / 61);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /BM25 only: embedding engine returned 503: model not loaded/);
  });
});

test('every embed failure falls back: engine down, HTTP error, wrong model, wrong dimension', async () => {
  // A port that was just freed: connecting to it is refused.
  const closed = createServer();
  await new Promise<void>((resolve) => closed.listen(0, '127.0.0.1', resolve));
  const { port } = closed.address() as AddressInfo;
  await new Promise<void>((resolve) => closed.close(() => resolve()));

  const cases: Array<[string, Parameters<typeof withEngine>[0] | null, RegExp]> = [
    ['engine down', null, /fetch failed \(.*ECONNREFUSED/],
    ['5xx', (_req, res) => sendJson(res, 500, { detail: 'boom' }), /returned 500/],
    ['4xx', embedHandler(), /returned 422/],
    ['wrong model', embedHandler({ modelId: 'other/model' }), /runs model other\/model/],
    ['wrong dimension', embedHandler({ vectorFor: () => [1, 0, 0] }), /returned 3 dims/],
  ];

  await withCorpus(async (corpus) => {
    for (const [label, handler, cause] of cases) {
      const run = async (engineUrl: string) => {
        const warnings: string[] = [];
        // embed() truncates long text, so a blank query is what earns the engine's 422.
        const query = label === '4xx' ? ' ' : 'SAFFIRE-T';
        const { mode, hits } = await search(
          corpus,
          query,
          (text) => embed(text, { engineUrl, modelId: MODEL_ID, dimension: DIM }),
          (message) => warnings.push(message),
        );
        assert.equal(mode, 'bm25', label);
        assert.deepEqual(hits.map((hit) => hit.id), query === ' ' ? [] : [1], label);
        assert.equal(warnings.length, 1, label);
        assert.match(warnings[0], cause, label);
      };
      if (handler) await withEngine(handler, run);
      else await run(`http://127.0.0.1:${port}`);
    }
  });
});

test('both methods empty: no hits', async () => {
  await withCorpus(
    async (corpus) => {
      const result = await search(corpus, 'zeppelin quasar', async () => axis(0), noWarnings);
      assert.deepEqual(result, { mode: 'hybrid', hits: [] });
    },
    { withoutVectors: true },
  );
});

test('search reads k from corpus_info, not from a constant', async () => {
  await withCorpus(async (corpus) => {
    const { hits } = await search(corpus, 'flames in microgravity', async () => axis(0), noWarnings);
    assert.equal(hits.length, SEARCH_K);
  });
});

test('ftsQuery leaves out the stopwords, like search.py', () => {
  const stopwords = new Set(['why', 'does', 'a', 'in', 'what', 'is', 'it']);
  assert.equal(
    ftsQuery('Why does a flame become spherical in microgravity?', stopwords),
    '"flame" OR "become" OR "spherical" OR "microgravity"',
  );
  assert.equal(ftsQuery('what is it', stopwords), null, 'nothing left: no BM25 query');
  assert.equal(ftsQuery('what is it'), '"what" OR "is" OR "it"', 'no stopwords given: every term');
});

test('search takes the BM25 stopwords from corpus_info.search', async () => {
  // 'a' is in chunks 2 and 5; 'cabin' only in chunk 5.
  await withCorpus(async (corpus) => {
    assert.deepEqual(corpus.info.search.bm25_stopwords, [], 'a corpus without the key has no stopwords');
    const { hits } = await search(corpus, 'a cabin', failingEmbed, () => {});
    assert.deepEqual(hits.map((hit) => hit.id), [5, 2]);
  });
  await withCorpus(
    async (corpus) => {
      const { hits } = await search(corpus, 'a cabin', failingEmbed, () => {});
      assert.deepEqual(hits.map((hit) => hit.id), [5]);
      assert.deepEqual(bm25Search(corpus.db, 'a', 20, new Set(corpus.info.search.bm25_stopwords)), []);
    },
    { patchInfo: (info) => (info.search.bm25_stopwords = ['a']) },
  );
});

test('limitPerDoc keeps each document\'s best chunks, like search.py limit_per_doc', () => {
  const docOf = new Map([[1, 'thesis'], [2, 'thesis'], [3, 'thesis'], [4, 'card'], [5, 'thesis'], [6, 'sheet']]);
  const ranking: Array<[number, number]> = [[1, 0.6], [2, 0.5], [3, 0.4], [4, 0.3], [5, 0.2], [6, 0.1]];
  const ids = (entries: Array<[number, number]>) => entries.map(([id]) => id);
  assert.deepEqual(ids(limitPerDoc(ranking, docOf, 2, 3)), [1, 2, 4]);
  assert.deepEqual(ids(limitPerDoc(ranking, docOf, 1, 5)), [1, 4, 6], 'fewer than k when candidates run out');
  assert.deepEqual(limitPerDoc(ranking, docOf, null, 3), ranking.slice(0, 3));
  assert.deepEqual(limitPerDoc(ranking, docOf, 0, 3), ranking.slice(0, 3), '0 = no limit');
});

test('search keeps at most max_chunks_per_doc chunks of one document', async () => {
  // The vectors rank the card's two chunks (1, 2) first, then the fact sheet (4), then the test sheet (3).
  const vector = weighted({ 0: 4, 1: 3, 3: 2, 2: 1 });
  await withCorpus(async (corpus) => {
    assert.equal(corpus.info.search.max_chunks_per_doc, null, 'a corpus without the key has no limit');
    const { hits } = await search(corpus, NO_BM25_MATCH, async () => vector, noWarnings);
    assert.deepEqual(hits.map((hit) => hit.id), [1, 2, 4]);
  });
  await withCorpus(
    async (corpus) => {
      const { hits } = await search(corpus, NO_BM25_MATCH, async () => vector, noWarnings);
      assert.deepEqual(hits.map((hit) => [hit.id, hit.docId]), [
        [1, 'PSI-1:card'],
        [4, 'ext:factsheet-fire'],
        [3, 'PSI-2:test-a'],
      ]);
    },
    { patchInfo: (info) => (info.search.max_chunks_per_doc = 1) },
  );
});
