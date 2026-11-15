import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { countChunks, openCorpus, REQUIRED_TABLES } from '../src/db.ts';
import { embed } from '../src/embeddings.ts';
import { search, similarity } from '../src/rag.ts';
import {
  axis,
  CHUNKS,
  DIM,
  embedHandler,
  embedResponse,
  MODEL_ID,
  readJson,
  SEARCH_K,
  sendJson,
  withEngine,
  withIndex,
} from './fixtures.ts';

const engine = (engineUrl: string) => ({ engineUrl, modelId: MODEL_ID, dimension: DIM });

// An empty query has no BM25 terms, so these hits come from the vectors alone.
const VECTOR_ONLY = '';
const noWarnings = (message: string) => assert.fail(`unexpected warning: ${message}`);

test('search hydrates hits with their document metadata, k from corpus_info', async () => {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    const { db } = corpus;
    try {
      const { mode, hits } = await search(corpus, VECTOR_ONLY, async () => axis(3), noWarnings);

      assert.equal(mode, 'hybrid');
      assert.equal(hits.length, SEARCH_K);
      assert.deepEqual(hits[0], {
        id: 4,
        chunkId: 'ext:factsheet-fire#0000',
        text: 'fires in space form spherical flames',
        page: 1,
        pageEnd: 2,
        docId: 'ext:factsheet-fire',
        title: 'Fire in Space Fact Sheet',
        authors: 'NASA',
        year: 2020,
        docType: 'factsheet',
        fileName: null,
        psiFolder: null,
        publicUrl: 'https://nasa.example/fire-fact-sheet.pdf',
        accession: null,
        relatedAccessions: ['PSI-1', 'PSI-2'],
        acronym: null,
        investigationUrl: null,
        fireRelevance: null,
        score: 1 / 61,
        similarity: 1,
        methods: ['vector'],
      });
      // Orthogonal unit vectors: L2 distance √2, cosine similarity 0.
      assert.equal(hits[1].similarity, 0);
      assert.equal(countChunks(db), CHUNKS.length, 'search must not write rows');
    } finally {
      db.close();
    }
  });

  await withIndex(
    async (path) => {
      const corpus = openCorpus(path);
      try {
        const { hits } = await search(corpus, VECTOR_ONLY, async () => axis(3), noWarnings);
        assert.deepEqual(hits.map((hit) => hit.id), [4]);
      } finally {
        corpus.db.close();
      }
    },
    { patchInfo: (info) => (info.search.k = 1) },
  );
});

test('a PSI hit carries its investigation; page and acronym may be NULL', async () => {
  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    const { db } = corpus;
    try {
      const search1 = async (vector: number[]) =>
        (await search(corpus, VECTOR_ONLY, async () => vector, noWarnings)).hits[0];

      const testsheet = await search1(axis(2));
      assert.equal(testsheet.chunkId, 'PSI-2:test-a#0000');
      assert.equal(testsheet.accession, 'PSI-2');
      assert.equal(testsheet.acronym, null);
      assert.equal(testsheet.investigationUrl, 'https://psi.example/investigations/PSI-2');
      assert.equal(testsheet.page, null);
      assert.equal(testsheet.pageEnd, null);
      assert.equal(testsheet.fileName, 'test_a.csv');
      assert.equal(testsheet.psiFolder, 'Data/Tests');
      assert.deepEqual(testsheet.relatedAccessions, []);
      assert.equal(testsheet.fireRelevance, 2);

      const card = await search1(axis(0));
      assert.equal(card.acronym, 'SAFFIRE-T');
      assert.equal(card.docType, 'metadata');
      assert.equal(card.fireRelevance, 3);
    } finally {
      db.close();
    }
  });
});

test('similarity of an identical vector is 1', async () => {
  assert.equal(similarity(0), 1);
  assert.equal(similarity(Math.SQRT2), 0);

  await withIndex(async (path) => {
    const corpus = openCorpus(path);
    try {
      for (const chunk of CHUNKS) {
        const [hit] = (await search(corpus, VECTOR_ONLY, async () => chunk.vector, noWarnings)).hits;
        assert.equal(hit.id, chunk.id);
        assert.equal(hit.similarity, 1);
      }
    } finally {
      corpus.db.close();
    }
  });
});

test('the fixture keeps chunks_fts and chunks_vec on the chunks rowid', async () => {
  await withIndex(async (path) => {
    const { db } = openCorpus(path);
    try {
      const fts = db
        .prepare("SELECT rowid FROM chunks_fts WHERE chunks_fts MATCH 'droplet' ")
        .all()
        .map((row) => Number(row.rowid));
      assert.deepEqual(fts, [3]);
      const vec = db
        .prepare('SELECT rowid FROM chunks_vec ORDER BY rowid')
        .all()
        .map((row) => Number(row.rowid));
      assert.deepEqual(vec, CHUNKS.map((chunk) => chunk.id));
    } finally {
      db.close();
    }
  });
});

