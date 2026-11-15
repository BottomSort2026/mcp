import { mkdtempSync, rmSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { loadVectorExtension } from '../src/db.ts';

export const DIM = 8;

export const axis = (index: number): number[] =>
  Array.from({ length: DIM }, (_, position) => (position === index ? 1 : 0));

export const ROWS = [
  { id: '0', documentId: 'doc-0', content: 'cats are small mammals' },
  { id: '1', documentId: 'doc-1', content: 'dogs are loyal canines' },
  { id: '2', documentId: 'doc-2', content: 'bonds pay fixed interest' },
];

// Stands in for the training service: writes the index once, then hands over a
// read-only file.
export function createIndex(path: string, dim = DIM): void {
  const db = new DatabaseSync(path, { allowExtension: true });
  loadVectorExtension(db);
  db.exec(`
    CREATE VIRTUAL TABLE chunks USING vec0(
      id TEXT PRIMARY KEY,
      embedding FLOAT[${dim}] distance_metric=cosine,
      +document_id TEXT,
      +seq INTEGER,
      +content TEXT
    )
  `);
  const insert = db.prepare(
    'INSERT INTO chunks(id, embedding, document_id, seq, content) VALUES (?, ?, ?, ?, ?)',
  );
  ROWS.forEach((row, seq) => {
    insert.run(row.id, JSON.stringify(axis(seq)), row.documentId, BigInt(seq), row.content);
  });
  db.close();
}

export async function withIndex<T>(
  run: (path: string) => Promise<T>,
  dim = DIM,
): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-rag-'));
  const path = join(dir, 'index.db');
  createIndex(path, dim);
  try {
    return await run(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function withEngine(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
  run: (url: string) => Promise<void>,
): Promise<void> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}/v1/embeddings`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

export function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(JSON.parse(body)));
  });
}
