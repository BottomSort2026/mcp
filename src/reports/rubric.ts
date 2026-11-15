/**
 * The rubric of the Investigations report. The team owns the weights: change them here and bump
 * RUBRIC_VERSION, which invalidates the cached results (reports/.cache) on the next run.
 *
 * The model scores every criterion except habitat_relevance, which the code computes as the mean
 * of the four habitat scores. The code computes the totals and the ranking; the model never ranks.
 */
export const RUBRIC_VERSION = '2026-11-15.1';

/** Highest score of any criterion or habitat. */
export const MAX_SCORE = 3;

export type Criterion = {
  key: string;
  weight: number;
  /**
   * What a 3 means, shown in the report. The anchors the model scores with are in
   * reports/prompts/investigation.system.md: keep the two in step.
   */
  three: string;
  /** 'model': Claude scores it. 'habitats': the mean of the four habitat scores. */
  scoredBy: 'model' | 'habitats';
  /** Query used to find this criterion's evidence inside the investigation's own documents. */
  query: string;
};

export const CRITERIA: readonly Criterion[] = [
  {
    key: 'fire_safety_directness',
    weight: 3,
    three: 'The investigation is about spacecraft fire safety itself',
    scoredBy: 'model',
    query: 'spacecraft fire safety flammability ignition flame spread extinction material',
  },
  {
    key: 'habitat_relevance',
    weight: 2,
    three: 'Mean of the four habitat scores',
    scoredBy: 'habitats',
    query: 'crew cabin habitat atmosphere oxygen concentration pressure ventilation flow',
  },
  {
    key: 'predictive_modeling_data',
    weight: 2,
    three: 'Its data can feed flammability or fire-scenario models now',
    scoredBy: 'model',
    query: 'model simulation validation data measured rate limit numerical comparison',
  },
  {
    key: 'controls_and_equipment',
    weight: 2,
    three: 'It informs detection, suppression or material-selection equipment',
    scoredBy: 'model',
    query: 'smoke detector suppression extinguisher material selection standard test method',
  },
  {
    key: 'earth_applications',
    weight: 1,
    three: 'The corpus states a concrete use on Earth',
    scoredBy: 'model',
    query: 'Earth applications benefits terrestrial fire building wildfire engine',
  },
];

export const HABITATS = ['spacecraft', 'station', 'moon_base', 'rover'] as const;
export type Habitat = (typeof HABITATS)[number];

export const HABITAT_LABELS: Record<Habitat, string> = {
  spacecraft: 'Spacecraft',
  station: 'Space station',
  moon_base: 'Moon base',
  rover: 'Pressurized rover',
};

export const PILLARS = ['prevention', 'detection', 'suppression'] as const;
export type Pillar = (typeof PILLARS)[number];

export const OBJECTIVES = [
  'identify_relevant',
  'predictive_modeling',
  'controls_equipment',
  'earth_applications',
] as const;
export type Objective = (typeof OBJECTIVES)[number];

/** A habitat score at or above this puts the investigation in the pillar × habitat coverage matrix. */
export const COVERAGE_MIN_HABITAT_SCORE = 2;

/** How many investigations each habitat's top list keeps. */
export const HABITAT_TOP_N = 3;

export const MODEL_CRITERIA = CRITERIA.filter((c) => c.scoredBy === 'model');

/** The rubric as written into investigations.json. */
export function rubricJson() {
  return {
    version: RUBRIC_VERSION,
    max_score: MAX_SCORE,
    criteria: CRITERIA.map(({ key, weight, three, scoredBy }) => ({
      key,
      weight,
      three,
      scored_by: scoredBy,
    })),
    habitats: [...HABITATS],
    pillars: [...PILLARS],
    total: 'Weighted sum of the criterion scores, normalized to 0-100',
    coverage_min_habitat_score: COVERAGE_MIN_HABITAT_SCORE,
  };
}
