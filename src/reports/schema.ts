import { z } from 'zod';
import { HABITATS, MAX_SCORE, MODEL_CRITERIA, OBJECTIVES, PILLARS } from './rubric.ts';

/*
 * The schemas Claude fills through structured outputs (output_config.format).
 *
 * Limits from platform.claude.com/docs/en/build-with-claude/structured-outputs (read 2026-11-15):
 * at most 24 optional parameters and 16 parameters with union types (anyOf or type arrays such as
 * ["string", "null"]) per request; additionalProperties must be false; no numeric or string
 * constraints; minItems only 0 or 1; enum and $ref/$defs are supported.
 *
 * So every property is required and nothing is nullable: a field the passages do not state comes
 * back as { stated: false, text: "", sources: [] } and the code turns it into null. Scores are an
 * integer enum, which the grammar enforces. The SDK's zodOutputFormat helper (1.3.0) moves `enum`
 * into the description, so strictJsonSchema below is used instead, and zod validates every reply.
 *
 * The field names follow reports/prompts/*.system.md. The list limits the prompts state are .max()
 * here: structured outputs do not accept maxItems (strictJsonSchema strips it), so the descriptions
 * repeat them and zod rejects a longer list (the call is retried once). Word limits are not
 * enforced; validation flags a text that exceeds one.
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

// z.literal with several values becomes an integer enum, not an anyOf: no union is spent on it.
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

// Keywords the API rejects or ignores; zod still checks them on the reply.
const UNSUPPORTED = new Set([
  '$schema',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'maxItems',
  'uniqueItems',
]);

type Json = Record<string, unknown>;

/** z.toJSONSchema, then only what structured outputs accept. */
export function strictJsonSchema(schema: z.ZodType): Json {
  return strict(z.toJSONSchema(schema) as Json);
}

function strict(node: Json): Json {
  const out: Json = {};
  for (const [key, value] of Object.entries(node)) {
    if (UNSUPPORTED.has(key)) continue;
    if (key === 'minItems') {
      if (value === 0 || value === 1) out[key] = value;
    } else if (key === 'properties' || key === '$defs') {
      out[key] = Object.fromEntries(
        Object.entries(value as Record<string, Json>).map(([name, child]) => [name, strict(child)]),
      );
    } else if (key === 'items' && value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = strict(value as Json);
    } else if ((key === 'anyOf' || key === 'allOf') && Array.isArray(value)) {
      out[key] = value.map((child) => strict(child as Json));
    } else {
      out[key] = value;
    }
  }
  if (out.type === 'object') out.additionalProperties = false;
  return out;
}
