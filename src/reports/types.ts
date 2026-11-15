import type { Citation } from '../citations.ts';
import type { EvidenceCoverage } from './evidence.ts';
import type { Habitat, Objective, Pillar, rubricJson } from './rubric.ts';
import type { FUEL_TYPES, PROFILE_LIST_FIELDS, PROFILE_TEXT_FIELDS, READINESS } from './schema.ts';

/** A statement with the numbers of its sources in the record's own `sources` list. */
export type Claim = { text: string; sources: number[] };
export type Scored = { score: number; reason: string; sources: number[] };
/** habitat_relevance: computed by code from the habitat scores. */
export type ComputedScore = { score: number; computed: true; reason: string };

export type ReviewFlag = { code: string; message: string };

export type Profile = Record<(typeof PROFILE_TEXT_FIELDS)[number], Claim | null> &
  Record<(typeof PROFILE_LIST_FIELDS)[number], Claim[]> & {
    fuel_type: { value: (typeof FUEL_TYPES)[number]; sources: number[] } | null;
  };

/** One investigation after validation, before ranking. This is what the cache stores. */
export type InvestigationRecord = {
  accession: string;
  acronym: string | null;
  title: string;
  investigation_url: string;
  fire_relevance: number;
  evidence_coverage: EvidenceCoverage;
  summary: { plain: Claim | null; technical: Claim | null };
  /** Model-scored criteria; null when the score was dropped in validation (counts as 0). */
  scores: Record<string, Scored | null>;
  habitats: Record<Habitat, Scored | null>;
  contributions: Record<Objective, Claim | null>;
  /** Only the pillars the passages support. */
  pillars: Partial<Record<Pillar, Claim>>;
  profile: Profile;
  data_for_modeling: { text: string; readiness: (typeof READINESS)[number]; sources: number[] } | null;
  key_findings: Claim[];
  limitations: Claim[];
  /** The cited passages, renumbered 1..n in passage order. */
  sources: Citation[];
  review_flags: ReviewFlag[];
  /** The model that answered (differs from the requested one after a server-side fallback). */
  model: string;
};

export type RankedInvestigation = Omit<InvestigationRecord, 'scores'> & {
  rank: number;
  total: number;
  scores: Record<string, Scored | ComputedScore | null>;
};

export type Usage = {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};

export type Statement = { text: string; accessions: string[] };

export type Synthesis = {
  overview: Statement | null;
  groups: Array<{
    name: string;
    hardware: string;
    accessions: string[];
    similarities: Statement[];
    differences: Statement[];
  }>;
  gaps: Statement[];
  review_flags: ReviewFlag[];
  model: string;
};

export type Failure = { step: 'investigation' | 'synthesis'; accession: string | null; error: string };

export type InvestigationsReport = {
  run: {
    generated_at: string;
    model: string;
    prompt_version: string;
    rubric_version: string;
    corpus_built_at: string;
    challenge_sha256: string;
    /** Calls made by this run, per step; cached results cost nothing. */
    usage: { investigations: Usage; synthesis: Usage; total: Usage };
    /** Investigations reused from reports/.cache. */
    cached: string[];
    /** Investigations left out: not in --only and with no valid cache entry. */
    skipped: string[];
  };
  rubric: ReturnType<typeof rubricJson>;
  investigations: RankedInvestigation[];
  habitat_top: Record<Habitat, Array<{ accession: string; acronym: string | null; score: number; total: number }>>;
  coverage: Record<Pillar, Record<Habitat, string[]>>;
  synthesis: Synthesis | null;
  failed: Failure[];
};
