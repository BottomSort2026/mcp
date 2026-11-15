import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { countChunks, openCorpus } from '../src/db.ts';
import { search } from '../src/rag.ts';

// The index built by the train repo. No network: the query vector is read back
// from chunks_vec instead of asking the engine.
const CORPUS = fileURLToPath(new URL('../storage/corpus.db', import.meta.url));

const noWarnings = (message: string) => assert.fail(`unexpected warning: ${message}`);

test('real corpus.db: a stored vector finds its own chunk with its metadata', async () => {
  const warnings: string[] = [];
  const corpus = openCorpus(CORPUS, { warn: (message) => warnings.push(message) });
  const { db, info } = corpus;
  try {
    assert.deepEqual(warnings, [], 'sqlite-vec matches the build version');
    assert.equal(info.embedding.model_id, 'BAAI/bge-small-en-v1.5');
    assert.equal(info.embedding.dimension, 384);
    assert.equal(countChunks(db), info.counts.chunks);

    // One chunk of an external resource, one of a PSI investigation with an acronym.
    const picks = db
      .prepare(
        `SELECT min(c.id) AS id FROM chunks c JOIN documents d USING (doc_id)
          WHERE d.accession IS NULL
         UNION ALL
         SELECT min(c.id) FROM chunks c JOIN documents d USING (doc_id)
           JOIN investigations i USING (accession)
          WHERE i.acronym IS NOT NULL`,
      )
      .all()
      .map((row) => Number(row.id));
    assert.equal(picks.length, 2);

    for (const id of picks) {
      const stored = db
        .prepare('SELECT vec_to_json(embedding) AS v FROM chunks_vec WHERE rowid = ?')
        .get(BigInt(id)) as { v: string };
      const vector = JSON.parse(stored.v) as number[];
      assert.equal(vector.length, info.embedding.dimension);

      // An empty query has no BM25 terms, so the ranking is the vectors' alone.
      const { mode, hits } = await search(corpus, '', async () => vector, noWarnings);
      assert.equal(mode, 'hybrid');
      assert.equal(hits.length, info.search.k);
      assert.deepEqual(hits[0].methods, ['vector']);

      const expected = db
        .prepare(
          `SELECT c.chunk_id, c.text, c.page, c.page_end, d.doc_id, d.title, d.doc_type,
                  d.public_url, d.accession, d.related_accessions, i.acronym, i.investigation_url
             FROM chunks c JOIN documents d USING (doc_id)
             LEFT JOIN investigations i USING (accession)
            WHERE c.id = ?`,
        )
        .get(id) as Record<string, string | number | null>;

      const [top] = hits;
      assert.equal(top.id, id);
      assert.equal(top.similarity, 1);
      assert.ok(hits[1].similarity !== null && hits[1].similarity < 1);
      assert.deepEqual(
        {
          chunkId: top.chunkId,
          text: top.text,
          page: top.page,
          pageEnd: top.pageEnd,
          docId: top.docId,
          title: top.title,
          docType: top.docType,
          publicUrl: top.publicUrl,
          accession: top.accession,
          relatedAccessions: top.relatedAccessions,
          acronym: top.acronym,
          investigationUrl: top.investigationUrl,
        },
        {
          chunkId: expected.chunk_id,
          text: expected.text,
          page: expected.page,
          pageEnd: expected.page_end,
          docId: expected.doc_id,
          title: expected.title,
          docType: expected.doc_type,
          publicUrl: expected.public_url,
          accession: expected.accession,
          relatedAccessions: JSON.parse(String(expected.related_accessions)),
          acronym: expected.acronym,
          investigationUrl: expected.investigation_url,
        },
      );

      // External resources link to a public URL; PSI chunks to their investigation.
      if (top.accession === null) {
        assert.ok(top.publicUrl);
        assert.equal(top.acronym, null);
      } else {
        assert.ok(top.investigationUrl);
        assert.ok(top.acronym);
      }
    }
  } finally {
    db.close();
  }
});

test('real corpus.db: with the engine down, BM25 finds SAFFIRE-III in PSI-100', async () => {
  const corpus = openCorpus(CORPUS, { warn: noWarnings });
  try {
    const warnings: string[] = [];
    const { mode, hits } = await search(
      corpus,
      'SAFFIRE-III',
      async () => {
        throw new Error('fetch failed');
      },
      (message) => warnings.push(message),
    );

    assert.equal(mode, 'bm25');
    assert.equal(warnings.length, 1);
    // BM25 alone returns only chunks that contain the term, so possibly fewer than k.
    assert.ok(hits.length > 0 && hits.length <= corpus.info.search.k);
    assert.equal(hits[0].accession, 'PSI-100');
    assert.deepEqual(hits[0].methods, ['bm25']);
    assert.equal(hits[0].similarity, null);
  } finally {
    corpus.db.close();
  }
});
