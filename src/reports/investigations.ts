import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Corpus } from '../db.ts';
import type { Embed, Warn } from '../rag.ts';
import { ReportCache, type CacheKey } from './cache.ts';
import {
  addUsage,
  callStructured,
  EFFORT,
  emptyUsage,
  MAX_TOKENS,
  type StructuredClient,
  type TokenCounter,
} from './claude.ts';
import { buildEvidence, listInvestigations, type Evidence, type InvestigationRow } from './evidence.ts';
import {
  coverageText,
  investigationUser,
  loadSystemPrompts,
  PROMPT_FILES,
  PROMPTS_DIR,
  promptVersion,
  type SystemPrompts,
} from './prompts.ts';
import { coverageMatrix, habitatTop, rankInvestigations } from './rank.ts';
import { renderInvestigations } from './render.ts';
import { RUBRIC_VERSION, rubricJson } from './rubric.ts';
import {
  InvestigationOutputSchema,
  strictJsonSchema,
  SynthesisOutputSchema,
} from './schema.ts';
import { synthesisInput, validateSynthesis } from './synthesis.ts';
import type { Failure, InvestigationRecord, InvestigationsReport, Synthesis, Usage } from './types.ts';
import { validateInvestigation } from './validate.ts';

/** Investigations in flight at once. */
export const CONCURRENCY = 4;

export type ReportDeps = {
  corpus: Corpus;
  embed: Embed;
  warn: Warn;
  client: StructuredClient;
  /** The requested model: part of the cache key and of the provenance. */
  model: string;
  log?: (message: string) => void;
  now?: () => Date;
};

export type ReportOptions = {
  /** Directory of investigations.json, investigations.md and .cache/. */
  outDir: string;
  /** The official challenge text (reports/inputs/challenge.md). */
  challengePath: string;
  /** Directory of the *.system.md prompt files; reports/prompts by default. */
  promptsDir?: string;
  /** Regenerate only these accessions; the others come from the cache or are skipped. */
  only?: string[];
  /** Ignore every cache entry. */
  force?: boolean;
};

export type ReportResult = {
  report: InvestigationsReport;
  markdown: string;
  jsonPath: string;
  markdownPath: string;
};

type RunSetup = {
  prompts: SystemPrompts;
  schemas: { investigation: Record<string, unknown>; synthesis: Record<string, unknown> };
  key: CacheKey;
  cache: ReportCache;
  all: InvestigationRow[];
  only?: Set<string>;
};

/** What a run and a dry run share: inputs, prompts, the cache key and the selection. */
function prepareRun(deps: { corpus: Corpus; model: string }, options: ReportOptions): RunSetup {
  let challenge: string;
  try {
    challenge = readFileSync(options.challengePath, 'utf8');
  } catch {
    throw new Error(`cannot read the challenge text at ${options.challengePath}`);
  }
  const prompts = loadSystemPrompts(options.promptsDir ?? PROMPTS_DIR, challenge);
  const schemas = {
    investigation: strictJsonSchema(InvestigationOutputSchema),
    synthesis: strictJsonSchema(SynthesisOutputSchema),
  };
  const key: CacheKey = {
    model: deps.model,
    // The schemas and call settings shape the reply as much as the prompts do.
    prompt_version: promptVersion(prompts, RUBRIC_VERSION, { schemas, effort: EFFORT, max_tokens: MAX_TOKENS }),
    rubric_version: RUBRIC_VERSION,
    corpus_built_at: deps.corpus.info.built_at,
    challenge_sha256: sha256(challenge),
  };

  const all = listInvestigations(deps.corpus.db);
  const only = options.only ? new Set(options.only) : undefined;
  if (only) {
    const unknown = [...only].filter((a) => !all.some((i) => i.accession === a));
    if (unknown.length) throw new Error(`--only names accessions not in the corpus: ${unknown.join(', ')}`);
  }
  return { prompts, schemas, key, cache: new ReportCache(join(options.outDir, '.cache')), all, only };
}

