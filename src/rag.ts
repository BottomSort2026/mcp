import type { DatabaseSync } from 'node:sqlite';

export type SearchHit = { documentId: string; seq: number; content: string; score: number };
export type Embed = (text: string) => Promise<number[]>;

/**
 * Embeds the query, then lets vec0 find the nearest stored chunks. The query
 * vector is never stored.
 */
export async function search(
  db: DatabaseSync,
  query: string,
  k: number,
  embed: Embed,
): Promise<SearchHit[]> {
  const vector = await embed(query);

  const rows = db
    .prepare(
      `SELECT document_id, seq, content, distance
         FROM chunks
        WHERE embedding MATCH ? AND k = ?
        ORDER BY distance`,
    )
    .all(JSON.stringify(vector), BigInt(k)) as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    documentId: String(row.document_id),
    seq: Number(row.seq),
    content: String(row.content),
    score: Math.round((1 - Number(row.distance)) * 1000) / 1000,
  }));
}
