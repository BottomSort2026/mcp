import { z } from 'zod';
import { HABITATS, MAX_SCORE, MODEL_CRITERIA, OBJECTIVES, PILLARS } from './rubric.ts';

/*
 * The schemas of the JSON objects Claude writes. No constrained decoding: prompts.ts appends each
 * schema (z.toJSONSchema) to its system prompt as an `## Output format` section, and claude.ts
 * validates every reply against it with zod, with one repair call on failure. These schemas are
 * the source of truth for the output shape.
 *
 * Every property is required and nothing is nullable: a field the passages do not state comes
 * back as { stated: false, text: "not stated in the corpus", sources: [] } and the code turns it
 * into null. Scores are an integer enum.
 *
 * The field names follow reports/prompts/*.system.md. The list limits the prompts state are .max()
 * here (maxItems in the schema the model sees) and the descriptions repeat them; zod rejects a
 * longer list. Word limits are not enforced; validation flags a text that exceeds one.
 */

const Sources = z
  .array(z.int())
  .describe('Numbers of the passages this text is taken from. At least one.');

export const ClaimSchema = z.object({ text: z.string(), sources: Sources });

export const MaybeClaimSchema = z
  .object({ stated: z.boolean(), text: z.string(), sources: Sources })
  .describe(
    'stated: false when the passages do not state it; then text is "not stated in the corpus" and sources is [].',
  );

// z.literal with several values becomes an integer enum in the JSON Schema.
const Score = z.literal(Array.from({ length: MAX_SCORE + 1 }, (_, score) => score));

export const ScoredSchema = z.object({
  score: Score,
  reason: z.string().describe('One or two sentences on why, from the passages.'),
  sources: Sources,
});

export const FUEL_TYPES = ['solid', 'liquid', 'gas', 'mixed', 'none'] as const;
export const READINESS = ['ready', 'needs_extraction', 'not_applicable', 'unknown'] as const;

const keyed = <K extends string, S extends z.ZodType>(keys: readonly K[], schema: S) =>
  z.object(Object.fromEntries(keys.map((key) => [key, schema])) as Record<K, S>);

const ClaimList = z.array(ClaimSchema);

/** Limits stated in the prompt files. */
export const LIMITS = {
  summary_plain_words: 60,
  summary_technical_words: 120,
  overview_words: 120,
  key_findings: 5,
  limitations: 3,
  gaps: 6,
} as const;

export const PROFILE_TEXT_FIELDS = [
  'hardware',
  'flight_platform',
  'dates',
  'fuels',
  'sample_shape_size',
  'oxygen',
  'pressure',
  'airflow',
] as const;
export const PROFILE_LIST_FIELDS = ['variables', 'constants', 'sensors', 'measurements'] as const;

/** What the model returns for one investigation. */
export const InvestigationOutputSchema = z.object({
  summary: z.object({
    plain: ClaimSchema.describe(
      `At most ${LIMITS.summary_plain_words} words, for an undergraduate or a curious member of the public.`,
    ),
    technical: ClaimSchema.describe(
      `At most ${LIMITS.summary_technical_words} words, for a researcher: what was burned, how, under which conditions, measured with what.`,
    ),
  }),
  scores: keyed(
    MODEL_CRITERIA.map((c) => c.key),
    ScoredSchema,
  ),
  habitats: keyed(HABITATS, ScoredSchema),
  contributions: keyed(OBJECTIVES, MaybeClaimSchema),
  pillars: keyed(PILLARS, MaybeClaimSchema),
  profile: z.object({
    ...Object.fromEntries(PROFILE_TEXT_FIELDS.map((key) => [key, MaybeClaimSchema])),
    fuel_type: z.object({
      value: z.enum([...FUEL_TYPES, 'not_stated']),
      sources: Sources,
    }),
    ...Object.fromEntries(PROFILE_LIST_FIELDS.map((key) => [key, ClaimList])),
  } as Record<(typeof PROFILE_TEXT_FIELDS)[number], typeof MaybeClaimSchema> &
    Record<(typeof PROFILE_LIST_FIELDS)[number], typeof ClaimList> & {
      fuel_type: z.ZodObject<{
        value: z.ZodEnum<{ [K in (typeof FUEL_TYPES)[number] | 'not_stated']: K }>;
        sources: typeof Sources;
      }>;
    }),
  data_for_modeling: z.object({
    text: z.string(),
    readiness: z.enum(READINESS),
    sources: Sources,
  }),
  key_findings: ClaimList.max(LIMITS.key_findings).describe(
    `Up to ${LIMITS.key_findings} results the passages report; [] when they state none.`,
  ),
  limitations: ClaimList.max(LIMITS.limitations).describe(`Up to ${LIMITS.limitations} limitations.`),
});
export type InvestigationOutput = z.infer<typeof InvestigationOutputSchema>;

const Statement = z.object({
  text: z.string(),
  accessions: z.array(z.string()).describe('Accessions (PSI-n) this statement is about. At least one.'),
});

/** What the model returns for the cross-investigation synthesis. */
export const SynthesisOutputSchema = z.object({
  overview: Statement.describe(`One paragraph of at most ${LIMITS.overview_words} words.`),
  hardware_groups: z.array(
    z.object({
      name: z.string(),
      hardware: z.string(),
      accessions: z.array(z.string()),
      similarities: z.array(Statement),
      differences: z.array(Statement),
    }),
  ),
  gaps: z.array(Statement).max(LIMITS.gaps).describe(`Up to ${LIMITS.gaps} gaps.`),
});
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;
