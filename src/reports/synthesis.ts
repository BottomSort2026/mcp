import { HABITATS, PILLARS } from './rubric.ts';
import type { SynthesisOutput } from './schema.ts';
import type { RankedInvestigation, ReviewFlag, Statement, Synthesis } from './types.ts';

const FIRST = 3;

/** The validated records, compacted to what a hardware comparison needs, plus corpus facts. */
export function synthesisInput(ranked: RankedInvestigation[]): string {
  const records = ranked.map((r) => ({
    accession: r.accession,
    acronym: r.acronym,
    title: r.title,
    rank: r.rank,
    total: r.total,
    hardware: r.profile.hardware?.text ?? null,
    flight_platform: r.profile.flight_platform?.text ?? null,
    fuel_type: r.profile.fuel_type?.value ?? null,
    fuels: r.profile.fuels?.text ?? null,
    oxygen: r.profile.oxygen?.text ?? null,
    pressure: r.profile.pressure?.text ?? null,
    airflow: r.profile.airflow?.text ?? null,
    variables: r.profile.variables.map((c) => c.text),
    pillars: PILLARS.filter((p) => r.pillars[p]),
    habitats: Object.fromEntries(HABITATS.map((h) => [h, r.habitats[h]?.score ?? null])),
    summary: r.summary.technical?.text ?? null,
    key_findings: r.key_findings.slice(0, FIRST).map((c) => c.text),
    limitations: r.limitations.slice(0, FIRST).map((c) => c.text),
    data_for_modeling: r.data_for_modeling?.readiness ?? null,
  }));

  const facts = {
    evidence: ranked.map((r) => ({
      accession: r.accession,
      own_documents: Object.fromEntries(r.evidence_coverage.own.map((e) => [e.doc_type, e.documents])),
      linked_documents: Object.fromEntries(r.evidence_coverage.linked.map((e) => [e.doc_type, e.documents])),
      has_paginated_own_documents: r.evidence_coverage.has_pages,
      card_only: r.evidence_coverage.card_only,
    })),
    without_paginated_own_documents: ranked.filter((r) => !r.evidence_coverage.has_pages).map((r) => r.accession),
    card_only: ranked.filter((r) => r.evidence_coverage.card_only).map((r) => r.accession),
  };

  return `Records:\n${JSON.stringify(records, null, 1)}\n\nCorpus facts:\n${JSON.stringify(facts, null, 1)}`;
}

/**
 * Drops every accession that is not one of the ranked investigations, and every statement left
 * with none, each with a review flag.
 */
export function validateSynthesis(output: SynthesisOutput, known: Set<string>, model: string): Synthesis {
  const flags: ReviewFlag[] = [];

  const keep = (path: string, accessions: string[]): string[] => {
    const unknown = accessions.filter((a) => !known.has(a));
    if (unknown.length) {
      flags.push({
        code: 'unknown_accession',
        message: `${path}: dropped ${[...new Set(unknown)].join(', ')}, not a ranked investigation`,
      });
    }
    return [...new Set(accessions.filter((a) => known.has(a)))];
  };
  const statement = (path: string, value: Statement): Statement | null => {
    const accessions = keep(path, value.accessions);
    if (accessions.length) return { text: value.text, accessions };
    flags.push({ code: 'dropped_statement', message: `${path} was dropped: it names no ranked investigation` });
    return null;
  };
  const statements = (path: string, values: Statement[]) =>
    values.flatMap((value, index) => statement(`${path}[${index}]`, value) ?? []);

  const groups = output.groups.flatMap((group, index) => {
    const path = `groups[${index}] (${group.name})`;
    const accessions = keep(path, group.accessions);
    if (!accessions.length) {
      flags.push({ code: 'dropped_statement', message: `${path} was dropped: it names no ranked investigation` });
      return [];
    }
    return [
      {
        name: group.name,
        hardware: group.hardware,
        accessions,
        similarities: statements(`${path}.similarities`, group.similarities),
        differences: statements(`${path}.differences`, group.differences),
      },
    ];
  });

  return {
    overview: statement('overview', output.overview),
    groups,
    gaps: statements('gaps', output.gaps),
    review_flags: flags,
    model,
  };
}