export async function generateInvestigationsReport(
  deps: ReportDeps,
  options: ReportOptions,
): Promise<ReportResult> {
  const log = deps.log ?? (() => {});
  const { prompts, schemas, key, cache, all, only } = prepareRun(deps, options);

  // Which investigations come from the cache, which are generated, which are left out.
  const records = new Map<string, InvestigationRecord>();
  const cached: string[] = [];
  const skipped: string[] = [];
  const todo: InvestigationRow[] = [];
  for (const investigation of all) {
    const regenerate = only ? only.has(investigation.accession) : options.force === true;
    const hit = regenerate ? undefined : cache.readInvestigation(investigation.accession, key);
    if (hit) {
      records.set(investigation.accession, hit);
      cached.push(investigation.accession);
    } else if (only && !only.has(investigation.accession)) {
      skipped.push(investigation.accession);
    } else {
      todo.push(investigation);
    }
  }
  log(`${all.length} investigations: ${cached.length} cached, ${todo.length} to generate, ${skipped.length} skipped`);

  const usage = { investigations: emptyUsage(), synthesis: emptyUsage(), total: emptyUsage() };
  const failed: Failure[] = [];
  await mapPool(todo, CONCURRENCY, async (investigation) => {
    const { accession } = investigation;
    const spent = emptyUsage();
    try {
      const evidence = await buildEvidence(investigation, deps);
      const { value, model } = await callStructured(
        deps.client,
        {
          system: prompts.investigation,
          user: investigationUser(evidence),
          schema: schemas.investigation,
          maxTokens: MAX_TOKENS,
        },
        InvestigationOutputSchema,
        spent,
      );
      const record = validateInvestigation(evidence, value, model, deps.model);
      cache.writeInvestigation(accession, key, record, spent);
      records.set(accession, record);
      log(`${accession}: ${evidence.passages.length} passages, ${record.review_flags.length} flag(s)`);
    } catch (error) {
      failed.push({ step: 'investigation', accession, error: error instanceof Error ? error.message : String(error) });
      log(`${accession}: failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      addUsage(usage.investigations, spent);
    }
  });

  const ranked = rankInvestigations([...records.values()]);

  let synthesis: Synthesis | null = null;
  if (ranked.length > 0) {
    const input = synthesisInput(ranked);
    const inputSha = sha256(input);
    // Keyed by its input too: any change in the records reruns it.
    synthesis = options.force ? null : (cache.readSynthesis(key, inputSha) ?? null);
    if (!synthesis) {
      const spent = emptyUsage();
      try {
        const { value, model } = await callStructured(
          deps.client,
          {
            system: prompts.synthesis,
            user: input,
            schema: schemas.synthesis,
            maxTokens: MAX_TOKENS,
          },
          SynthesisOutputSchema,
          spent,
        );
        synthesis = validateSynthesis(value, new Set(ranked.map((r) => r.accession)), model);
        cache.writeSynthesis(key, inputSha, synthesis, spent);
        log(`synthesis: ${synthesis.hardware_groups.length} group(s), ${synthesis.gaps.length} gap(s)`);
      } catch (error) {
        failed.push({ step: 'synthesis', accession: null, error: error instanceof Error ? error.message : String(error) });
        log(`synthesis: failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        addUsage(usage.synthesis, spent);
      }
    }
  }
  addUsage(addUsage(usage.total, usage.investigations), usage.synthesis);

  failed.sort((a, b) => (a.accession ?? '~').localeCompare(b.accession ?? '~', 'en', { numeric: true }));
  const report: InvestigationsReport = {
    run: {
      generated_at: (deps.now ?? (() => new Date()))().toISOString(),
      model: deps.model,
      prompt_version: key.prompt_version,
      rubric_version: RUBRIC_VERSION,
      corpus_built_at: deps.corpus.info.built_at,
      challenge_sha256: key.challenge_sha256,
      usage,
      cached,
      skipped,
    },
    rubric: rubricJson(),
    investigations: ranked,
    habitat_top: habitatTop(ranked),
    coverage: coverageMatrix(ranked),
    synthesis,
    failed,
  };

  const markdown = renderInvestigations(report);
  mkdirSync(options.outDir, { recursive: true });
  const jsonPath = join(options.outDir, 'investigations.json');
  const markdownPath = join(options.outDir, 'investigations.md');
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, markdown);
  return { report, markdown, jsonPath, markdownPath };
}

