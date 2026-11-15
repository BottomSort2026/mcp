import { formatLabel } from './citations.ts';
import type { Corpus } from './db.ts';
import {
  PredictionSchema,
  type Engine,
  type LabInputs,
  type NearestTest,
  type Prediction,
  type Support,
} from './engine.ts';
import { describeError, InvalidInputsError, upstream, UpstreamError } from './errors.ts';
import { HttpError } from './http.ts';
import type { Chat } from './provider.ts';
import type { Warn } from './rag.ts';
import { findInvestigation, findTestSheets, type InvestigationRef, type TestSheet } from './testsheets.ts';

// The Flame Lab (temporal/prediction_flow.md): one press of Predict is one POST /lab/predict.
// engine /predict runs both FLEX models with their k-NN, the TestSheets of the closest real tests
// come from corpus.db, and one LLM call explains the numbers. Every number on screen comes from the
// engine response, which is forwarded unchanged; the LLM only writes the explanation.

export type LabInput = { inputs: LabInputs; language: string };

export type LabDeps = {
  corpus: Corpus;
  engine: Engine;
  chat: Chat;
  /** Receives the warnings for a failed TestSheet lookup or LLM call. Defaults to console.warn. */
  warn?: Warn;
};

/** A real ISS test the explanation points to, with its citation. */
export type CitedTest = {
  testsheet_id: string | null;
  cir_id: string | null;
  /** How the real test ended: extinction, disruption or completion. */
  test_end: string | null;
  /** Team citation format, e.g. "FLEX-046_TestSheet". FLEX (PSI-69), folder Raw Data. */
  label: string;
  /** The PSI investigation page, never a file URL. */
  investigation_url: string | null;
};

/** Exactly the POST /lab/predict response body. */
export type LabResult = {
  /** The engine's POST /predict response, unchanged. */
  prediction: unknown;
  /** Null when the LLM failed or timed out: the numbers stand on their own. */
  explanation: string | null;
  cited_tests: CitedTest[];
};

type ModelName = 'outcome' | 'extinction';

/** One real test, found by one or both models' k-NN. */
export type ClosestTest = {
  test: NearestTest;
  /** Rank (1 = closest) and whether it is within that model's "near" distance. */
  foundBy: Partial<Record<ModelName, { rank: number; near: boolean }>>;
};

export const LAB_SYSTEM = `You explain one prediction of the Flame Lab, part of Flame in Freefall, an assistant on
NASA microgravity combustion research and spacecraft fire safety. Two models trained on the real
FLEX droplet-combustion tests run on the International Space Station predicted what happens to a
fuel droplet burning in microgravity under the requested conditions. A nearest-neighbour search
found the real tests closest to those conditions; their TestSheets are included.

Write at most 180 words, in 2 or 3 short paragraphs of plain text: no headings, lists, tables or URLs.
1. Say what the models predict, in simple words: how likely the flame is to go out on its own and,
   only when a droplet at extinction is given, the diameter at extinction and the share of fuel
   burned.
2. Say how much real data backs it: whether the conditions are inside the tested conditions, how
   many real tests are close, and the confidence. If they are outside the tested conditions, say so
   clearly and name the inputs outside their tested range.
3. Point to the closest real tests by their ID (for example FLEX-046): how they ended and how their
   conditions compare with the requested ones, using their TestSheets. If the closest tests ended
   differently from the prediction, say so.

Rules:
- Use only the numbers in the data, written as given. Never compute or invent a number.
- Write in the language the data names. Keep technical terms, units and IDs exact (CO2, He, O2, D0,
  atm, mm, FLEX-046).
- These are model predictions, valid only inside the conditions FLEX tested on the ISS. Give no
  safety advice beyond the data, and never present them as a material certification or an
  engineering approval.`;

