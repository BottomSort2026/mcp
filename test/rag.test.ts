import assert from 'node:assert/strict';
import test from 'node:test';
import { countChunks, openDb } from '../src/db.ts';
import { embed } from '../src/embeddings.ts';
import { search } from '../src/rag.ts';
import { axis, DIM, ROWS, withEngine, withIndex, readJson } from './fixtures.ts';

test('search returns nearest chunks and respects k', async () => {
  await withIndex(async (path) => {
    const db = openDb(path, DIM);
    try {
      const hits = await search(db, 'cats', 2, async () => axis(0));

      assert.equal(hits.length, 2);
      assert.equal(hits[0].documentId, 'doc-0');
      assert.equal(hits[0].content, 'cats are small mammals');
      assert.equal(hits[0].seq, 0);
      assert.equal(hits[0].score, 1);
      assert.ok(hits[1].score < hits[0].score);

      assert.equal((await search(db, 'cats', 1, async () => axis(0))).length, 1);
      assert.equal(countChunks(db), ROWS.length, 'search must not write rows');
    } finally {
      db.close();
    }
  });
});

test('openDb fails fast when the index dimension differs from EMBED_DIM', async () => {
  await withIndex(async (path) => {
    assert.throws(() => openDb(path, DIM + 1), /EMBED_DIM/);
  });
});

test('openDb fails when the index file is missing', () => {
  assert.throws(
    () => openDb(new URL('../test/missing-index.db', import.meta.url).pathname, DIM),
    /index not found/,
  );
});

test('embed posts the query to the engine and returns its vector', async () => {
  let seen: { body: unknown; auth?: string } | undefined;
  await withEngine(
    async (req, res) => {
      seen = { body: await readJson(req), auth: req.headers.authorization };
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ embedding: axis(3) }] }));
    },
    async (url) => {
      const vector = await embed('hello', {
        url,
        model: 'text-embedding-3-small',
        dim: DIM,
      });
      assert.deepEqual(vector, axis(3));
      assert.deepEqual(seen?.body, { model: 'text-embedding-3-small', input: ['hello'] });
      assert.equal(seen?.auth, undefined, 'no auth header without a key');
    },
  );
});

test('embed rejects a vector whose dimension differs from EMBED_DIM', async () => {
  await withEngine(
    (_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ embedding: [1, 0, 0] }] }));
    },
    async (url) => {
      await assert.rejects(embed('hello', { url, model: 'm', dim: DIM }), /EMBED_DIM=8/);
    },
  );
});

test('embed surfaces engine failures', async () => {
  await withEngine(
    (_req, res) => {
      res.writeHead(503, { 'content-type': 'text/plain' });
      res.end('model not loaded');
    },
    async (url) => {
      await assert.rejects(embed('hello', { url, model: 'm', dim: DIM }), /503/);
    },
  );
});
