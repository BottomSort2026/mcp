import { parseArgs } from 'node:util';
import { openCorpus } from './db.ts';
import { embed } from './embeddings.ts';
import { anthropicStructuredClient } from './reports/claude.ts';
import { loadReportConfig } from './reports/config.ts';
import { formatUsage, generateInvestigationsReport } from './reports/investigations.ts';

/*
 * Offline report generator, run by the team, never by the /chat service:
 *
 *   pnpm report investigations [--only PSI-25,PSI-69] [--force] [--out reports]
 */

const KINDS = ['investigations'] as const;
/** The official challenge text: an input of every report, whatever --out says. */
const CHALLENGE_PATH = 'reports/inputs/challenge.md';
const USAGE = 'usage: pnpm report investigations [--only PSI-25,PSI-69] [--force] [--out reports]';

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      only: { type: 'string' },
      force: { type: 'boolean', default: false },
      out: { type: 'string', default: 'reports' },
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

  const config = loadReportConfig();
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

  try {
    const { report, jsonPath, markdownPath } = await generateInvestigationsReport(
      {
        corpus,
        warn,
        embed: engineUrl
          ? (text) =>
              embed(text, {
                engineUrl,
                modelId: corpus.info.embedding.model_id,
                dimension: corpus.info.embedding.dimension,
              })
          : async () => {
              throw new Error('ENGINE_URL is not set');
            },
        client: anthropicStructuredClient({ apiKey: config.apiKey, model: config.model }),
        model: config.model,
        log: (message) => console.log(message),
      },
      {
        outDir: values.out,
        challengePath: CHALLENGE_PATH,
        only,
        force: values.force,
      },
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
