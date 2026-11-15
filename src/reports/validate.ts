import { toCitation } from '../citations.ts';
import type { Evidence } from './evidence.ts';
import { HABITATS, MODEL_CRITERIA, OBJECTIVES, PILLARS } from './rubric.ts';
import { PROFILE_LIST_FIELDS, PROFILE_TEXT_FIELDS, type InvestigationOutput } from './schema.ts';
import type { Claim, InvestigationRecord, Profile, ReviewFlag, Scored } from './types.ts';

type Sourced = { sources: number[] };

/**
 * Turns the model's answer into a record: drops every claim whose sources are empty or point to
 * passages that do not exist (with a review flag naming it), turns "not stated" fields into null,
 * and renumbers the cited passages 1..n in passage order as the record's citations.
 */
export function validateInvestigation(
  evidence: Evidence,
  output: InvestigationOutput,
  model: string,
  requestedModel: string,
): InvestigationRecord {
  const count = evidence.passages.length;
  const flags: ReviewFlag[] = [];

  const check = <T extends Sourced>(path: string, claim: T): T | null => {
    const bad = claim.sources.filter((n) => !Number.isInteger(n) || n < 1 || n > count);
    // A fresh array: renumber() rewrites each list in place exactly once.
    if (claim.sources.length > 0 && bad.length === 0) return { ...claim, sources: [...claim.sources] };
    flags.push({
      code: 'dropped_claim',
      message:
        claim.sources.length === 0
          ? `${path} was dropped: it cites no passage`
          : `${path} was dropped: it cites passage ${[...new Set(bad)].join(', ')}, which does not exist (${count} passages)`,
    });
    return null;
  };
  const claim = (path: string, value: { text: string; sources: number[] }): Claim | null =>
    check(path, { text: value.text, sources: value.sources });
  const maybe = (path: string, value: { stated: boolean; text: string; sources: number[] }) =>
    value.stated ? claim(path, value) : null;
  const scored = (path: string, value: Scored): Scored | null => {
    const kept = check(path, { score: value.score, reason: value.reason, sources: value.sources });
    if (!kept) flags.push({ code: 'dropped_score', message: `${path} counts as 0 in the total` });
    return kept;
  };
  const claims = (path: string, values: Claim[]) =>
    values.flatMap((value, index) => claim(`${path}[${index}]`, value) ?? []);

  const profile = {} as Profile;
  for (const key of PROFILE_TEXT_FIELDS) profile[key] = maybe(`profile.${key}`, output.profile[key]);
  const fuel = output.profile.fuel_type;
  profile.fuel_type =
    fuel.value === 'not_stated' ? null : check('profile.fuel_type', { value: fuel.value, sources: fuel.sources });
  for (const key of PROFILE_LIST_FIELDS) profile[key] = claims(`profile.${key}`, output.profile[key]);

  const pillars: InvestigationRecord['pillars'] = {};
  for (const key of PILLARS) {
    const kept = maybe(`pillars.${key}`, output.pillars[key]);
    if (kept) pillars[key] = kept;
  }

  const data = output.data_for_modeling;
  const record: InvestigationRecord = {
    accession: evidence.investigation.accession,
    acronym: evidence.investigation.acronym,
    title: evidence.investigation.title,
    investigation_url: evidence.investigation.investigation_url,
    fire_relevance: evidence.investigation.fire_relevance,
    evidence_coverage: evidence.coverage,
    summary: {
      plain: claim('summary.plain', output.summary.plain),
      technical: claim('summary.technical', output.summary.technical),
    },
    scores: Object.fromEntries(
      MODEL_CRITERIA.map((c) => [c.key, scored(`scores.${c.key}`, output.scores[c.key])]),
    ),
    habitats: Object.fromEntries(
      HABITATS.map((h) => [h, scored(`habitats.${h}`, output.habitats[h])]),
    ) as InvestigationRecord['habitats'],
    contributions: Object.fromEntries(
      OBJECTIVES.map((o) => [o, maybe(`contributions.${o}`, output.contributions[o])]),
    ) as InvestigationRecord['contributions'],
    pillars,
    profile,
    // "unknown" with no sources is the not-stated form of this field.
    data_for_modeling:
      data.readiness === 'unknown' && data.sources.length === 0
        ? null
        : check('data_for_modeling', { text: data.text, readiness: data.readiness, sources: data.sources }),
    key_findings: claims('key_findings', output.key_findings),
    limitations: claims('limitations', output.limitations),
    sources: [],
    review_flags: flags,
    model,
  };

  if (evidence.coverage.card_only) {
    flags.push({
      code: 'card_only',
      message: 'The evidence is only the PSI card and the PSI record: no other document in the corpus',
    });
  }
  if (model !== requestedModel) {
    flags.push({
      code: 'served_by_fallback',
      message: `Answered by ${model} after ${requestedModel} declined (server-side fallback)`,
    });
  }

  renumber(record, evidence);
  return record;
}

/** Every `sources` array in the record, so they can be renumbered in place. */
function sourceLists(record: InvestigationRecord): number[][] {
  const lists: number[][] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (key === 'sources' && Array.isArray(child)) lists.push(child as number[]);
        else visit(child);
      }
    }
  };
  const { evidence_coverage: _coverage, sources: _citations, review_flags: _flags, ...claims } = record;
  visit(claims);
  return lists;
}

function renumber(record: InvestigationRecord, evidence: Evidence): void {
  const lists = sourceLists(record);
  const cited = [...new Set(lists.flat())].sort((a, b) => a - b);
  const map = new Map(cited.map((old, index) => [old, index + 1]));
  for (const list of lists) {
    const renumbered = [...new Set(list.map((n) => map.get(n)!))].sort((a, b) => a - b);
    list.splice(0, list.length, ...renumbered);
  }
  record.sources = cited.map((old) => toCitation(evidence.passages[old - 1].hit, map.get(old)!));
}
