import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Corpus } from '../db.ts';
import type { Embed, Warn } from '../rag.ts';
import { ReportCache, type CacheKey } from './cache.ts';
import { addUsage, callStructured, emptyUsage, MAX_TOKENS, type StructuredClient } from './claude.ts';
import { buildEvidence, listInvestigations, type InvestigationRow } from './evidence.ts';
import { investigationSystem, investigationUser, PROMPT_VERSION, SYNTHESIS_SYSTEM } from './prompts.ts';
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

export async function generateInvestigationsReport(
  deps: ReportDeps,
  options: ReportOptions,
): Promise<ReportResult> {
  const log = deps.log ?? (() => {});
  let challenge: string;
  try {
    challenge = readFileSync(options.challengePath, 'utf8');
  } catch {
    throw new Error(`cannot read the challenge text at ${options.challengePath}`);
  }
  const key: CacheKey = {
    model: deps.model,
    prompt_version: PROMPT_VERSION,
    rubric_version: RUBRIC_VERSION,
    corpus_built_at: deps.corpus.info.built_at,
    challenge_sha256: sha256(challenge),
  };
  const cache = new ReportCache(join(options.outDir, '.cache'));

  const all = listInvestigations(deps.corpus.db);
  const only = options.only ? new Set(options.only) : undefined;
  if (only) {
    const unknown = [...only].filter((a) => !all.some((i) => i.accession === a));
    if (unknown.length) throw new Error(`--only names accessions not in the corpus: ${unknown.join(', ')}`);
  }

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
  const system = investigationSystem(challenge);
  const schema = strictJsonSchema(InvestigationOutputSchema);

  await mapPool(todo, CONCURRENCY, async (investigation) => {
    const { accession } = investigation;
    const spent = emptyUsage();
    try {
      const evidence = await buildEvidence(investigation, deps);
      const { value, model } = await callStructured(
        deps.client,
        { system, user: investigationUser(evidence), schema, maxTokens: MAX_TOKENS },
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
            system: SYNTHESIS_SYSTEM,
            user: input,
            schema: strictJsonSchema(SynthesisOutputSchema),
            maxTokens: MAX_TOKENS,
          },
          SynthesisOutputSchema,
          spent,
        );
        synthesis = validateSynthesis(value, new Set(ranked.map((r) => r.accession)), model);
        cache.writeSynthesis(key, inputSha, synthesis, spent);
        log(`synthesis: ${synthesis.groups.length} group(s), ${synthesis.gaps.length} gap(s)`);
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
      prompt_version: PROMPT_VERSION,
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
