import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';

// sqlite-vec ships prebuilt binaries and no type declarations.
const { getLoadablePath } = createRequire(import.meta.url)('sqlite-vec') as {
  getLoadablePath: () => string;
};

const CHUNKS = 'chunks';

export function loadVectorExtension(db: DatabaseSync): void {
  db.loadExtension(getLoadablePath());
}

/**
 * Opens an index built by the training service. Read-only: this process never
 * creates tables or writes rows.
 */
export function openDb(path: string, expectedDim: number): DatabaseSync {
  if (!existsSync(path)) {
    throw new Error(`index not found: ${path}. Build it first or set DB_PATH`);
  }
  
  const db = new DatabaseSync(path, { readOnly: true, allowExtension: true });
  loadVectorExtension(db);

  const table = db
    .prepare("SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = ?")
    .get(CHUNKS) as { sql?: string } | undefined;
  if (!table?.sql) throw new Error(`table "${CHUNKS}" not found in ${path}`);

  const dim = storedDim(db, table.sql);
  if (dim !== expectedDim) {
    throw new Error(
      `index stores ${dim}-dim vectors but EMBED_DIM=${expectedDim}; pin EMBED_DIM to the model that built the index`,
    );
  }

  return db;
}

export function countChunks(db: DatabaseSync): number {
  const row = db.prepare(`SELECT count(*) AS c FROM ${CHUNKS}`).get() as { c: number };
  return Number(row.c);
}

// Stored vectors are the source of truth; the DDL is only a fallback for an
// index with no rows yet.
function storedDim(db: DatabaseSync, ddl: string): number {
  const row = db.prepare(`SELECT vec_length(embedding) AS dim FROM ${CHUNKS} LIMIT 1`).get() as
    | { dim?: number }
    | undefined;
  if (row?.dim) return Number(row.dim);

  const match = /float\s*\[\s*(\d+)\s*\]/i.exec(ddl);
  if (!match) throw new Error(`cannot read vector dimension from "${CHUNKS}" schema`);
  return Number(match[1]);
}