test('openCorpus returns the handle with a typed corpus_info', async () => {
  await withIndex(async (path) => {
    const warnings: string[] = [];
    const { db, info } = openCorpus(path, { warn: (message) => warnings.push(message) });
    try {
      assert.equal(info.schema_version, 1);
      assert.equal(info.embedding.model_id, MODEL_ID);
      assert.equal(info.embedding.dimension, DIM);
      assert.equal(info.embedding.revision, null);
      assert.equal(info.search.k, SEARCH_K);
      assert.deepEqual(info.counts, { investigations: 2, documents: 3, chunks: CHUNKS.length });
      assert.deepEqual(warnings, []);
    } finally {
      db.close();
    }
  });
});

test('openCorpus fails at boot when a table is missing, naming it', async () => {
  for (const table of REQUIRED_TABLES) {
    await withIndex(
      async (path) => {
        assert.throws(() => openCorpus(path), {
          message: new RegExp(`missing tables: ${table}\\.`),
        });
      },
      { drop: [table] },
    );
  }

  await withIndex(
    async (path) => {
      assert.throws(() => openCorpus(path), /missing tables: chunks_fts, corpus_info\./);
    },
    { drop: ['corpus_info', 'chunks_fts'] },
  );
});

test('openCorpus fails at boot when chunks_vec and corpus_info disagree on the dimension', async () => {
  await withIndex(
    async (path) => {
      assert.throws(
        () => openCorpus(path),
        /chunks_vec stores 8-dim vectors but corpus_info\.embedding\.dimension is 9/,
      );
    },
    { patchInfo: (info) => (info.embedding.dimension = DIM + 1) },
  );
});

test('openCorpus fails at boot when corpus_info breaks the contract', async () => {
  await withIndex(
    async (path) => {
      assert.throws(() => openCorpus(path), /corpus_info\.search\.k/);
    },
    { patchInfo: (info) => delete info.search.k },
  );
});

test('openCorpus fails at boot on a fusion other than rrf', async () => {
  await withIndex(
    async (path) => {
      assert.throws(() => openCorpus(path), /corpus_info\.search\.fusion/);
    },
    { patchInfo: (info) => (info.search.fusion = 'weighted') },
  );
});

test('openCorpus only warns when sqlite-vec differs from the build version', async () => {
  await withIndex(
    async (path) => {
      const warnings: string[] = [];
      const { db } = openCorpus(path, { warn: (message) => warnings.push(message) });
      db.close();
      assert.equal(warnings.length, 1);
      assert.match(warnings[0], /built with v0\.0\.1/);
    },
    { patchInfo: (info) => (info.sqlite_vec_version = 'v0.0.1') },
  );
});

test('openCorpus fails when the corpus file is missing', () => {
  assert.throws(() => openCorpus(join(tmpdir(), 'mcp-rag-missing.db')), /corpus not found/);
});

test('embed posts the raw text to ENGINE_URL/embed and returns the vector', async () => {
  let seen: { url?: string; body: unknown } | undefined;
  await withEngine(
    async (req, res) => {
      seen = { url: req.url, body: await readJson(req) };
      sendJson(res, 200, embedResponse(axis(3)));
    },
    async (base) => {
      // A trailing slash on ENGINE_URL is tolerated.
      const vector = await embed('how do flames spread', engine(`${base}/`));
      assert.deepEqual(vector, axis(3));
      assert.equal(seen?.url, '/embed');
      assert.deepEqual(seen?.body, { text: 'how do flames spread' });
    },
  );
});

test('embed truncates the text to 2000 characters', async () => {
  const seen: string[] = [];
  await withEngine(embedHandler({ seen }), async (base) => {
    await embed('a'.repeat(5000), engine(base));
    // Astral characters count once, as in the engine, and are never split.
    await embed('🔥'.repeat(2500), engine(base));
  });

  assert.equal(seen[0], 'a'.repeat(2000));
  assert.equal(seen[1], '🔥'.repeat(2000));
});

test('embed rejects a model_id that differs from the corpus', async () => {
  await withEngine(embedHandler({ modelId: 'other/model' }), async (base) => {
    await assert.rejects(
      embed('hello', engine(base)),
      /runs model other\/model but the corpus was built with test\/embedder-8d/,
    );
  });
});

test('embed rejects a vector whose dimension differs from the corpus', async () => {
  await withEngine(embedHandler({ vectorFor: () => [1, 0, 0] }), async (base) => {
    await assert.rejects(embed('hello', engine(base)), /returned 3 dims, the corpus stores 8/);
  });
});

test('embed rejects a non-numeric vector', async () => {
  await withEngine(
    (_req, res) => sendJson(res, 200, { ...embedResponse(axis(0)), embedding: ['0.1', 0] }),
    async (base) => {
      await assert.rejects(embed('hello', engine(base)), /no numeric vector/);
    },
  );
});

test('embed surfaces engine failures', async () => {
  await withEngine(embedHandler(), async (base) => {
    await assert.rejects(embed('   ', engine(base)), /embedding engine returned 422/);
  });
});
