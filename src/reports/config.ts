import { DEFAULT_MAX_TOKENS, MAX_TOKENS_VARIABLE } from './claude.ts';

type Env = Record<string, string | undefined>;

export const DEFAULT_REPORT_MODEL = 'claude-opus-5-5';

/**
 * The report generator's own configuration. It never reads src/config.ts, which requires the
 * server's variables.
 */
export function loadReportConfig(env: Env = process.env, options: { requireApiKey?: boolean } = {}) {
  const apiKey = env.ANTHROPIC_API_KEY || undefined;
  // Only named here, never echoed. --dry-run works without it (it then counts characters).
  if (!apiKey && options.requireApiKey !== false) throw new Error('ANTHROPIC_API_KEY is required for pnpm report');
  return {
    apiKey,
    model: env.REPORT_MODEL || DEFAULT_REPORT_MODEL,
    /** max_tokens of every report call, thinking included. */
    maxTokens: positiveInt(env[MAX_TOKENS_VARIABLE], MAX_TOKENS_VARIABLE, DEFAULT_MAX_TOKENS),
    corpusPath: env.CORPUS_PATH || 'storage/corpus.db',
    /** Optional: without it, or with the engine down, search falls back to BM25. */
    engineUrl: env.ENGINE_URL || undefined,
  };
}

export type ReportConfig = ReturnType<typeof loadReportConfig>;

function positiveInt(value: string | undefined, name: string, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer, got ${JSON.stringify(value)}`);
  return n;
}
