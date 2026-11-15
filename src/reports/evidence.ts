import type { DatabaseSync } from 'node:sqlite';
import { investigationName } from '../citations.ts';
import type { Corpus } from '../db.ts';
import { chunkHits, search, type Embed, type SearchHit, type SearchMode, type Warn } from '../rag.ts';
import { CRITERIA } from './rubric.ts';

/** The mini-book is the corpus document of this doc_type (named in the report spec). */
export const BOOK_DOC_TYPE = 'book';
export const BOOK_PASSAGES = 3;
/** Cap on passages from the investigation's own non-card documents. */
export const OWN_PASSAGES = 12;

/** One query per profile field, searched inside the investigation's own documents. */
export const PROFILE_QUERIES = [
  'fuel sample material shape size thickness diameter burner',
  'oxygen concentration mole fraction pressure airflow flow velocity',
  'sensors measurements camera thermocouple radiometer diagnostics',
  'results findings observed extinction limit spread rate',
] as const;

export type InvestigationRow = {
  accession: string;
  acronym: string | null;
  title: string;
  fire_relevance: number;
  investigation_url: string;
  metadata: Record<string, unknown>;
};

/** Where a passage came from: in this order in the numbered list. */
export type PassageKind = 'card' | 'record' | 'linked' | 'book' | 'own';
export type Passage = { n: number; kind: PassageKind; hit: SearchHit };

export type CoverageEntry = {
  doc_type: string;
  documents: number;
  chunks: number;
  /** Documents with at least one paginated chunk (PDF papers, reports, slides). */
  paginated_documents: number;
};

/** Computed by code from the corpus, never by the model. */
export type EvidenceCoverage = {
  /** Documents with this accession, the card included, per doc_type. */
  own: CoverageEntry[];
  /** External documents whose related_accessions lists this investigation, per doc_type. */
  linked: CoverageEntry[];
  /** Whether any of the investigation's own documents has pages. */
  has_pages: boolean;
  /** Only the card (and the PSI record built from its metadata): no other own or linked document. */
  card_only: boolean;
  /** Passages given to the model, per kind. */
  passages: Record<PassageKind, number>;
  /** 'bm25' when the engine could not embed the queries. */
  retrieval: SearchMode;
};

export type Evidence = {
  investigation: InvestigationRow;
  passages: Passage[];
  coverage: EvidenceCoverage;
};

export type EvidenceDeps = { corpus: Corpus; embed: Embed; warn: Warn };

export const cardDocId = (accession: string): string => `${accession}:card`;

export function listInvestigations(db: DatabaseSync): InvestigationRow[] {
  return db
    .prepare(
      'SELECT accession, acronym, title, fire_relevance, investigation_url, metadata_json FROM investigations',
    )
    .all()
    .map((row) => ({
      accession: String(row.accession),
      acronym: row.acronym == null ? null : String(row.acronym),
      title: String(row.title),
      fire_relevance: Number(row.fire_relevance),
      investigation_url: String(row.investigation_url),
      metadata: parseMetadata(row.metadata_json),
    }))
    .sort((a, b) => compareAccessions(a.accession, b.accession));
}

/** PSI-9 before PSI-10. */
export function compareAccessions(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true });
}

/**
 * The numbered passages for one investigation: its card, a PSI record passage, linked external
 * documents, up to 3 mini-book passages and up to 12 passages from its own other documents.
 */
export async function buildEvidence(
  investigation: InvestigationRow,
  deps: EvidenceDeps,
): Promise<Evidence> {
  const { db } = deps.corpus;
  const { accession } = investigation;
  const modes: SearchMode[] = [];

  const card = chunkHits(db, ids(db, 'SELECT id FROM chunks WHERE doc_id = ? ORDER BY chunk_index', cardDocId(accession)));
  const record = recordHit(investigation, card[0]);
  const linked = chunkHits(
    db,
    ids(
      db,
      `SELECT c.id FROM documents d, json_each(d.related_accessions) j
         JOIN chunks c ON c.doc_id = d.doc_id
        WHERE d.accession IS NULL AND j.value = ?
        ORDER BY d.doc_id, c.chunk_index`,
      accession,
    ),
  );

  const name = investigation.acronym?.trim() || investigation.title;
  const book = await search(
    deps.corpus,
    `${name} spacecraft fire safety microgravity`,
    deps.embed,
    deps.warn,
    { docType: BOOK_DOC_TYPE, k: BOOK_PASSAGES },
  );
  modes.push(book.mode);

  const own = await ownPassages(investigation, card.length, deps, modes);

  const groups: Array<[PassageKind, SearchHit[]]> = [
    ['card', card],
    ['record', [record]],
    ['linked', linked],
    ['book', book.hits],
    ['own', own],
  ];
  const passages: Passage[] = [];
  for (const [kind, hits] of groups) {
    for (const hit of hits) passages.push({ n: passages.length + 1, kind, hit });
  }

  return {
    investigation,
    passages,
    coverage: coverage(db, accession, passages, modes.includes('bm25') ? 'bm25' : 'hybrid'),
  };
}

/**
 * Scoped hybrid search inside the investigation's own documents, one query per rubric criterion
 * and per profile field. Deduplicated; best fused rank first, then the higher fused score.
 */
