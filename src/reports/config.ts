type Env = Record<string, string | undefined>;

export const DEFAULT_REPORT_MODEL = 'claude-opus-5-5';

/**
 * The report generator's own configuration. It never reads src/config.ts, which requires the
 * server's variables.
 */
export function loadReportConfig(env: Env = process.env) {
  const apiKey = env.ANTHROPIC_API_KEY;
  // Only named here, never echoed.
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for pnpm report');
  return {
    apiKey,
    model: env.REPORT_MODEL || DEFAULT_REPORT_MODEL,
    corpusPath: env.CORPUS_PATH || 'storage/corpus.db',
    /** Optional: without it, or with the engine down, search falls back to BM25. */
    engineUrl: env.ENGINE_URL || undefined,
  };
}

export type ReportConfig = ReturnType<typeof loadReportConfig>;
