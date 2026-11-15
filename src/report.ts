import { parseArgs } from 'node:util';
import { openCorpus } from './db.ts';
import { embed, type EmbedOptions } from './embeddings.ts';
import { anthropicStructuredClient, anthropicTokenCounter } from './reports/claude.ts';
import { loadReportConfig } from './reports/config.ts';
import {
  dryRunInvestigations,
  formatDryRun,
  formatUsage,
  generateInvestigationsReport,
} from './reports/investigations.ts';
import { PROMPTS_DIR } from './reports/prompts.ts';

/*
 * Offline report generator, run by the team, never by the /chat service:
 *
 *   pnpm report investigations [--only PSI-25,PSI-69] [--force] [--out reports] [--dry-run]
 */

const KINDS = ['investigations'] as const;
/** The official challenge text: an input of every report, whatever --out says. */
const CHALLENGE_PATH = 'reports/inputs/challenge.md';
const USAGE = 'usage: pnpm report investigations [--only PSI-25,PSI-69] [--force] [--out reports] [--dry-run]';

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      only: { type: 'string' },
      force: { type: 'boolean', default: false },
      out: { type: 'string', default: 'reports' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  const [kind, ...extra] = positionals;
  if (!KINDS.includes(kind as (typeof KINDS)[number]) || extra.length) {
    throw new Error(`unknown report ${JSON.stringify(positionals.join(' '))}. ${USAGE}`);
  }
  const only = values.only
    ?.split(',')
    .map((a) => a.trim())
    .filter(Boolean);
  if (values.only !== undefined && !only?.length) throw new Error(`--only needs accessions. ${USAGE}`);
  const dryRun = values['dry-run'];

  const config = loadReportConfig(process.env, { requireApiKey: !dryRun });
  const corpus = openCorpus(config.corpusPath);
  const engineUrl = config.engineUrl;

  // One line per distinct warning: the scoped searches would repeat the BM25 fallback dozens of times.
  const warned = new Set<string>();
  const warn = (message: string) => {
    if (!warned.has(message)) {
      warned.add(message);
      console.warn(`warning: ${message}`);
    }
  };
  const embedding: Omit<EmbedOptions, 'engineUrl'> = {
    modelId: corpus.info.embedding.model_id,
    dimension: corpus.info.embedding.dimension,
  };
  const deps = {
    corpus,
    warn,
    embed: engineUrl
      ? (text: string) => embed(text, { engineUrl, ...embedding })
      : async (): Promise<number[]> => {
          throw new Error('ENGINE_URL is not set');
        },
    model: config.model,
    log: (message: string) => console.log(message),
  };
  const options = {
    outDir: values.out,
    challengePath: CHALLENGE_PATH,
    promptsDir: PROMPTS_DIR,
    only,
    force: values.force,
  };

  try {
    if (dryRun) {
      const result = await dryRunInvestigations(
        {
          ...deps,
          countTokens: config.apiKey
            ? anthropicTokenCounter({ apiKey: config.apiKey, model: config.model })
            : undefined,
        },
        options,
      );
      console.log(`\ndry run, prompt version ${result.prompt_version}: no generation call, no cache write`);
      console.log(`wrote ${result.entries.length} file(s) and ${result.synthesisPath} to ${result.dir}/\n`);
      console.log(formatDryRun(result));
      if (result.failed.length) process.exitCode = 1;
      return;
    }

    const { report, jsonPath, markdownPath } = await generateInvestigationsReport(
      { ...deps, client: anthropicStructuredClient({ apiKey: config.apiKey!, model: config.model }) },
      options,
    );

    const flags = report.investigations.reduce((n, r) => n + r.review_flags.length, 0);
    console.log(`\nwrote ${jsonPath} and ${markdownPath}`);
    console.log(
      `${report.investigations.length} ranked, ${report.failed.length} failed, ${flags} investigation flag(s), ${report.synthesis?.review_flags.length ?? 0} synthesis flag(s)`,
    );
    console.log(`\nToken usage of this run:\n${formatUsage(report.run.usage)}`);
    if (report.failed.length) process.exitCode = 1;
  } finally {
    corpus.db.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
