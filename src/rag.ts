import type { DatabaseSync } from 'node:sqlite';
import type { Corpus } from './db.ts';
import { describeError } from './errors.ts';

export type Method = 'bm25' | 'vector';
export type SearchMode = 'hybrid' | 'bm25';

/** One retrieved chunk with the metadata needed to cite it. */
export type SearchHit = {
  /** chunks.id, the rowid shared with chunks_vec and chunks_fts. */
  id: number;
  chunkId: string;
  text: string;
  /** NULL for non-paginated sources (PSI metadata cards and test sheets). */
  page: number | null;
  pageEnd: number | null;
  docId: string;
  title: string;
  authors: string | null;
  year: number | null;
  docType: string;
  fileName: string | null;
  psiFolder: string | null;
  /** Set for external resources only. */
  publicUrl: string | null;
  /** NULL for external resources. */
  accession: string | null;
  relatedAccessions: string[];
  acronym: string | null;
  investigationUrl: string | null;
  fireRelevance: number | null;
  /** Reciprocal rank fusion score: Σ 1 / (rrf_k + rank) over the methods that found it. */
  score: number;
  /** Cosine similarity rounded to 3 decimals, or null when vectors did not find it. */
  similarity: number | null;
  methods: Method[];
};

export type SearchResult = { mode: SearchMode; hits: SearchHit[] };
export type Embed = (text: string) => Promise<number[]>;
export type Warn = (message: string) => void;
export type VectorMatch = { id: number; distance: number };

/**
 * Optional restriction of a search. /chat never passes one; the offline report
 * generator uses it to search inside one investigation or one kind of document.
 */
export type SearchScope = {
  /** Only chunks of documents with this accession (the investigation's own documents). */
  accession?: string;
  /** Only chunks of documents with this doc_type. */
  docType?: string;
  /** Results to return instead of corpus_info.search.k. */
  k?: number;
};

/**
 * Hybrid retrieval, translated from train/src/flame/corpus/search.py: BM25 over
 * chunks_fts and KNN over chunks_vec, fused with reciprocal rank fusion. Every
 * parameter comes from corpus_info.search. When the query cannot be embedded
 * (engine down, timeout, HTTP error, wrong model or dimension) it warns once and
 * answers with BM25 alone.
 *
 * With a scope that filters (accession or docType), both methods run over the
 * scope's chunks only: BM25 restricted to their rowids, and exact L2 distances
 * instead of the vec0 KNN, which cannot filter by a joined column.
 */
export async function search(
  corpus: Corpus,
  query: string,
  embed: Embed,
  warn: Warn,
  scope: SearchScope = {},
): Promise<SearchResult> {
  const { db, info } = corpus;
  const { candidates_per_method, rrf_k } = info.search;
  const k = scope.k ?? info.search.k;
  const n = Math.max(candidates_per_method, k);
  const allowed =
    scope.accession !== undefined || scope.docType !== undefined ? scopeIds(db, scope) : undefined;

  const bm25 = allowed ? bm25SearchIn(db, query, n, allowed) : bm25Search(db, query, n);

  let queryVector: number[] | undefined;
  try {
    queryVector = await embed(query);
  } catch (error) {
    warn(`query embedding failed, searching with BM25 only: ${describeError(error)}`);
  }
  const vector = !queryVector
    ? []
    : allowed
      ? vectorSearchIn(db, queryVector, n, allowed)
      : vectorSearch(db, queryVector, n);

  const fused = rrf([bm25, vector.map((match) => match.id)], rrf_k).slice(0, k);
  const rows = hydrate(db, fused.map(([id]) => id));
  const foundByBm25 = new Set(bm25);
  const distances = new Map(vector.map((match) => [match.id, match.distance]));

  const hits = fused.flatMap(([id, score]): SearchHit[] => {
    const row = rows.get(id);
    if (!row) return [];
    const distance = distances.get(id);
    const methods: Method[] = [];
    if (foundByBm25.has(id)) methods.push('bm25');
    if (distance !== undefined) methods.push('vector');
    return [
      {
        ...toMetadata(row),
        score,
        similarity: distance === undefined ? null : similarity(distance),
        methods,
      },
    ];
  });

  return { mode: queryVector ? 'hybrid' : 'bm25', hits };
}