export type DryRunDeps = Omit<ReportDeps, 'client' | 'now'> & {
  /** Counts input tokens; without it the dry run reports characters only. */
  countTokens?: TokenCounter;
};

export type DryRunEntry = {
  accession: string;
  path: string;
  passages: number;
  system_chars: number;
  user_chars: number;
  /** From the token counting endpoint; null when not counted. */
  input_tokens: number | null;
  /** Whether a real run with the same flags would call the API for it (no valid cache entry). */
  would_call: boolean;
};

export type DryRunResult = {
  dir: string;
  prompt_version: string;
  entries: DryRunEntry[];
  /** The rendered synthesis system prompt; its user message needs the generated records. */
  synthesisPath: string;
  failed: Failure[];
};

export const DRY_RUN_DIR = '.dry-run';

/**
 * Everything up to the API call: per investigation, the rendered system prompt, the user message
 * and the evidence coverage, written to <outDir>/.dry-run/<accession>.md. No generation call and
 * no cache write. With `countTokens`, each request is counted through the token counting endpoint.
 */
export async function dryRunInvestigations(deps: DryRunDeps, options: ReportOptions): Promise<DryRunResult> {
  const log = deps.log ?? (() => {});
  const { prompts, schemas, key, cache, all, only } = prepareRun(deps, options);
  const dir = join(options.outDir, DRY_RUN_DIR);
  mkdirSync(dir, { recursive: true });

  const selected = only ? all.filter((i) => only.has(i.accession)) : all;
  const entries: DryRunEntry[] = [];
  const failed: Failure[] = [];
  let countFailed = false;

  await mapPool(selected, CONCURRENCY, async (investigation) => {
    const { accession } = investigation;
    try {
      const evidence = await buildEvidence(investigation, deps);
      const request = {
        system: prompts.investigation,
        user: investigationUser(evidence),
        schema: schemas.investigation,
        maxTokens: MAX_TOKENS,
      };
      // Read only: the same rule as a real run (--only and --force regenerate).
      const would_call = only !== undefined || options.force === true || !cache.readInvestigation(accession, key);
      let input_tokens: number | null = null;
      if (deps.countTokens && !countFailed) {
        try {
          input_tokens = await deps.countTokens(request);
        } catch (error) {
          // One failure (no network, rate limit) turns counting off for the rest of the run.
          countFailed = true;
          deps.warn(`${error instanceof Error ? error.message : String(error)}; reporting characters instead`);
        }
      }
      const entry: DryRunEntry = {
        accession,
        path: join(dir, `${accession}.md`),
        passages: evidence.passages.length,
        system_chars: request.system.length,
        user_chars: request.user.length,
        input_tokens,
        would_call,
      };
      writeFileSync(entry.path, dryRunMarkdown(evidence, entry, request, deps.model, key.prompt_version));
      entries.push(entry);
      log(`${accession}: ${evidence.passages.length} passages, wrote ${entry.path}`);
    } catch (error) {
      failed.push({ step: 'investigation', accession, error: error instanceof Error ? error.message : String(error) });
      log(`${accession}: failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  const synthesisPath = join(dir, '_synthesis.md');
  writeFileSync(
    synthesisPath,
    [
      '# Dry run: synthesis',
      '',
      `- Model: ${deps.model}`,
      `- Prompt version: ${key.prompt_version}`,
      `- System prompt: ${prompts.synthesis.length} characters, from ${join(options.promptsDir ?? PROMPTS_DIR, PROMPT_FILES.synthesis)}`,
      '- User message: built from the validated investigation records, so only a real run has it.',
      '',
      '## System prompt',
      '',
      fenced(prompts.synthesis, 'markdown'),
      '',
    ].join('\n'),
  );

  const byAccession = (a: { accession: string | null }, b: { accession: string | null }) =>
    (a.accession ?? '').localeCompare(b.accession ?? '', 'en', { numeric: true });
  entries.sort(byAccession);
  failed.sort(byAccession);
  return { dir, prompt_version: key.prompt_version, entries, synthesisPath, failed };
}

function dryRunMarkdown(
  evidence: Evidence,
  entry: DryRunEntry,
  request: { system: string; user: string },
  model: string,
  version: string,
): string {
  const { investigation, coverage } = evidence;
  const size =
    entry.input_tokens === null
      ? `${entry.system_chars + entry.user_chars} characters (system ${entry.system_chars}, user ${entry.user_chars}); not token-counted`
      : `${entry.input_tokens} input tokens (count_tokens, with the system prompt and output schema); ${entry.system_chars + entry.user_chars} characters`;
  return [
    `# Dry run: ${investigation.accession}${investigation.acronym ? ` (${investigation.acronym})` : ''}`,
    '',
    investigation.title,
    '',
    `- Model: ${model}`,
    `- Prompt version: ${version}`,
    `- Input: ${size}`,
    `- A real run with the same flags would ${entry.would_call ? 'call the API' : 'reuse its cache entry'}`,
    '',
    '## Evidence coverage',
    '',
    coverageText(coverage),
    `- Card only: ${coverage.card_only ? 'yes' : 'no'}`,
    `- Passages given to the model: ${entry.passages} (${Object.entries(coverage.passages)
      .map(([kind, n]) => `${kind} ${n}`)
      .join(', ')})`,
    `- Retrieval: ${coverage.retrieval}`,
    '',
    '## System prompt',
    '',
    fenced(request.system, 'markdown'),
    '',
    '## User message',
    '',
    fenced(request.user, 'text'),
    '',
  ].join('\n');
}

/** A code fence longer than any run of backticks inside the text. */
function fenced(text: string, lang: string): string {
  const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((m) => m[0].length));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}${lang}\n${text}\n${fence}`;
}

export function formatDryRun(result: DryRunResult): string {
  const counted = result.entries.some((e) => e.input_tokens !== null);
  const sum = (pick: (e: DryRunEntry) => number) => result.entries.reduce((n, e) => n + pick(e), 0);
  const size = (e: DryRunEntry) => (counted ? (e.input_tokens ?? 0) : e.system_chars + e.user_chars);
  const head = counted ? 'input tokens' : 'characters';
  const rows = result.entries.map(
    (e) =>
      `${e.accession.padEnd(10)} ${String(e.passages).padStart(8)} ${String(counted && e.input_tokens === null ? '—' : size(e)).padStart(13)}  ${e.would_call ? 'call' : 'cached'}`,
  );
  const lines = [
    `${'accession'.padEnd(10)} ${'passages'.padStart(8)} ${head.padStart(13)}  real run`,
    ...rows,
    `${'total'.padEnd(10)} ${String(sum((e) => e.passages)).padStart(8)} ${String(sum(size)).padStart(13)}  ${result.entries.filter((e) => e.would_call).length} call(s)`,
  ];
  if (counted) {
    lines.push(
      '',
      'Every request repeats the same system prompt; a real run writes it to the prompt cache once and reads it',
      'from there afterwards, so the billed input is lower than this total. Thinking and output are not included.',
    );
    if (result.entries.some((e) => e.input_tokens === null)) lines.push('Counting stopped after an error: "—" rows were not counted.');
  } else {
    lines.push('', 'Characters, not tokens: set ANTHROPIC_API_KEY to count tokens with the token counting endpoint.');
  }
  return lines.join('\n');
}

export function formatUsage(usage: InvestigationsReport['run']['usage']): string {
  const line = (name: string, u: Usage) =>
    `${name.padEnd(15)} ${String(u.calls).padStart(5)} ${String(u.input_tokens).padStart(10)} ${String(u.cache_creation_input_tokens).padStart(12)} ${String(u.cache_read_input_tokens).padStart(11)} ${String(u.output_tokens).padStart(10)}`;
  return [
    `${'step'.padEnd(15)} ${'calls'.padStart(5)} ${'input'.padStart(10)} ${'cache write'.padStart(12)} ${'cache read'.padStart(11)} ${'output'.padStart(10)}`,
    line('investigations', usage.investigations),
    line('synthesis', usage.synthesis),
    line('total', usage.total),
  ].join('\n');
}

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

async function mapPool<T>(items: T[], limit: number, run: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await run(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
