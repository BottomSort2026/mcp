import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { InvestigationRecord, Synthesis, Usage } from './types.ts';

/** A cached result is reused only when every field matches the current run. */
export type CacheKey = {
  model: string;
  prompt_version: string;
  rubric_version: string;
  corpus_built_at: string;
  /** reports/inputs/challenge.md is part of the system prompt. */
  challenge_sha256: string;
};

type Entry<T> = { key: CacheKey & { input_sha256?: string }; value: T; usage: Usage };

export const SYNTHESIS_FILE = '_synthesis.json';

export class ReportCache {
  constructor(readonly dir: string) {}

  readInvestigation(accession: string, key: CacheKey): InvestigationRecord | undefined {
    return this.read<InvestigationRecord>(`${accession}.json`, key);
  }

  writeInvestigation(accession: string, key: CacheKey, value: InvestigationRecord, usage: Usage): void {
    this.write(`${accession}.json`, { key, value, usage });
  }

  readSynthesis(key: CacheKey, inputSha: string): Synthesis | undefined {
    return this.read<Synthesis>(SYNTHESIS_FILE, { ...key, input_sha256: inputSha });
  }

  writeSynthesis(key: CacheKey, inputSha: string, value: Synthesis, usage: Usage): void {
    this.write(SYNTHESIS_FILE, { key: { ...key, input_sha256: inputSha }, value, usage });
  }

  private read<T>(file: string, key: Record<string, string>): T | undefined {
    let entry: Entry<T>;
    try {
      entry = JSON.parse(readFileSync(join(this.dir, file), 'utf8')) as Entry<T>;
    } catch {
      return undefined;
    }
    const stored = (entry?.key ?? {}) as Record<string, unknown>;
    const matches = Object.entries(key).every(([name, value]) => stored[name] === value);
    return matches && entry.value ? entry.value : undefined;
  }

  // Written to a temporary file and renamed, so an interrupted run never leaves half a file.
  private write<T>(file: string, entry: Entry<T>): void {
    mkdirSync(this.dir, { recursive: true });
    const path = join(this.dir, file);
    writeFileSync(`${path}.tmp`, `${JSON.stringify(entry, null, 2)}\n`);
    renameSync(`${path}.tmp`, path);
  }
}
