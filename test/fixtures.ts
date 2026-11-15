import { mkdtempSync, rmSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { loadVectorExtension } from '../src/db.ts';

// 8 dimensions keep test vectors readable; the real corpus stores 384.
export const DIM = 8;
export const MODEL_ID = 'test/embedder-8d';
export const SEARCH_K = 3;

export const axis = (index: number): number[] =>
  Array.from({ length: DIM }, (_, position) => (position === index ? 1 : 0));

/**
 * A unit query vector that ranks chunks by weight: weighted({ 3: 3, 0: 2, 2: 1 })
 * finds axis 3, then 0, then 2, with no ties among them.
 */
export function weighted(weights: Record<number, number>): number[] {
  const raw = Array.from({ length: DIM }, (_, position) => weights[position] ?? 0);
  const norm = Math.hypot(...raw);
  return raw.map((value) => value / norm);
}

/** Matches no chunk text, so BM25 contributes nothing and the vector decides the order. */
export const NO_BM25_MATCH = 'zeppelin quasar';

export const INVESTIGATIONS = [
  {
    accession: 'PSI-1',
    acronym: 'SAFFIRE-T',
    title: 'Spacecraft Fire Test',
    fire_relevance: 3,
    investigation_url: 'https://psi.example/investigations/PSI-1',
  },
  {
    accession: 'PSI-2',
    acronym: null,
    title: 'Droplet Burning Test',
    fire_relevance: 2,
    investigation_url: 'https://psi.example/investigations/PSI-2',
  },
];

export const DOCUMENTS = [
  {
    doc_id: 'PSI-1:card',
    source: 'psi_card',
    accession: 'PSI-1',
    related_accessions: [],
    doc_type: 'metadata',
    title: 'Spacecraft Fire Test',
    authors: null,
    year: null,
    file_name: null,
    psi_folder: null,
    public_url: null,
  },
  {
    doc_id: 'PSI-2:test-a',
    source: 'psi_file',
    accession: 'PSI-2',
    related_accessions: [],
    doc_type: 'testsheet',
    title: 'Droplet test sheet A',
    authors: null,
    year: 2019,
    file_name: 'test_a.csv',
    psi_folder: 'Data/Tests',
    public_url: null,
  },
  {
    doc_id: 'ext:factsheet-fire',
    source: 'external',
    accession: null,
    related_accessions: ['PSI-1', 'PSI-2'],
    doc_type: 'factsheet',
    title: 'Fire in Space Fact Sheet',
    authors: 'NASA',
    year: 2020,
    file_name: null,
    psi_folder: null,
    public_url: 'https://nasa.example/fire-fact-sheet.pdf',
  },
];

// Each chunk's vector is one axis, so a query on axis(n) finds exactly one chunk.
export const CHUNKS = [
  // 'SAFFIRE-T' appears in this chunk only: the exact-term case for BM25.
  { id: 1, doc_id: 'PSI-1:card', chunk_index: 0, page: null, page_end: null, text: 'SAFFIRE-T burned cotton and fiberglass fabric in microgravity', vector: axis(0) },
  { id: 2, doc_id: 'PSI-1:card', chunk_index: 1, page: null, page_end: null, text: 'flame spread against a slow opposed airflow', vector: axis(1) },
  { id: 3, doc_id: 'PSI-2:test-a', chunk_index: 0, page: null, page_end: null, text: 'heptane droplet diameter shrank during burning', vector: axis(2) },
  { id: 4, doc_id: 'ext:factsheet-fire', chunk_index: 0, page: 1, page_end: 2, text: 'fires in space form spherical flames', vector: axis(3) },
  { id: 5, doc_id: 'ext:factsheet-fire', chunk_index: 1, page: 3, page_end: 3, text: 'crew response to a cabin fire', vector: axis(4) },
].map((chunk) => ({ ...chunk, chunk_id: `${chunk.doc_id}#${String(chunk.chunk_index).padStart(4, '0')}` }));

// train/src/flame/corpus/schema.sql with {dimension} and {fts_tokenizer} filled in.
const schema = (dim: number) => `
  CREATE TABLE corpus_info (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE investigations (
      accession         TEXT PRIMARY KEY,
      acronym           TEXT,
      title             TEXT NOT NULL,
      fire_relevance    INTEGER NOT NULL CHECK (fire_relevance BETWEEN 1 AND 3),
      investigation_url TEXT NOT NULL,
      metadata_json     TEXT NOT NULL
  );
  CREATE TABLE documents (
      doc_id             TEXT PRIMARY KEY,
      source             TEXT NOT NULL CHECK (source IN ('psi_card', 'psi_file', 'external')),
      accession          TEXT REFERENCES investigations(accession),
      related_accessions TEXT NOT NULL DEFAULT '[]',
      doc_type           TEXT NOT NULL,
      ingest_stage       INTEGER NOT NULL,
      title              TEXT NOT NULL,
      authors            TEXT,
      year               INTEGER,
      file_name          TEXT,
      psi_folder         TEXT,
      public_url         TEXT
  );
  CREATE TABLE chunks (
      id          INTEGER PRIMARY KEY,
      chunk_id    TEXT NOT NULL UNIQUE,
      doc_id      TEXT NOT NULL REFERENCES documents(doc_id),
      chunk_index INTEGER NOT NULL,
      page        INTEGER,
      page_end    INTEGER,
      text        TEXT NOT NULL,
      n_tokens    INTEGER NOT NULL
  );
  CREATE VIRTUAL TABLE chunks_fts USING fts5(
      text, content='chunks', content_rowid='id',
      tokenize='porter unicode61 remove_diacritics 2'
  );
  CREATE VIRTUAL TABLE chunks_vec USING vec0(embedding float[${dim}]);
`;

export type CorpusInfoFixture = Record<string, any>;

function corpusInfo(vecVersion: string): CorpusInfoFixture {
  return {
    schema_version: 1,
    corpus_name: 'fixture',
    description: 'test corpus',
    built_at: '2026-11-15T00:00:00+00:00',
    build_stages: [0],
    embedding: {
      model_id: MODEL_ID,
      revision: null,
      dimension: DIM,
      normalize: true,
      max_length: 512,
      query_prefix: 'query: ',
      document_prefix: '',
      resolved_revision: null,
    },
    search: {
      k: SEARCH_K,
      candidates_per_method: 20,
      fusion: 'rrf',
      rrf_k: 60,
      fts_tokenizer: 'porter unicode61 remove_diacritics 2',
    },
    counts: {
      investigations: INVESTIGATIONS.length,
      documents: DOCUMENTS.length,
      chunks: CHUNKS.length,
    },
    sqlite_vec_version: vecVersion,
    vector_distance: 'L2 on L2-normalized vectors; cosine similarity = 1 - distance^2 / 2',
  };
}

export type IndexOptions = {
  /** Edit corpus_info before it is written. */
  patchInfo?: (info: CorpusInfoFixture) => void;
  /** Tables dropped once the build is done. */
  drop?: string[];
  /** Leave chunks_vec empty, so vector search finds nothing. */
  withoutVectors?: boolean;
};

// Stands in for the train repo: writes the corpus once, then hands over a
// read-only file.
export function createIndex(path: string, options: IndexOptions = {}): void {
  const db = new DatabaseSync(path, { allowExtension: true });
  loadVectorExtension(db);
  db.exec(schema(DIM));

  const investigation = db.prepare('INSERT INTO investigations VALUES (?, ?, ?, ?, ?, ?)');
  for (const i of INVESTIGATIONS) {
    investigation.run(i.accession, i.acronym, i.title, i.fire_relevance, i.investigation_url, '{}');
  }

  const document = db.prepare('INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const d of DOCUMENTS) {
    document.run(
      d.doc_id, d.source, d.accession, JSON.stringify(d.related_accessions), d.doc_type, 0,
      d.title, d.authors, d.year, d.file_name, d.psi_folder, d.public_url,
    );
  }

  const chunk = db.prepare('INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  // vec0 accepts only integer rowids, so they bind as BigInt.
  const vector = db.prepare('INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)');
  for (const c of CHUNKS) {
    chunk.run(c.id, c.chunk_id, c.doc_id, c.chunk_index, c.page, c.page_end, c.text, c.text.split(' ').length);
    if (!options.withoutVectors) vector.run(BigInt(c.id), JSON.stringify(c.vector));
  }
  db.exec("INSERT INTO chunks_fts(chunks_fts) VALUES ('rebuild')");

  const { v } = db.prepare('SELECT vec_version() AS v').get() as { v: string };
  const info = corpusInfo(v);
  options.patchInfo?.(info);
  const entry = db.prepare('INSERT INTO corpus_info VALUES (?, ?)');
  for (const [key, value] of Object.entries(info)) entry.run(key, JSON.stringify(value));

  // node:sqlite enforces foreign keys, which would block dropping a referenced table.
  db.exec('PRAGMA foreign_keys = OFF');
  for (const table of options.drop ?? []) db.exec(`DROP TABLE ${table}`);
  db.close();
}

export async function withIndex<T>(
  run: (path: string) => Promise<T>,
  options: IndexOptions = {},
): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-rag-'));
  const path = join(dir, 'corpus.db');
  createIndex(path, options);
  try {
    return await run(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Body of a successful engine POST /embed. */
export const embedResponse = (vector: number[], modelId = MODEL_ID) => ({
  embedding: vector,
  dimension: vector.length,
  model_id: modelId,
  revision: null,
});

/**
 * Mock of the engine's /embed: { text } -> embedResponse, and 422 for a missing
 * or blank text or more than 2000 characters, as the engine does.
 */
export function embedHandler(
  options: { vectorFor?: (text: string) => number[]; modelId?: string; seen?: string[] } = {},
) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'POST' || req.url !== '/embed') {
      res.writeHead(404).end();
      return;
    }
    const body = (await readJson(req)) as { text?: unknown };
    const text = body.text;
    if (typeof text !== 'string' || !text.trim() || Array.from(text).length > 2000) {
      sendJson(res, 422, { detail: 'text must be 1 to 2000 characters' });
      return;
    }
    options.seen?.push(text);
    sendJson(res, 200, embedResponse(options.vectorFor?.(text) ?? axis(0), options.modelId));
  };
}

/** Runs a throwaway HTTP server and hands its base URL (no trailing slash) to `run`. */
export async function withEngine(
  handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = createServer((req, res) => void handler(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

export function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}

export function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body ? JSON.parse(body) : {}));
  });
}
