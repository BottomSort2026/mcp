import type { SearchHit } from './rag.ts';

/** One source of a /chat answer. The server builds it from a search hit; the model only places [n]. */
export type Citation = {
  /** The marker used in the answer: [n]. */
  n: number;
  /** Ready-to-print source line in the team format. */
  label: string;
  doc_title: string;
  doc_authors: string | null;
  year: number | null;
  doc_type: string;
  page: number | null;
  page_end: number | null;
  accession: string | null;
  acronym: string | null;
  related_accessions: string[];
  file_name: string | null;
  psi_folder: string | null;
  /** PSI investigation page; set for PSI documents only. */
  investigation_url: string | null;
  /** Public NASA page; set for external resources only. */
  public_url: string | null;
};

/**
 * PSI documents link to their investigation page and external resources to
 * their public page. No other URL (never a file URL) leaves the server.
 */
export function toCitation(hit: SearchHit, n: number): Citation {
  const psi = hit.accession !== null;
  const fields = {
    doc_title: hit.title,
    doc_authors: hit.authors,
    year: hit.year,
    doc_type: hit.docType,
    page: hit.page,
    page_end: hit.pageEnd,
    accession: hit.accession,
    acronym: hit.acronym,
    related_accessions: hit.relatedAccessions,
    file_name: hit.fileName,
    psi_folder: hit.psiFolder,
    investigation_url: psi ? hit.investigationUrl : null,
    public_url: psi ? null : hit.publicUrl,
  };
  return { n, label: formatLabel(fields), ...fields };
}

type LabelFields = Pick<
  Citation,
  'doc_title' | 'doc_authors' | 'year' | 'page' | 'acronym' | 'accession' | 'psi_folder'
>;

/**
 * The team format, leaving out whatever is missing:
 *   Authors (year), "Title", p. 7. BASS-II (PSI-25), folder Raw Data.
 * Same rules as the frontend's formatCitation (frontend/src/assistant/citation.ts):
 * blank strings count as missing, and an acronym equal to the accession is not repeated.
 */
export function formatLabel(c: LabelFields): string {
  const authors = clean(c.doc_authors);
  const title = clean(c.doc_title);
  const folder = clean(c.psi_folder);

  const byline = [authors, c.year != null ? `(${c.year})` : null].filter(Boolean).join(' ');
  const document = [byline, title ? `"${title}"` : null, c.page != null ? `p. ${c.page}` : null]
    .filter(Boolean)
    .join(', ');

  const place = [investigationName(c.acronym, c.accession), folder ? `folder ${folder}` : null]
    .filter(Boolean)
    .join(', ');

  return [document, place]
    .filter(Boolean)
    .map((part) => `${part}.`)
    .join(' ');
}

/** "BASS-II (PSI-25)", or whichever of the two exists; a name equal to the accession is not repeated. */
export function investigationName(
  acronym: string | null | undefined,
  accession: string | null | undefined,
): string | null {
  const a = clean(acronym);
  const b = clean(accession);
  return a && b && a !== b ? `${a} (${b})` : (a ?? b);
}

const clean = (value: string | null | undefined): string | null => value?.trim() || null;

// [3], [1, 2] or [1,2]. One or two digits, so a bracketed year such as [2015] is left alone.
const MARKER = /(\s?)\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g;

/**
 * Matches the answer's [n] markers to the passages the model was given
 * (passage n is passages[n - 1]). Markers for passages that do not exist are
 * removed from the answer. Citations are the cited passages in marker order;
 * an answer without markers cites every passage it was given.
 */
export function cite(answer: string, passages: SearchHit[]): { answer: string; citations: Citation[] } {
  const cited = new Set<number>();

  const cleaned = answer.replace(MARKER, (match, space: string, list: string) => {
    const numbers = list.split(',').map((item) => Number(item.trim()));
    const valid = numbers.filter((n) => n >= 1 && n <= passages.length);
    valid.forEach((n) => cited.add(n));
    if (valid.length === numbers.length) return match;
    return valid.length > 0 ? `${space}[${[...new Set(valid)].join(', ')}]` : '';
  });

  const numbers =
    cited.size > 0 ? [...cited].sort((a, b) => a - b) : passages.map((_, index) => index + 1);
  return {
    answer: cleaned,
    citations: numbers.map((n) => toCitation(passages[n - 1], n)),
  };
}