async function ownPassages(
  investigation: InvestigationRow,
  cardChunks: number,
  deps: EvidenceDeps,
  modes: SearchMode[],
): Promise<SearchHit[]> {
  const card = cardDocId(investigation.accession);
  const queries = [...CRITERIA.map((c) => c.query), ...PROFILE_QUERIES];
  const best = new Map<number, { hit: SearchHit; rank: number; score: number }>();

  for (const query of queries) {
    // Ask for the card's chunks on top of the cap, so dropping them never starves the list.
    const { mode, hits } = await search(deps.corpus, query, deps.embed, deps.warn, {
      accession: investigation.accession,
      k: OWN_PASSAGES + cardChunks,
    });
    modes.push(mode);
    hits
      .filter((hit) => hit.docId !== card)
      .forEach((hit, rank) => {
        const seen = best.get(hit.id);
        if (!seen || rank < seen.rank || (rank === seen.rank && hit.score > seen.score)) {
          best.set(hit.id, { hit, rank, score: hit.score });
        }
      });
  }

  return [...best.values()]
    .sort((a, b) => a.rank - b.rank || b.score - a.score || a.hit.id - b.hit.id)
    .slice(0, OWN_PASSAGES)
    .map((entry) => entry.hit);
}

function coverage(
  db: DatabaseSync,
  accession: string,
  passages: Passage[],
  retrieval: SearchMode,
): EvidenceCoverage {
  const own = coverageEntries(db, 'd.accession = ?', '', accession);
  const linked = coverageEntries(
    db,
    'd.accession IS NULL AND j.value = ?',
    ', json_each(d.related_accessions) j',
    accession,
  );
  const ownOther = Number(
    (
      db
        .prepare('SELECT count(*) AS n FROM documents WHERE accession = ? AND doc_id != ?')
        .get(accession, cardDocId(accession)) as { n: number }
    ).n,
  );

  const counts: Record<PassageKind, number> = { card: 0, record: 0, linked: 0, book: 0, own: 0 };
  for (const passage of passages) counts[passage.kind] += 1;

  return {
    own,
    linked,
    has_pages: own.some((entry) => entry.paginated_documents > 0),
    card_only: ownOther === 0 && linked.length === 0,
    passages: counts,
    retrieval,
  };
}

function coverageEntries(db: DatabaseSync, where: string, join: string, accession: string): CoverageEntry[] {
  return db
    .prepare(
      `SELECT d.doc_type,
              count(DISTINCT d.doc_id) AS documents,
              count(c.id) AS chunks,
              count(DISTINCT CASE WHEN c.page IS NOT NULL THEN d.doc_id END) AS paginated
         FROM documents d${join}
         LEFT JOIN chunks c ON c.doc_id = d.doc_id
        WHERE ${where}
        GROUP BY d.doc_type
        ORDER BY d.doc_type`,
    )
    .all(accession)
    .map((row) => ({
      doc_type: String(row.doc_type),
      documents: Number(row.documents),
      chunks: Number(row.chunks),
      paginated_documents: Number(row.paginated),
    }));
}

const ids = (db: DatabaseSync, sql: string, param: string): number[] =>
  db
    .prepare(sql)
    .all(param)
    .map((row) => Number(row.id));

/**
 * What the card text lacks, from metadata_json: publications, investigators and roles, DOI,
 * release date and license. Cited like the card: investigation page, no page.
 */
export function recordHit(investigation: InvestigationRow, card?: SearchHit): SearchHit {
  const { accession } = investigation;
  return {
    id: -1,
    chunkId: `${accession}:record`,
    text: recordText(investigation),
    page: null,
    pageEnd: null,
    docId: `${accession}:record`,
    title: `${investigation.title} — PSI record`,
    authors: null,
    year: null,
    docType: 'psi_record',
    fileName: null,
    psiFolder: null,
    publicUrl: null,
    accession,
    relatedAccessions: [],
    acronym: card?.acronym ?? investigation.acronym,
    investigationUrl: card?.investigationUrl ?? investigation.investigation_url,
    fireRelevance: investigation.fire_relevance,
    score: 0,
    similarity: null,
    methods: [],
  };
}

const NOT_LISTED = 'not listed in the PSI record';

export function recordText(investigation: InvestigationRow): string {
  const m = investigation.metadata;
  const name = investigationName(investigation.acronym, investigation.accession);
  const license = [str(m.licenseName), str(m.licenseIdentifier)].filter(Boolean);

  const investigators = list(m.investigators).map((person) => {
    const who = [str(person.firstName), str(person.lastName)].filter(Boolean).join(' ') || 'unnamed';
    const roles = list(person.roles as unknown).map(String).filter(Boolean);
    const affiliation = str(person.affiliation);
    return `- ${who}${affiliation ? `, ${affiliation}` : ''}${roles.length ? ` (${roles.join(', ')})` : ''}`;
  });

  const publications = list(m.publications).map((pub) => {
    const parts = [`"${str(pub.title) ?? 'untitled'}"`];
    const authors = str(pub.authorList);
    if (authors) parts.push(authors);
    const doi = str(pub.doi);
    if (doi) parts.push(`DOI ${doi}`);
    return `- ${parts.join('. ')}`;
  });

  return [
    `PSI record of ${name}: ${investigation.title}`,
    `DOI: ${str(m.doi) ?? NOT_LISTED}`,
    `Release date: ${str(m.releaseDate) ?? NOT_LISTED}`,
    `License: ${license.length ? (license.length === 2 ? `${license[0]} (${license[1]})` : license[0]) : NOT_LISTED}`,
    `Investigators: ${investigators.length ? '' : NOT_LISTED}`.trimEnd(),
    ...investigators,
    `Publications: ${publications.length ? '' : NOT_LISTED}`.trimEnd(),
    ...publications,
  ].join('\n');
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  try {
    const value = JSON.parse(String(raw));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const list = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
