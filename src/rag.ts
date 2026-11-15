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
 * Hybrid retrieval, translated from train/src/flame/corpus/search.py: BM25 over
 * chunks_fts (without corpus_info.search.bm25_stopwords) and KNN over chunks_vec,
 * fused with reciprocal rank fusion, keeping at most max_chunks_per_doc chunks of
 * one document. Every parameter comes from corpus_info.search. When the query
 * cannot be embedded (engine down, timeout, HTTP error, wrong model or dimension)
 * it warns once and answers with BM25 alone.
 */
export async function search(
  corpus: Corpus,
  query: string,
  embed: Embed,
  warn: Warn,
): Promise<SearchResult> {
  const { db, info } = corpus;
  const { k, candidates_per_method, rrf_k, max_chunks_per_doc, bm25_stopwords } = info.search;
  const n = Math.max(candidates_per_method, k);

  const bm25 = bm25Search(db, query, n, new Set(bm25_stopwords));

  let queryVector: number[] | undefined;
  try {
    queryVector = await embed(query);
  } catch (error) {
    warn(`query embedding failed, searching with BM25 only: ${describeError(error)}`);
  }
  const vector = queryVector ? vectorSearch(db, queryVector, n) : [];

  const ranked = rrf([bm25, vector.map((match) => match.id)], rrf_k);
  const docOf = max_chunks_per_doc ? docIds(db, ranked.map(([id]) => id)) : new Map<number, string>();
  const fused = limitPerDoc(ranked, docOf, max_chunks_per_doc, k);
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
 * joined with OR, leaving out the stopwords (corpus_info.search.bm25_stopwords:
 * with OR, a chunk sharing only "what" or "between" with the query would still be
 * a candidate). Null when no term is left (an empty MATCH is an error).
 */
export function ftsQuery(text: string, stopwords: ReadonlySet<string> = new Set()): string | null {
  const terms = [...new Set((text.match(TERM) ?? []).map((term) => term.toLowerCase()))].filter(
    (term) => !stopwords.has(term),
  );
  if (terms.length === 0) return null;
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(' OR ');
}

/** Chunk ids ranked by bm25 (lower is better), best first. */
export function bm25Search(
  db: DatabaseSync,
  query: string,
  n: number,
  stopwords: ReadonlySet<string> = new Set(),
): number[] {
  const match = ftsQuery(query, stopwords);
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
 * The first k entries of a fused ranking with at most maxPerDoc chunks of one
 * document (search.py's limit_per_doc). A long document (a thesis, a final
 * report) would otherwise take every result; a document's best chunk never moves
 * down. Null or 0 means no limit. Returns fewer than k when candidates run out.
 */
export function limitPerDoc<T extends [id: number, score: number]>(
  ranking: T[],
  docOf: ReadonlyMap<number, string>,
  maxPerDoc: number | null,
  k: number,
): T[] {
  if (!maxPerDoc) return ranking.slice(0, k);
  const perDoc = new Map<string | undefined, number>();
  const out: T[] = [];
  for (const entry of ranking) {
    const doc = docOf.get(entry[0]);
    const seen = perDoc.get(doc) ?? 0;
    if (seen >= maxPerDoc) continue;
    perDoc.set(doc, seen + 1);
    out.push(entry);
    if (out.length === k) break;
  }
  return out;
}

// doc_id of each candidate chunk, for limitPerDoc.
function docIds(db: DatabaseSync, ids: number[]): Map<number, string> {
  if (ids.length === 0) return new Map();
  const rows = db
    .prepare(`SELECT id, doc_id FROM chunks WHERE id IN (${ids.map(() => '?').join(', ')})`)
    .all(...ids);
  return new Map(rows.map((row) => [Number(row.id), String(row.doc_id)]));
}

/**
 * chunks_vec uses L2 distance over L2-normalized vectors, so
 * cosine similarity = 1 - distance² / 2.
 */
export function similarity(distance: number): number {
  // `|| 0` turns the -0 that rounding can produce into 0.
  return Math.round((1 - (distance * distance) / 2) * 1000) / 1000 || 0;
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
