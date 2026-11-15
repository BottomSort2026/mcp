/*
 * The code-side check behind the moon_base and rover rule in reports/prompts/investigation.system.md:
 * a 3 there needs tests at elevated oxygen (30 % or more), reduced pressure or simulated partial
 * gravity. This is a text heuristic over the cited passages. It never changes a score; a miss only
 * raises a review flag for a person to check.
 */

/** Oxygen at or above this percentage counts as elevated (the expected lunar habitat atmosphere). */
export const ELEVATED_O2_PERCENT = 30;
/** Pressures below these count as reduced (sea level is 14.7 psi, 101.3 kPa, 1 atm). */
const REDUCED = { psi: 14, kpa: 97, atm: 0.95 } as const;

const NUMBER = String.raw`(\d+(?:\.\d+)?|\.\d+)`;
/** "30", "21-40", "21 to 40", "21–40": every number of a value or a range. */
const RANGE = String.raw`${NUMBER}(?:\s*(?:-|–|to)\s*${NUMBER})?`;
// \b keeps CO2 out.
const O2 = String.raw`(?:\bO2|O₂|\boxygen)`;

const PARTIAL_GRAVITY = [
  /partial[- ]?gravity/i,
  /fractional[- ]?gravity/i,
  /\b(?:lunar|moon|mars|martian)[- ]gravity/i,
  /\bsimulated (?:lunar|martian|partial)/i,
  /\b(?:1\/6|one[- ]sixth|1\/3|one[- ]third|0?\.16|0?\.38)\s*-?\s*g\b/i,
  // E-FIELD Flames mimics partial gravity with an electric field.
  /\bE-FIELD\b/,
];

const ELEVATED_O2_WORDS =
  /\b(?:oxygen[- ]enriched|enriched[- ](?:oxygen|air)|oxygen enrichment|elevated[- ]oxygen|high[- ]oxygen|increased oxygen)\b/i;
const O2_PERCENT = [
  new RegExp(String.raw`${RANGE}\s*%\s*(?:by volume\s+|vol\.?\s*)?${O2}`, 'gi'),
  new RegExp(String.raw`${O2}\b[^.%\d]{0,40}${RANGE}\s*%`, 'gi'),
];
const O2_FRACTION = new RegExp(String.raw`${O2} (?:mole|volume) fractions?[^.\d]{0,20}${RANGE}`, 'gi');

const REDUCED_PRESSURE_WORDS =
  /\b(?:reduced|low|lower|sub-?atmospheric)[- ]pressures?\b|\bbelow (?:one )?atmospher|\bhypobaric\b/i;
const PRESSURES: Array<[RegExp, number]> = [
  // (?!-) keeps accessions out: "3 PSI-25" is not 3 psi.
  [new RegExp(String.raw`${RANGE}\s*psia?\b(?!-)`, 'gi'), REDUCED.psi],
  [new RegExp(String.raw`${RANGE}\s*kPa\b`, 'gi'), REDUCED.kpa],
  [new RegExp(String.raw`${RANGE}\s*atm\b`, 'gi'), REDUCED.atm],
];

/** Every number captured by `pattern` in `text`, ranges giving both ends. */
function numbers(pattern: RegExp, text: string): number[] {
  return [...text.matchAll(pattern)].flatMap((m) =>
    m.slice(1).flatMap((value) => (value === undefined ? [] : [Number(value)])),
  );
}

export function mentionsPartialGravity(text: string): boolean {
  return PARTIAL_GRAVITY.some((pattern) => pattern.test(text));
}

export function mentionsElevatedOxygen(text: string): boolean {
  if (ELEVATED_O2_WORDS.test(text)) return true;
  const percents = O2_PERCENT.flatMap((pattern) => numbers(pattern, text));
  if (percents.some((p) => p >= ELEVATED_O2_PERCENT && p <= 100)) return true;
  return numbers(O2_FRACTION, text).some((f) => f >= ELEVATED_O2_PERCENT / 100 && f <= 1);
}

export function mentionsReducedPressure(text: string): boolean {
  if (REDUCED_PRESSURE_WORDS.test(text)) return true;
  return PRESSURES.some(([pattern, below]) => numbers(pattern, text).some((value) => value > 0 && value < below));
}

/** Whether a passage mentions any condition that supports a 3 for moon_base or rover. */
export function mentionsLunarConditions(text: string): boolean {
  return mentionsElevatedOxygen(text) || mentionsReducedPressure(text) || mentionsPartialGravity(text);
}
