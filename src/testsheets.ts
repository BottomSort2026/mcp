import type { DatabaseSync } from 'node:sqlite';

/**
 * The corpus titles each FLEX TestSheet after its file name without ".txt": the engine's test
 * FLEX-046 is the document "FLEX-046_TestSheet". The bare id is matched too, in case a later
 * corpus build titles the sheets "FLEX-046".
 */
export const TESTSHEET_TITLE_SUFFIX = '_TestSheet';

/** The TestSheet of one real test: its conditions and the investigator's comments. */
export type TestSheet = {
  /** documents.title, e.g. FLEX-046_TestSheet. */
  title: string;
  psiFolder: string | null;
  text: string;
};

export type InvestigationRef = { acronym: string | null; investigationUrl: string | null };

/**
 * The TestSheets of the given tests (engine testsheet_id, e.g. FLEX-046), keyed by that id. Only
 * documents of type testsheet of `accession` (the investigation the models were trained on) count.
 * A test without a TestSheet in the corpus is simply absent from the map. Lookup by exact title,
 * no search involved.
 */
export function findTestSheets(
  db: DatabaseSync,
  accession: string,
  testsheetIds: string[],
): Map<string, TestSheet> {
  const idByTitle = new Map<string, string>();
  for (const id of new Set(testsheetIds)) {
    idByTitle.set(`${id}${TESTSHEET_TITLE_SUFFIX}`, id);
    idByTitle.set(id, id);
  }
  const sheets = new Map<string, TestSheet>();
  if (idByTitle.size === 0) return sheets;

  const titles = [...idByTitle.keys()];
  const rows = db
    .prepare(
      `SELECT d.title, d.psi_folder, c.text
         FROM documents d
         JOIN chunks c USING (doc_id)
        WHERE d.accession = ? AND d.doc_type = 'testsheet'
          AND d.title IN (${titles.map(() => '?').join(', ')})
        ORDER BY d.title, c.chunk_index`,
    )
    .all(accession, ...titles);

  for (const row of rows) {
    const title = String(row.title);
    const id = idByTitle.get(title);
    if (id === undefined) continue;
    const sheet = sheets.get(id);
    if (sheet === undefined) {
      sheets.set(id, {
        title,
        psiFolder: row.psi_folder == null ? null : String(row.psi_folder),
        text: String(row.text),
      });
    } else if (sheet.title === title) {
      // A sheet longer than one chunk: its chunks in order.
      sheet.text += `\n\n${String(row.text)}`;
    }
  }
  return sheets;
}

/** Acronym and PSI page of an investigation, or null when the corpus does not have it. */
export function findInvestigation(db: DatabaseSync, accession: string): InvestigationRef | null {
  const row = db
    .prepare('SELECT acronym, investigation_url FROM investigations WHERE accession = ?')
    .get(accession) as { acronym?: unknown; investigation_url?: unknown } | undefined;
  if (!row) return null;
  return {
    acronym: row.acronym == null ? null : String(row.acronym),
    investigationUrl: row.investigation_url == null ? null : String(row.investigation_url),
  };
}