// search.py's _TERM: runs of ASCII letters and digits that may keep an inner
// '-', '+' or '.', so "SAFFIRE-III" stays one term and FTS5 syntax is dropped.
const TERM = /[A-Za-z0-9][A-Za-z0-9\-+.]*[A-Za-z0-9+]|[A-Za-z0-9]/g;

/**
 * Natural-language query -> FTS5 query: each distinct lowercased term quoted,
 * joined with OR. Null when the text has no terms (an empty MATCH is an error).
 */
export function ftsQuery(text: string): string | null {
  const terms = [...new Set((text.match(TERM) ?? []).map((term) => term.toLowerCase()))];
  if (terms.length === 0) return null;
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(' OR ');
}

/** Chunk ids ranked by bm25 (lower is better), best first. */
export function bm25Search(db: DatabaseSync, query: string, n: number): number[] {
  const match = ftsQuery(query);
  if (match === null) return [];
  return db
    .prepare(
      'SELECT rowid, bm25(chunks_fts) AS score FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT ?',
    )
    .all(match, BigInt(n))
    .map((row) => Number(row.rowid));
}

/** Nearest chunk ids by L2 distance, closest first. */
export function vectorSearch(db: DatabaseSync, vector: number[], n: number): VectorMatch[] {
  return db
    .prepare(
      'SELECT rowid, distance FROM chunks_vec WHERE embedding MATCH ? AND k = ? ORDER BY distance',
    )
    .all(JSON.stringify(vector), BigInt(n))
    .map((row) => ({ id: Number(row.rowid), distance: Number(row.distance) }));
}

/** chunks.id of every chunk inside the scope, in document and chunk order. */
export function scopeIds(db: DatabaseSync, scope: SearchScope): number[] {
  const where: string[] = [];
  const params: string[] = [];
  if (scope.accession !== undefined) {
    where.push('d.accession = ?');
    params.push(scope.accession);
  }
  if (scope.docType !== undefined) {
    where.push('d.doc_type = ?');
    params.push(scope.docType);
  }
  return db
    .prepare(
      `SELECT c.id FROM chunks c JOIN documents d USING (doc_id)
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY c.doc_id, c.chunk_index`,
    )
    .all(...params)
    .map((row) => Number(row.id));
}

/**
 * bm25Search over the given chunk ids only. The ids bind as BigInt: node:sqlite binds a JS
 * number as REAL, and FTS5 ignores a REAL rowid constraint (`MATCH ? AND rowid = 3.0` returns
 * every match), which breaks a single-id scope.
 */
export function bm25SearchIn(db: DatabaseSync, query: string, n: number, ids: number[]): number[] {
  const match = ftsQuery(query);
  if (match === null || ids.length === 0) return [];
  return db
    .prepare(
      `SELECT rowid, bm25(chunks_fts) AS score FROM chunks_fts
        WHERE chunks_fts MATCH ? AND rowid IN (${placeholders(ids)})
        ORDER BY score LIMIT ?`,
    )
    .all(match, ...ids.map(BigInt), BigInt(n))
    .map((row) => Number(row.rowid));
}

/**
 * Exact L2 distances over the given chunk ids, closest first. Used instead of the
 * vec0 KNN when the search is scoped; a scope holds at most a few hundred chunks.
 */
export function vectorSearchIn(
  db: DatabaseSync,
  vector: number[],
  n: number,
  ids: number[],
): VectorMatch[] {
  if (ids.length === 0) return [];
  return db
    .prepare(
      `SELECT rowid, vec_distance_l2(embedding, ?) AS distance FROM chunks_vec
        WHERE rowid IN (${placeholders(ids)})
        ORDER BY distance, rowid LIMIT ?`,
    )
    .all(JSON.stringify(vector), ...ids.map(BigInt), BigInt(n))
    .map((row) => ({ id: Number(row.rowid), distance: Number(row.distance) }));
}

