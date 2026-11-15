import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';

// sqlite-vec ships prebuilt binaries and no type declarations.
const { getLoadablePath } = createRequire(import.meta.url)('sqlite-vec') as {
  getLoadablePath: () => string;
};

/** Tables created by the train repo's schema.sql (flame/corpus/schema.sql). */
export const REQUIRED_TABLES = [
  'investigations',
  'documents',
  'chunks',
  'chunks_vec',
  'chunks_fts',
  'corpus_info',
] as const;

// corpus_info as written by the train repo: one row per key, every value JSON-encoded.
const CorpusInfoSchema = z.object({
  schema_version: z.number().int(),
  corpus_name: z.string(),
  description: z.string(),
  built_at: z.string(),
  build_stages: z.array(z.number().int()),
  embedding: z.object({
    model_id: z.string().min(1),
    revision: z.string().nullable(),
    dimension: z.number().int().positive(),
    normalize: z.boolean(),
    max_length: z.number().int().positive(),
    query_prefix: z.string(),
    document_prefix: z.string(),
    resolved_revision: z.string().nullable(),
  }),
  search: z.object({
    k: z.number().int().positive(),
    candidates_per_method: z.number().int().positive(),
    // The only fusion src/rag.ts implements.
    fusion: z.literal('rrf'),
    rrf_k: z.number().int().positive(),
    fts_tokenizer: z.string(),
    // Added with the stage-1 corpus. Corpora built before have neither key: no limit, no stopwords.
    /** At most this many chunks of one document in the k results; null = no limit. */
    max_chunks_per_doc: z.number().int().positive().nullable().default(null),
    /** Lowercased terms BM25 leaves out of the query. */
    bm25_stopwords: z.array(z.string()).default([]),
  }),
  counts: z.object({
    investigations: z.number().int(),
    documents: z.number().int(),
    chunks: z.number().int(),
  }),
  sqlite_vec_version: z.string(),
  vector_distance: z.string(),
});

export type CorpusInfo = z.infer<typeof CorpusInfoSchema>;

/** The read-only handle plus the build's own description of the index. */
export type Corpus = { db: DatabaseSync; info: CorpusInfo };

export type OpenOptions = { warn?: (message: string) => void };

export function loadVectorExtension(db: DatabaseSync): void {
  db.loadExtension(getLoadablePath());
}

/**
 * Opens a corpus.db built by the train repo. Read-only: this process never
 * creates tables or writes rows. Fails when the file does not match the schema
 * contract; warns when it was built with another sqlite-vec version.
 */
export function openCorpus(path: string, options: OpenOptions = {}): Corpus {
  if (!existsSync(path)) {
    throw new Error(`corpus not found: ${path}. Build it with the train repo or set CORPUS_PATH`);
  }

  const db = new DatabaseSync(path, { readOnly: true, allowExtension: true });
  try {
    loadVectorExtension(db);
    checkTables(db, path);
    const info = readInfo(db);
    checkVectors(db, info, options.warn ?? console.warn);
    return { db, info };
  } catch (error) {
    db.close();
    throw error;
  }
}

export function countChunks(db: DatabaseSync): number {
  const row = db.prepare('SELECT count(*) AS c FROM chunks').get() as { c: number };
  return Number(row.c);
}

function checkTables(db: DatabaseSync, path: string): void {
  // Virtual tables (vec0, fts5) are listed with type 'table' too.
  const present = new Set(
    db
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table'")
      .all()
      .map((row) => String(row.name)),
  );
  const missing = REQUIRED_TABLES.filter((name) => !present.has(name));
  if (missing.length > 0) {
    throw new Error(
      `corpus ${path} is missing tables: ${missing.join(', ')}. Rebuild it with the train repo`,
    );
  }
}

function readInfo(db: DatabaseSync): CorpusInfo {
  const raw: Record<string, unknown> = {};
  for (const row of db.prepare('SELECT key, value FROM corpus_info').all()) {
    const key = String(row.key);
    try {
      raw[key] = JSON.parse(String(row.value));
    } catch {
      throw new Error(`corpus_info.${key} is not valid JSON`);
    }
  }

  const parsed = CorpusInfoSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `corpus_info.${issue.path.map(String).join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`corpus_info does not match the contract: ${problems}`);
  }
  return parsed.data;
}

function checkVectors(db: DatabaseSync, info: CorpusInfo, warn: (message: string) => void): void {
  const stored = storedDim(db);
  if (stored !== info.embedding.dimension) {
    throw new Error(
      `chunks_vec stores ${stored}-dim vectors but corpus_info.embedding.dimension is ${info.embedding.dimension}`,
    );
  }

  const row = db.prepare('SELECT vec_version() AS v').get() as { v: string };
  if (row.v !== info.sqlite_vec_version) {
    warn(
      `sqlite-vec ${row.v} is loaded but the corpus was built with ${info.sqlite_vec_version}`,
    );
  }
}

// Stored vectors are the source of truth; the DDL is only a fallback for an
// index with no rows yet.
function storedDim(db: DatabaseSync): number {
  const row = db.prepare('SELECT vec_length(embedding) AS dim FROM chunks_vec LIMIT 1').get() as
    | { dim?: number }
    | undefined;
  if (row?.dim) return Number(row.dim);

  const table = db
    .prepare("SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'chunks_vec'")
    .get() as { sql?: string } | undefined;
  const match = /float\s*\[\s*(\d+)\s*\]/i.exec(table?.sql ?? '');
  if (!match) throw new Error('cannot read the vector dimension from the chunks_vec schema');
  return Number(match[1]);
}