/**
 * engine /predict, then the TestSheets, then the explanation. Only the engine can fail the request:
 * its 422 becomes InvalidInputsError, any other failure UpstreamError('predict_unavailable'). A failed
 * TestSheet lookup or LLM call is logged and the prediction is still returned.
 */
export async function labPredict(input: LabInput, deps: LabDeps): Promise<LabResult> {
  const warn = deps.warn ?? console.warn;

  const raw = await callPredict(deps.engine, input.inputs);
  const parsed = PredictionSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.map(String).join('.') || '(body)'}: ${issue.message}`)
      .join('; ');
    throw new UpstreamError('predict_unavailable', `engine /predict answered an unexpected body: ${problems}`);
  }
  const prediction = parsed.data;
  const tests = closestTests(prediction);
  const accession = prediction.outcome.model.training_source.accession;

  let sheets = new Map<string, TestSheet>();
  let investigation: InvestigationRef | null = null;
  try {
    const ids = tests.flatMap(({ test }) => (test.testsheet_id ? [test.testsheet_id] : []));
    sheets = findTestSheets(deps.corpus.db, accession, ids);
    investigation = findInvestigation(deps.corpus.db, accession);
  } catch (error) {
    warn(`TestSheet lookup failed, explaining without TestSheets: ${describeError(error)}`);
  }

  let explanation: string | null = null;
  try {
    const answer = await deps.chat([
      { role: 'system', content: LAB_SYSTEM },
      { role: 'user', content: labPrompt(input, prediction, tests, sheets) },
    ]);
    explanation = answer.trim() || null;
  } catch (error) {
    warn(`LLM explanation failed, answering with the prediction only: ${describeError(error)}`);
  }

  return {
    prediction: raw,
    explanation,
    cited_tests: citeTests(tests, explanation, sheets, investigation, accession),
  };
}

/** engine GET /model-info, unchanged: the controls of the Lab are built from it. */
export async function labModelInfo(engine: Engine): Promise<unknown> {
  return upstream('model_info_unavailable', () => engine.modelInfo());
}

async function callPredict(engine: Engine, inputs: LabInputs): Promise<unknown> {
  try {
    return await engine.predict(inputs);
  } catch (error) {
    if (error instanceof HttpError && error.status === 422) {
      throw new InvalidInputsError(engineDetail(error.body), { cause: error });
    }
    throw new UpstreamError('predict_unavailable', describeError(error), { cause: error });
  }
}

/**
 * The engine's 422 message. FastAPI sends { detail: "<text>" } for the models' own rules and
 * { detail: [{ loc, msg }, ...] } for schema errors; the second becomes "o2: Input should be a
 * valid number; fiber: Extra inputs are not permitted".
 */
export function engineDetail(body: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return body.trim().slice(0, 500) || 'invalid inputs';
  }
  const detail = (parsed as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const { loc, msg } = (item ?? {}) as { loc?: unknown; msg?: unknown };
        const field = Array.isArray(loc) ? loc.filter((part) => part !== 'body').join('.') : '';
        const text = typeof msg === 'string' ? msg : JSON.stringify(item);
        return field ? `${field}: ${text}` : text;
      })
      .join('; ');
  }
  return body.trim().slice(0, 500) || 'invalid inputs';
}

/**
 * The closest real tests to explain: the outcome model's, then the extinction model's when the
 * outcome is extinction (otherwise that block is not shown). A test both found appears once, closest
 * first. Tests are the same when their TestSheet is, or their CIR test number when there is none.
 */
export function closestTests(prediction: Prediction): ClosestTest[] {
  const blocks: Array<[ModelName, Support]> = [['outcome', prediction.outcome.support]];
  if (prediction.outcome.prediction.label === 'extinction') {
    blocks.push(['extinction', prediction.extinction.support]);
  }

  const byKey = new Map<string, ClosestTest>();
  for (const [model, support] of blocks) {
    support.nearest_tests.forEach((test, index) => {
      const key = test.testsheet_id ?? (test.cir_id !== null ? `cir:${test.cir_id}` : `${model}:${index}`);
      const entry = byKey.get(key) ?? { test, foundBy: {} };
      entry.foundBy[model] = { rank: index + 1, near: test.distance <= support.threshold };
      byKey.set(key, entry);
    });
  }
  return [...byKey.values()];
}

/** The data block of the explanation call: the numbers pre-formatted, so the model never computes. */
export function labPrompt(
  input: LabInput,
  prediction: Prediction,
  tests: ClosestTest[],
  sheets: Map<string, TestSheet>,
): string {
  const { outcome, extinction } = prediction;
  const extinct = outcome.prediction.label === 'extinction';
  const probabilities = outcome.prediction.probabilities;
  const source = outcome.model.training_source;

  const lines = [`Language of the explanation: ${languageName(input.language)}`, '', 'Requested conditions:'];
  for (const [name, value] of Object.entries(input.inputs)) lines.push(`- ${name}: ${String(value)}`);

  lines.push(
    '',
    `Outcome model (${outcome.model.model_version}, trained on ${source.rows} real ISS tests, ${source.accession}):`,
    `- predicted outcome: ${extinct ? 'extinction, the flame goes out on its own' : 'no extinction, the droplet burns out or breaks apart before the flame goes out'}`,
  );
  if (probabilities.extinction !== undefined) {
    lines.push(`- probability that the flame goes out on its own: ${percent(probabilities.extinction)}`);
  }
  if (probabilities.no_extinction !== undefined) {
    lines.push(`- probability that it does not: ${percent(probabilities.no_extinction)}`);
  }
  lines.push(...supportLines(outcome.support), agreementLine(outcome.support, outcome.prediction.label));

  lines.push('');
  if (extinct) {
    const d0: unknown = input.inputs.droplet_d0_mm;
    lines.push(
      `Droplet at extinction (${extinction.model.model_version}, trained on ${extinction.model.training_source.rows} real ISS tests where the flame went out):`,
      `- D_ext/D0: ${extinction.prediction.extinction_diameter_ratio.toFixed(3)}`,
      `- diameter when the flame goes out (D_ext): ${extinction.prediction.extinction_diameter_mm.toFixed(2)} mm${d0 === undefined ? '' : `, from an initial diameter D0 of ${String(d0)} mm`}`,
      `- share of the fuel burned before the flame goes out: ${percent(extinction.prediction.fuel_burned_fraction)}`,
      ...supportLines(extinction.support),
    );
  } else {
    lines.push(
      'Droplet at extinction: not applicable, because the flame is predicted not to go out. Do not mention a diameter at extinction or the share of fuel burned.',
    );
  }

  lines.push('', 'Closest real ISS tests, closest first:');
  if (tests.length === 0) lines.push('- none');
  for (const closest of tests) lines.push(testLine(closest));

  lines.push('', 'TestSheets of those tests:');
  for (const { test } of tests) {
    const name = testName(test);
    const sheet = test.testsheet_id ? sheets.get(test.testsheet_id) : undefined;
    lines.push(sheet ? `--- ${name} ---\n${sheet.text.trim()}` : `--- ${name}: TestSheet not available ---`);
  }
  return lines.join('\n');
}

function supportLines(support: Support): string[] {
  return [
    `- inside the tested conditions: ${support.in_tested_range ? 'yes' : 'no'}`,
    `- inputs outside their tested range: ${support.out_of_range_fields.join(', ') || 'none'}`,
    `- real tests within the near distance: ${support.support_n}`,
    `- confidence: ${support.confidence}`,
  ];
}

/** How many of the classifier's closest tests ended the way it predicts (disruption and completion are no extinction). */
function agreementLine(support: Support, label: string): string {
  const ended = support.nearest_tests.map((test) => test.test_end).filter((end): end is string => end !== null);
  const agree = ended.filter((end) => (end === 'extinction' ? 'extinction' : 'no_extinction') === label).length;
  const tally = [...new Set(ended)].map((end) => `${end} ${ended.filter((other) => other === end).length}`);
  return `- ${agree} of its ${ended.length} closest real tests ended as predicted (${tally.join(', ') || 'no outcome recorded'}; disruption and completion count as no extinction)`;
}

function testLine({ test, foundBy }: ClosestTest): string {
  const conditions = conditionsText(test.conditions);
  const found = (Object.entries(foundBy) as Array<[ModelName, { rank: number; near: boolean }]>)
    .map(([model, { rank, near }]) => `#${rank} for the ${model} model, ${near ? 'within' : 'beyond'} the near distance`)
    .join('; ');
  return [
    `- ${testName(test)}${test.testsheet_id && test.cir_id ? ` (CIR test ${test.cir_id})` : ''}:`,
    `ended in ${test.test_end ?? 'an unrecorded way'}.`,
    conditions ? `Conditions: ${conditions}.` : '',
    `Closest ${found}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

const testName = (test: NearestTest): string =>
  test.testsheet_id ?? (test.cir_id !== null ? `CIR test ${test.cir_id}` : 'unnamed test');

// The condition names engine uses (support_reference.csv), written the way the Lab shows them.
const CONDITION_FORMAT: Record<string, (value: string) => string> = {
  fuel: (value) => value,
  pressure_atm: (value) => `${value} atm`,
  o2: (value) => `O2 ${value}`,
  co2: (value) => `CO2 ${value}`,
  he: (value) => `He ${value}`,
  d0_mm: (value) => `D0 ${value} mm`,
};

function conditionsText(conditions: NearestTest['conditions']): string {
  return Object.entries(conditions)
    .filter(([, value]) => value !== null)
    .map(([name, value]) => {
      const text = typeof value === 'number' ? significant(value) : String(value);
      return (CONDITION_FORMAT[name] ?? ((v: string) => `${name} ${v}`))(text);
    })
    .join(', ');
}

const percent = (fraction: number): string => `${(fraction * 100).toFixed(1)} %`;
/** Three significant digits, without trailing zeros: 1.0125 -> 1.01, 0.998947 -> 0.999, 0 -> 0. */
const significant = (value: number): string => String(Number(value.toPrecision(3)));

/** "Spanish (es)" for "es"; the code itself when it is not a known language. */
export function languageName(code: string): string {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
    return name && name.toLowerCase() !== code.toLowerCase() ? `${name} (${code})` : code;
  } catch {
    return code;
  }
}

/**
 * The tests the explanation names (by TestSheet id or CIR test number), in the order given to the
 * model; every test when it names none or when there is no explanation. The citation comes from
 * the corpus, never from the model.
 */
export function citeTests(
  tests: ClosestTest[],
  explanation: string | null,
  sheets: Map<string, TestSheet>,
  investigation: InvestigationRef | null,
  accession: string,
): CitedTest[] {
  const named =
    explanation === null
      ? []
      : tests.filter(({ test }) => mentions(explanation, test.testsheet_id) || mentions(explanation, test.cir_id));
  return (named.length > 0 ? named : tests).map(({ test }) => {
    const sheet = test.testsheet_id ? sheets.get(test.testsheet_id) : undefined;
    return {
      testsheet_id: test.testsheet_id,
      cir_id: test.cir_id,
      test_end: test.test_end,
      label: formatLabel({
        doc_title: sheet?.title ?? testName(test),
        doc_authors: null,
        year: null,
        page: null,
        acronym: investigation?.acronym ?? null,
        accession,
        psi_folder: sheet?.psiFolder ?? null,
      }),
      investigation_url: investigation?.investigationUrl ?? null,
    };
  });
}

/** `id` appears in `text` as a whole token (FLEX-046 does not match inside FLEX-0461). */
function mentions(text: string, id: string | null): boolean {
  if (!id) return false;
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`).test(text);
}