const placeholders = (values: unknown[]): string => values.map(() => '?').join(', ');

/**
 * Reciprocal rank fusion, rank starting at 1. Sorted by score descending; as in
 * search.py (a stable sort of a dict), ties keep first-seen order, so BM25's
 * ranking comes before chunks only the vectors found.
 */
export function rrf(rankings: number[][], rrfK: number): Array<[id: number, score: number]> {
  const scores = new Map<number, number>();
  for (const ranking of rankings) {
    ranking.forEach((id, index) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (rrfK + index + 1));
    });
  }
  return [...scores].sort((a, b) => b[1] - a[1]);
}

/**
 * chunks_vec uses L2 distance over L2-normalized vectors, so
 * cosine similarity = 1 - distance² / 2.
 */
export function similarity(distance: number): number {
  // `|| 0` turns the -0 that rounding can produce into 0.
  return Math.round((1 - (distance * distance) / 2) * 1000) / 1000 || 0;
}

/**
 * Chunks picked by id rather than by a search, in the given order, with the same
 * metadata as search hits and no score (0, no similarity, no methods).
 */
export function chunkHits(db: DatabaseSync, ids: number[]): SearchHit[] {
  const rows = hydrate(db, ids);
  return ids.flatMap((id): SearchHit[] => {
    const row = rows.get(id);
    return row ? [{ ...toMetadata(row), score: 0, similarity: null, methods: [] }] : [];
  });
}

// Text and metadata for the final ids in one query; callers restore the order.
function hydrate(db: DatabaseSync, ids: number[]): Map<number, Record<string, unknown>> {
  if (ids.length === 0) return new Map();
  const rows = db
    .prepare(
      `SELECT c.id, c.chunk_id, c.text, c.page, c.page_end,
              d.doc_id, d.title, d.authors, d.year, d.doc_type, d.file_name, d.psi_folder,
              d.public_url, d.accession, d.related_accessions,
              i.acronym, i.investigation_url, i.fire_relevance
         FROM chunks c
         JOIN documents d USING (doc_id)
         LEFT JOIN investigations i USING (accession)
        WHERE c.id IN (${ids.map(() => '?').join(', ')})`,
    )
    .all(...ids);
  return new Map(rows.map((row) => [Number(row.id), row]));
}

function toMetadata(row: Record<string, unknown>): Omit<SearchHit, 'score' | 'similarity' | 'methods'> {
  const chunkId = String(row.chunk_id);
  return {
    id: Number(row.id),
    chunkId,
    text: String(row.text),
    page: intOrNull(row.page),
    pageEnd: intOrNull(row.page_end),
    docId: String(row.doc_id),
    title: String(row.title),
    authors: textOrNull(row.authors),
    year: intOrNull(row.year),
    docType: String(row.doc_type),
    fileName: textOrNull(row.file_name),
    psiFolder: textOrNull(row.psi_folder),
    publicUrl: textOrNull(row.public_url),
    accession: textOrNull(row.accession),
    relatedAccessions: accessions(row.related_accessions, chunkId),
    acronym: textOrNull(row.acronym),
    investigationUrl: textOrNull(row.investigation_url),
    fireRelevance: intOrNull(row.fire_relevance),
  };
}

const textOrNull = (value: unknown): string | null => (value == null ? null : String(value));
const intOrNull = (value: unknown): number | null => (value == null ? null : Number(value));

function accessions(raw: unknown, chunkId: string): string[] {
  let value: unknown;
  try {
    value = JSON.parse(String(raw));
  } catch {
    value = undefined;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`related_accessions of ${chunkId} is not a JSON list of strings`);
  }
  return value as string[];
}
