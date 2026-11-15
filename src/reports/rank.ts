import { compareAccessions } from './evidence.ts';
import {
  COVERAGE_MIN_HABITAT_SCORE,
  CRITERIA,
  HABITAT_TOP_N,
  HABITATS,
  MAX_SCORE,
  PILLARS,
  type Habitat,
  type Pillar,
} from './rubric.ts';
import type { ComputedScore, InvestigationRecord, InvestigationsReport, RankedInvestigation } from './types.ts';

const round = (value: number, places: number): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Mean of the four habitat scores; a dropped habitat score counts as 0. */
export function habitatMean(record: Pick<InvestigationRecord, 'habitats'>): number {
  const sum = HABITATS.reduce((acc, habitat) => acc + (record.habitats[habitat]?.score ?? 0), 0);
  return round(sum / HABITATS.length, 2);
}

/** Every criterion score, habitat_relevance included; a dropped score counts as 0. */
export function criterionScores(record: Pick<InvestigationRecord, 'scores' | 'habitats'>): Record<string, number> {
  return Object.fromEntries(
    CRITERIA.map((c) => [
      c.key,
      c.scoredBy === 'habitats' ? habitatMean(record) : (record.scores[c.key]?.score ?? 0),
    ]),
  );
}

/** Weighted sum of the criterion scores, normalized to 0-100, one decimal. */
export function total(record: Pick<InvestigationRecord, 'scores' | 'habitats'>): number {
  const scores = criterionScores(record);
  const weights = CRITERIA.reduce((acc, c) => acc + c.weight, 0);
  const sum = CRITERIA.reduce((acc, c) => acc + c.weight * scores[c.key], 0);
  return round((sum / (weights * MAX_SCORE)) * 100, 1);
}

/**
 * Sorted by total, then by the corpus fire_relevance (1 first), then by accession. Adds the
 * computed habitat_relevance score and the tier_mismatch flag: fire_relevance 1 in the bottom
 * third, or 3 in the top third.
 */
export function rankInvestigations(records: InvestigationRecord[]): RankedInvestigation[] {
  const scored = records.map((record) => ({ record, total: total(record) }));
  scored.sort(
    (a, b) =>
      b.total - a.total ||
      a.record.fire_relevance - b.record.fire_relevance ||
      compareAccessions(a.record.accession, b.record.accession),
  );

  const n = scored.length;
  return scored.map(({ record, total }, index): RankedInvestigation => {
    const habitat: ComputedScore = {
      score: habitatMean(record),
      computed: true,
      reason: `Mean of the four habitat scores (${HABITATS.map((h) => record.habitats[h]?.score ?? 0).join(', ')})`,
    };
    const scores = Object.fromEntries(
      CRITERIA.map((c) => [c.key, c.scoredBy === 'habitats' ? habitat : (record.scores[c.key] ?? null)]),
    );

    const flags = [...record.review_flags];
    const third = n / 3;
    if (record.fire_relevance === 1 && index >= n - third) {
      flags.push({
        code: 'tier_mismatch',
        message: `Corpus fire_relevance 1 but ranked ${index + 1} of ${n} (bottom third)`,
      });
    } else if (record.fire_relevance === 3 && index < third) {
      flags.push({
        code: 'tier_mismatch',
        message: `Corpus fire_relevance 3 but ranked ${index + 1} of ${n} (top third)`,
      });
    }

    const { accession, acronym, title, investigation_url, fire_relevance, ...rest } = record;
    return {
      rank: index + 1,
      accession,
      acronym,
      title,
      investigation_url,
      fire_relevance,
      total,
      ...rest,
      scores,
      review_flags: flags,
    };
  });
}

/** Top investigations per habitat: habitat score, then total, then accession. Scores of 0 are left out. */
export function habitatTop(ranked: RankedInvestigation[]): InvestigationsReport['habitat_top'] {
  const top = {} as InvestigationsReport['habitat_top'];
  for (const habitat of HABITATS) {
    top[habitat] = ranked
      .map((r) => ({ accession: r.accession, acronym: r.acronym, score: r.habitats[habitat]?.score ?? 0, total: r.total }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.total - a.total || compareAccessions(a.accession, b.accession))
      .slice(0, HABITAT_TOP_N);
  }
  return top;
}

/** pillar × habitat -> accessions (in rank order) that support the pillar and score the habitat ≥ 2. */
export function coverageMatrix(ranked: RankedInvestigation[]): Record<Pillar, Record<Habitat, string[]>> {
  const matrix = {} as Record<Pillar, Record<Habitat, string[]>>;
  for (const pillar of PILLARS) {
    matrix[pillar] = {} as Record<Habitat, string[]>;
    for (const habitat of HABITATS) {
      matrix[pillar][habitat] = ranked
        .filter((r) => r.pillars[pillar] && (r.habitats[habitat]?.score ?? 0) >= COVERAGE_MIN_HABITAT_SCORE)
        .map((r) => r.accession);
    }
  }
  return matrix;
}
