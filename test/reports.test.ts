import Anthropic from '@anthropic-ai/sdk';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { toCitation } from '../src/citations.ts';
import { openCorpus, type Corpus } from '../src/db.ts';
import { search } from '../src/rag.ts';
import { z } from 'zod';
import {
  anthropicReportClient,
  anthropicTokenCounter,
  callJson,
  EFFORT,
  emptyUsage,
  type ReportClient,
  type ReportReply,
  type ReportRequest,
  type TokenCounter,
} from '../src/reports/claude.ts';
import { buildEvidence, cardDocId, listInvestigations } from '../src/reports/evidence.ts';
import {
  mentionsElevatedOxygen,
  mentionsLunarConditions,
  mentionsPartialGravity,
  mentionsReducedPressure,
} from '../src/reports/conditions.ts';
import { dryRunInvestigations, generateInvestigationsReport } from '../src/reports/investigations.ts';
import {
  loadSystemPrompts,
  OUTPUT_SCHEMAS,
  outputFormatSection,
  PROMPT_FILES,
  promptVersion,
  renderPrompt,
} from '../src/reports/prompts.ts';
import { rankInvestigations, total } from '../src/reports/rank.ts';
import { renderInvestigations } from '../src/reports/render.ts';
import { HABITATS, MODEL_CRITERIA, OBJECTIVES, RUBRIC_VERSION, type Habitat } from '../src/reports/rubric.ts';
import {
  InvestigationOutputSchema,
  LIMITS,
  SynthesisOutputSchema,
  type InvestigationOutput,
} from '../src/reports/schema.ts';
import type { InvestigationRecord, InvestigationsReport } from '../src/reports/types.ts';
import { validateInvestigation } from '../src/reports/validate.ts';
import { axis, withIndex, type IndexOptions } from './fixtures.ts';

const CORPUS = fileURLToPath(new URL('../storage/corpus.db', import.meta.url));
const SNAPSHOT_JSON = fileURLToPath(new URL('./snapshots/investigations.report.json', import.meta.url));
const SNAPSHOT_MD = fileURLToPath(new URL('./snapshots/investigations.md', import.meta.url));
const PROMPTS = fileURLToPath(new URL('../reports/prompts', import.meta.url));
const MODEL = 'claude-opus-5-5';
const FIXED_NOW = () => new Date('2026-11-15T12:00:00Z');

const engineDown = async (): Promise<number[]> => {
  throw new Error('engine down');
};
const quiet = () => {};
const noWarnings = (message: string) => assert.fail(`unexpected warning: ${message}`);

const METADATA: IndexOptions['metadata'] = {
  'PSI-1': {
    doi: '10.1/psi-1',
    releaseDate: '01-Jan-2020',
    licenseName: 'Creative Commons Zero v1.0 Universal',
    licenseIdentifier: 'CC0-1.0',
    investigators: [
      { firstName: 'Ada', lastName: 'Flame', affiliation: 'GRC', roles: ['Principal Investigator (PI)'] },
    ],
    publications: [{ title: 'Fabric flammability in microgravity', authorList: 'Flame A.', doi: '10.1/pub' }],
  },
};

async function withCorpus<T>(run: (corpus: Corpus) => Promise<T>): Promise<T> {
  return withIndex(
    async (path) => {
      const corpus = openCorpus(path);
      try {
        return await run(corpus);
      } finally {
        corpus.db.close();
      }
    },
    { metadata: METADATA },
  );
}

function withTempDir<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-report-'));
  return run(dir).finally(() => rmSync(dir, { recursive: true, force: true }));
}

/** A complete model answer whose every claim cites `sources`. */
function fakeOutput(sources: number[] = [1], score: 0 | 1 | 2 | 3 = 2): InvestigationOutput {
  const claim = () => ({ text: 'Stated in the passages.', sources: [...sources] });
  const maybe = () => ({ stated: true, text: 'Stated in the passages.', sources: [...sources] });
  const scored = () => ({ score, reason: 'From the objectives.', sources: [...sources] });
  return {
    summary: { plain: claim(), technical: claim() },
    scores: Object.fromEntries(MODEL_CRITERIA.map((c) => [c.key, scored()])),
    habitats: Object.fromEntries(HABITATS.map((h) => [h, scored()])),
    contributions: Object.fromEntries(OBJECTIVES.map((o) => [o, maybe()])),
    pillars: {
      prevention: maybe(),
      detection: { stated: false, text: 'not stated in the corpus', sources: [] },
      suppression: maybe(),
    },
    profile: {
      hardware: maybe(),
      flight_platform: maybe(),
      dates: maybe(),
      fuels: maybe(),
      sample_shape_size: maybe(),
      oxygen: maybe(),
      pressure: { stated: false, text: 'not stated in the corpus', sources: [] },
      airflow: maybe(),
      fuel_type: { value: 'solid', sources: [...sources] },
      variables: [claim()],
      constants: [],
      sensors: [claim()],
      measurements: [],
    },
    data_for_modeling: { text: 'Flame spread rates.', readiness: 'needs_extraction', sources: [...sources] },
    key_findings: [claim()],
    limitations: [claim()],
  } as InvestigationOutput;
}

const SYNTHESIS = {
  overview: { text: 'Two fixture investigations.', accessions: ['PSI-1', 'PSI-2'] },
  hardware_groups: [
    {
      name: 'Other',
      hardware: 'Fixture rigs',
      accessions: ['PSI-1', 'PSI-2', 'PSI-999'],
      similarities: [{ text: 'Both burn in microgravity.', accessions: ['PSI-1', 'PSI-2'] }],
      differences: [{ text: 'An invented investigation.', accessions: ['PSI-999'] }],
    },
  ],
  gaps: [{ text: 'No partial-gravity data.', accessions: ['PSI-1', 'PSI-2'] }],
};

const usage = (input = 1000, output = 100) => ({
  calls: 1,
  input_tokens: input,
  output_tokens: output,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
});
const reply = (text: string, stopReason = 'end_turn'): ReportReply => ({
  text,
  stopReason,
  model: MODEL,
  usage: usage(),
});

/**
 * Fake Claude: answers the synthesis with SYNTHESIS and each investigation with fakeOutput,
 * PSI-1 scoring 3 and PSI-2 scoring 1. `answer` can override a reply per accession and attempt.
 */
function fakeClaude(answer?: (accession: string, attempt: number) => ReportReply | undefined) {
  const calls: Array<{ accession: string | null; request: ReportRequest }> = [];
  const client: ReportClient = async (request) => {
    const user = request.messages[0].content;
    if (user.startsWith('Records:')) {
      calls.push({ accession: null, request });
      return reply(JSON.stringify(SYNTHESIS));
    }
    const accession = /^Investigation: (?:[^\n(]*\()?(PSI-\d+)/.exec(user)![1];
    calls.push({ accession, request });
    const attempt = calls.filter((c) => c.accession === accession).length;
    return (
      answer?.(accession, attempt) ??
      reply(JSON.stringify(fakeOutput([1], accession === 'PSI-1' ? 3 : 1)))
    );
  };
  return { client, calls };
}

test('each system prompt ends with the ## Output format section and its JSON Schema', () => {
  const prompts = loadSystemPrompts(PROMPTS, 'Challenge.');
  for (const name of ['investigation', 'synthesis'] as const) {
    const section = outputFormatSection(OUTPUT_SCHEMAS[name]);
    assert.ok(prompts[name].endsWith(`\n\n${section}`), `${name} ends with its output format section`);
    assert.match(section, /^## Output format\n\nRespond with exactly one JSON object that matches the schema below\./);
    assert.match(section, /no Markdown fences/);
    const schema = JSON.parse(section.slice(section.indexOf('\n{') + 1));
    assert.deepEqual(schema, z.toJSONSchema(OUTPUT_SCHEMAS[name]));
    // The files themselves carry no schema text.
    assert.ok(!readFileSync(join(PROMPTS, PROMPT_FILES[name]), 'utf8').includes('## Output format'));
  }
  // Scores are an integer enum, and the list limits reach the model as maxItems.
  const schema = z.toJSONSchema(InvestigationOutputSchema) as any;
  assert.deepEqual(schema.properties.scores.properties.fire_safety_directness.properties.score.enum, [0, 1, 2, 3]);
  assert.equal(schema.properties.key_findings.maxItems, LIMITS.key_findings);
  assert.ok(InvestigationOutputSchema.safeParse(fakeOutput()).success);
});

test('evidence: card chunks, the PSI record passage and linked fact sheets, all numbered', async () => {
  await withCorpus(async (corpus) => {
    const [psi1, psi2] = listInvestigations(corpus.db);
    const deps = { corpus, embed: engineDown, warn: quiet };

    const one = await buildEvidence(psi1, deps);
    assert.deepEqual(
      one.passages.map((p) => [p.n, p.kind, p.hit.chunkId]),
      [
        [1, 'card', 'PSI-1:card#0000'],
        [2, 'card', 'PSI-1:card#0001'],
        [3, 'record', 'PSI-1:record'],
        [4, 'linked', 'ext:factsheet-fire#0000'],
        [5, 'linked', 'ext:factsheet-fire#0001'],
      ],
    );

    const record = one.passages[2].hit;
    assert.match(record.text, /DOI: 10\.1\/psi-1/);
    assert.match(record.text, /Release date: 01-Jan-2020/);
    assert.match(record.text, /License: Creative Commons Zero v1\.0 Universal \(CC0-1\.0\)/);
    assert.match(record.text, /- Ada Flame, GRC \(Principal Investigator \(PI\)\)/);
    assert.match(record.text, /- "Fabric flammability in microgravity"\. Flame A\.\. DOI 10\.1\/pub/);
    // Cited like the card: investigation page, no page, no public URL.
    const citation = toCitation(record, 3);
    assert.equal(citation.investigation_url, 'https://psi.example/investigations/PSI-1');
    assert.equal(citation.public_url, null);
    assert.equal(citation.page, null);

    assert.deepEqual(one.coverage, {
      own: [{ doc_type: 'metadata', documents: 1, chunks: 2, paginated_documents: 0 }],
      linked: [{ doc_type: 'factsheet', documents: 1, chunks: 2, paginated_documents: 1 }],
      has_pages: false,
      card_only: false,
      passages: { card: 2, record: 1, linked: 2, book: 0, own: 0 },
      retrieval: 'bm25',
    });

    // No card: the record comes first, and the scoped search finds the test sheet.
    const two = await buildEvidence(psi2, deps);
    assert.deepEqual(
      two.passages.map((p) => [p.n, p.kind, p.hit.chunkId]),
      [
        [1, 'record', 'PSI-2:record'],
        [2, 'linked', 'ext:factsheet-fire#0000'],
        [3, 'linked', 'ext:factsheet-fire#0001'],
        [4, 'own', 'PSI-2:test-a#0000'],
      ],
    );
    assert.match(two.passages[0].hit.text, /DOI: not listed in the PSI record/);
  });
});

test('scoped search returns only chunks of the requested accession, in both methods and with the engine down', async () => {
  await withCorpus(async (corpus) => {
    // Words of PSI-1 (chunks 1, 2) and PSI-2 (chunk 3); the vector points at PSI-1's chunk 1.
    const query = 'SAFFIRE-T flame heptane droplet';
    const unscoped = await search(corpus, query, async () => axis(0), noWarnings, { k: 10 });
    assert.ok(unscoped.hits.some((hit) => hit.accession === 'PSI-1'));

    const hybrid = await search(corpus, query, async () => axis(0), noWarnings, { accession: 'PSI-2', k: 10 });
    assert.equal(hybrid.mode, 'hybrid');
    assert.deepEqual(hybrid.hits.map((hit) => [hit.id, hit.methods]), [[3, ['bm25', 'vector']]]);

    // An empty query has no BM25 terms: vectors alone, still inside the scope.
    const vectors = await search(corpus, '', async () => axis(0), noWarnings, { accession: 'PSI-2' });
    assert.deepEqual(vectors.hits.map((hit) => [hit.id, hit.methods]), [[3, ['vector']]]);
    const ranked = await search(corpus, '', async () => axis(1), noWarnings, { accession: 'PSI-1', k: 10 });
    assert.deepEqual(ranked.hits.map((hit) => hit.id), [2, 1], 'exact distances order the scope');

    const warnings: string[] = [];
    const bm25 = await search(corpus, query, engineDown, (m) => warnings.push(m), { accession: 'PSI-1', k: 10 });
    assert.equal(bm25.mode, 'bm25');
    assert.equal(warnings.length, 1);
    assert.ok(bm25.hits.length > 0);
    assert.ok(bm25.hits.every((hit) => hit.accession === 'PSI-1'));

    const facts = await search(corpus, 'fires crew flames', engineDown, quiet, { docType: 'factsheet', k: 10 });
    assert.ok(facts.hits.length > 0 && facts.hits.every((hit) => hit.docType === 'factsheet'));

    const none = await search(corpus, query, async () => axis(0), noWarnings, { accession: 'PSI-404' });
    assert.deepEqual(none.hits, []);
  });
});

test('validation drops a claim citing passage 99, flags it, and renumbers the cited passages', async () => {
  await withCorpus(async (corpus) => {
    const [psi1] = listInvestigations(corpus.db);
    const evidence = await buildEvidence(psi1, { corpus, embed: engineDown, warn: quiet });
    assert.equal(evidence.passages.length, 5);

    const output = fakeOutput([2]);
    output.key_findings = [
      { text: 'Real finding.', sources: [4] },
      { text: 'Invented finding.', sources: [99] },
    ];
    output.summary.plain = { text: 'Half invented.', sources: [2, 99] };
    output.scores.earth_applications = { score: 3, reason: 'No source.', sources: [] };

    const record = validateInvestigation(evidence, output, MODEL, MODEL);
    assert.deepEqual(record.key_findings.map((c) => c.text), ['Real finding.']);
    assert.equal(record.summary.plain, null);
    assert.equal(record.scores.earth_applications, null);
    assert.equal(record.profile.pressure, null, 'not stated becomes null without a flag');
    assert.deepEqual(Object.keys(record.pillars), ['prevention', 'suppression']);

    assert.deepEqual(record.review_flags, [
      { code: 'dropped_claim', message: 'summary.plain was dropped: it cites passage 99, which does not exist (5 passages)' },
      { code: 'dropped_claim', message: 'scores.earth_applications was dropped: it cites no passage' },
      { code: 'dropped_score', message: 'scores.earth_applications counts as 0 in the total' },
      { code: 'dropped_claim', message: 'key_findings[1] was dropped: it cites passage 99, which does not exist (5 passages)' },
    ]);

    // Passages 2 and 4 are the only ones cited: they become sources 1 and 2.
    assert.deepEqual(
      record.sources.map((c) => [c.n, c.doc_title, c.doc_type]),
      [
        [1, 'Spacecraft Fire Test', 'metadata'],
        [2, 'Fire in Space Fact Sheet', 'factsheet'],
      ],
    );
    assert.deepEqual(record.key_findings[0].sources, [2]);
    assert.deepEqual(record.summary.technical?.sources, [1]);
    assert.deepEqual(record.profile.fuel_type, { value: 'solid', sources: [1] });
  });
});

const COVERAGE = {
  own: [],
  linked: [],
  has_pages: false,
  card_only: false,
  passages: { card: 1, record: 1, linked: 0, book: 0, own: 0 },
  retrieval: 'hybrid' as const,
};

function record(
  accession: string,
  fireRelevance: number,
  scores: Record<string, number>,
  habitats: number | Partial<Record<Habitat, number>>,
): InvestigationRecord {
  const s = (score: number) => ({ score, reason: 'r', sources: [1] });
  const habitat = (h: Habitat) => (typeof habitats === 'number' ? habitats : (habitats[h] ?? 0));
  return {
    accession,
    acronym: null,
    title: `Investigation ${accession}`,
    investigation_url: `https://psi.example/${accession}`,
    fire_relevance: fireRelevance,
    evidence_coverage: COVERAGE,
    summary: { plain: null, technical: null },
    scores: Object.fromEntries(MODEL_CRITERIA.map((c) => [c.key, s(scores[c.key] ?? 0)])),
    habitats: Object.fromEntries(HABITATS.map((h) => [h, s(habitat(h))])) as InvestigationRecord['habitats'],
    contributions: Object.fromEntries(OBJECTIVES.map((o) => [o, null])) as InvestigationRecord['contributions'],
    pillars: {},
    profile: {} as InvestigationRecord['profile'],
    data_for_modeling: null,
    key_findings: [],
    limitations: [],
    sources: [],
    review_flags: [],
    model: MODEL,
  };
}

test('ranking: weights and tie-breaks give the expected order, and tier_mismatch fires', () => {
  const all3 = Object.fromEntries(MODEL_CRITERIA.map((c) => [c.key, 3]));
  // Weights 3, 2 (habitats), 2, 2, 1: the maximum is 30 weighted points.
  assert.equal(total(record('PSI-1', 1, all3, 3)), 100);
  assert.equal(total(record('PSI-1', 1, { fire_safety_directness: 3 }, 0)), 30);
  assert.equal(total(record('PSI-1', 1, {}, { spacecraft: 3, station: 2, moon_base: 1, rover: 0 })), 10);

  const ranked = rankInvestigations([
    record('PSI-3', 1, {}, 0), // 0: tier 1 in the bottom third
    record('PSI-10', 2, { predictive_modeling_data: 3, earth_applications: 3 }, 0), // 30
    record('PSI-9', 2, { fire_safety_directness: 3 }, 0), // 30
    record('PSI-5', 1, { controls_and_equipment: 3, predictive_modeling_data: 1, earth_applications: 1 }, 0), // 30
    record('PSI-7', 3, all3, 3), // 100: tier 3 in the top third
  ]);

  assert.deepEqual(
    ranked.map((r) => [r.rank, r.accession, r.total]),
    [
      [1, 'PSI-7', 100],
      [2, 'PSI-5', 30], // tier 1 first among the ties
      [3, 'PSI-9', 30], // then accession, PSI-9 before PSI-10
      [4, 'PSI-10', 30],
      [5, 'PSI-3', 0],
    ],
  );
  assert.deepEqual(ranked[0].scores.habitat_relevance, {
    score: 3,
    computed: true,
    reason: 'Mean of the four habitat scores (3, 3, 3, 3)',
  });
  assert.deepEqual(
    ranked.map((r) => r.review_flags.map((f) => f.code)),
    [['tier_mismatch'], [], [], [], ['tier_mismatch']],
  );
  assert.match(ranked[4].review_flags[0].message, /fire_relevance 1 but ranked 5 of 5/);
});

const REQUEST: ReportRequest = { system: 's', messages: [{ role: 'user', content: 'u' }], maxTokens: 100 };

/** A ReportClient that answers from `replies` in order and records every request. */
function scripted(replies: ReportReply[]) {
  const requests: ReportRequest[] = [];
  const client: ReportClient = async (request) => {
    requests.push(structuredClone(request));
    return replies.shift() ?? assert.fail('unexpected call');
  };
  return { client, requests };
}

test('callJson: a reply in a ```json fence, or with prose around it, parses and validates', async () => {
  for (const text of [
    `\`\`\`json\n${JSON.stringify(fakeOutput(), null, 2)}\n\`\`\``,
    `Here is the object:\n${JSON.stringify(fakeOutput())}\nDone.`,
  ]) {
    const fake = scripted([reply(text)]);
    const result = await callJson(fake.client, REQUEST, InvestigationOutputSchema, emptyUsage());
    assert.deepEqual(result.value, fakeOutput());
    assert.equal(fake.requests.length, 1);
  }
});

test('callJson: an invalid reply gets one repair call carrying that reply and its issues', async () => {
  const bad = JSON.stringify({ summary: {}, scores: {} });
  const fake = scripted([reply(bad), reply(JSON.stringify(fakeOutput()))]);
  const spent = emptyUsage();
  const result = await callJson(fake.client, REQUEST, InvestigationOutputSchema, spent);
  assert.equal(result.model, MODEL);
  assert.equal(fake.requests.length, 2, 'exactly two calls');
  assert.equal(spent.calls, 2, 'both calls are counted');
  assert.equal(spent.input_tokens, 2000);

  const [first, second] = fake.requests;
  assert.deepEqual(first, REQUEST);
  assert.equal(second.system, REQUEST.system);
  assert.equal(second.maxTokens, REQUEST.maxTokens);
  assert.equal(second.messages.length, 3);
  assert.deepEqual(second.messages.slice(0, 2), [REQUEST.messages[0], { role: 'assistant', content: bad }]);
  const repair = second.messages[2];
  assert.equal(repair.role, 'user');
  const issues = repair.content.split('\n').filter((line) => line.startsWith('- '));
  assert.equal(issues.length, 10, 'at most 10 issues');
  assert.match(repair.content, /^- summary\.plain: /m);
  assert.match(repair.content, /\(and \d+ more\)/);
  assert.match(repair.content, /complete corrected JSON object only/);
});

test('callJson: a reply that is not JSON is repaired too', async () => {
  const fake = scripted([reply('not json'), reply(JSON.stringify(fakeOutput()))]);
  await callJson(fake.client, REQUEST, InvestigationOutputSchema, emptyUsage());
  assert.match(fake.requests[1].messages[2].content, /^- \(reply\): no valid JSON object found$/m);
});

test('callJson: two invalid replies fail with the first issues', async () => {
  const fake = scripted([reply('not json'), reply('{"summary": {}}')]);
  const spent = emptyUsage();
  await assert.rejects(
    callJson(fake.client, REQUEST, InvestigationOutputSchema, spent),
    /^ReportCallError: the reply is not valid after one repair: summary\.plain: [^;]+; [^;]+; [^;]+$/,
  );
  assert.equal(spent.calls, 2);
});

test('callJson: stop_reason max_tokens fails without a repair call and names REPORT_MAX_TOKENS', async () => {
  const fake = scripted([reply('{"summary": ', 'max_tokens')]);
  const spent = emptyUsage();
  await assert.rejects(
    callJson(fake.client, REQUEST, InvestigationOutputSchema, spent),
    /the output was truncated at max_tokens \(100\); raise REPORT_MAX_TOKENS/,
  );
  assert.equal(fake.requests.length, 1);
  assert.equal(spent.calls, 1);
});

test('generator: failed investigations are recorded and the run continues', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      writeFileSync(join(dir, 'challenge.md'), 'Challenge text.');
      const fake = fakeClaude((accession, attempt) => {
        if (accession === 'PSI-1' && attempt === 1) return reply('{"truncated": ');
        if (accession === 'PSI-2') return reply('{"summary": ', 'max_tokens');
        return undefined;
      });
      const { report } = await generateInvestigationsReport(
        { corpus, embed: engineDown, warn: quiet, client: fake.client, model: MODEL, now: FIXED_NOW },
        { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir: PROMPTS },
      );
      assert.deepEqual(report.investigations.map((r) => r.accession), ['PSI-1']);
      assert.deepEqual(report.failed, [
        {
          step: 'investigation',
          accession: 'PSI-2',
          error: 'the output was truncated at max_tokens (16000); raise REPORT_MAX_TOKENS and rerun',
        },
      ]);
      // PSI-1: the reply and its repair; PSI-2: one call, no repair after a truncation.
      assert.equal(report.run.usage.investigations.calls, 3);
      assert.equal(fake.calls.filter((c) => c.accession === 'PSI-2').length, 1);
      assert.equal(report.run.usage.synthesis.calls, 1);
      assert.ok(!existsSync(join(dir, '.cache', 'PSI-2.json')), 'failures are not cached');
    }),
  );
});

test('generator: two invalid replies record the investigation in failed', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      writeFileSync(join(dir, 'challenge.md'), 'Challenge text.');
      const fake = fakeClaude((accession) => (accession === 'PSI-2' ? reply('{"summary": {}}') : undefined));
      const { report } = await generateInvestigationsReport(
        { corpus, embed: engineDown, warn: quiet, client: fake.client, model: MODEL, now: FIXED_NOW, maxTokens: 9000 },
        { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir: PROMPTS },
      );
      assert.deepEqual(report.investigations.map((r) => r.accession), ['PSI-1']);
      assert.equal(report.failed.length, 1);
      assert.equal(report.failed[0].accession, 'PSI-2');
      assert.match(report.failed[0].error, /^the reply is not valid after one repair: summary\.plain: /);
      assert.equal(fake.calls.filter((c) => c.accession === 'PSI-2').length, 2);
      assert.equal(report.run.usage.investigations.calls, 3);
      assert.ok(fake.calls.every((c) => c.request.maxTokens === 9000), 'deps.maxTokens reaches every call');
    }),
  );
});

test('cache: a second run makes no calls; --force and --only regenerate', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      const challengePath = join(dir, 'challenge.md');
      writeFileSync(challengePath, 'Challenge text.');
      const fake = fakeClaude();
      const run = (options: { only?: string[]; force?: boolean; outDir?: string; model?: string }) =>
        generateInvestigationsReport(
          {
            corpus,
            embed: engineDown,
            warn: quiet,
            client: fake.client,
            model: options.model ?? MODEL,
            now: FIXED_NOW,
          },
          { outDir: options.outDir ?? dir, challengePath, promptsDir: PROMPTS, only: options.only, force: options.force },
        );
      const called = () => fake.calls.splice(0).map((c) => c.accession);

      const first = await run({});
      assert.deepEqual(called().sort(), ['PSI-1', 'PSI-2', null].sort());
      assert.deepEqual(first.report.run.usage.total, {
        calls: 3,
        input_tokens: 3000,
        output_tokens: 300,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      });
      assert.ok(existsSync(join(dir, '.cache', 'PSI-1.json')));
      assert.equal(readFileSync(join(dir, 'investigations.md'), 'utf8'), first.markdown);
      assert.deepEqual(JSON.parse(readFileSync(join(dir, 'investigations.json'), 'utf8')), first.report);
      assert.match(first.report.run.challenge_sha256, /^[0-9a-f]{64}$/);

      const second = await run({});
      assert.deepEqual(called(), [], 'a second run makes no calls');
      assert.deepEqual(second.report.run.cached, ['PSI-1', 'PSI-2']);
      assert.equal(second.report.run.usage.total.calls, 0);
      assert.deepEqual(second.report.investigations, first.report.investigations);
      assert.deepEqual(second.report.synthesis, first.report.synthesis);

      await run({ force: true });
      assert.deepEqual(called().sort(), ['PSI-1', 'PSI-2', null].sort());

      // --only regenerates just PSI-2; PSI-1 comes from the cache. Same records, so the synthesis too.
      const only = await run({ only: ['PSI-2'] });
      assert.deepEqual(called(), ['PSI-2']);
      assert.deepEqual(only.report.run.cached, ['PSI-1']);
      assert.equal(only.report.investigations.length, 2);

      // Another model is another cache key.
      await run({ model: 'claude-other' });
      assert.deepEqual(called().sort(), ['PSI-1', 'PSI-2', null].sort());

      // --only with an empty cache: the rest is skipped, not generated.
      const fresh = await run({ only: ['PSI-1'], outDir: join(dir, 'fresh') });
      assert.deepEqual(called(), ['PSI-1', null]);
      assert.deepEqual(fresh.report.run.skipped, ['PSI-2']);
      assert.deepEqual(fresh.report.investigations.map((r) => r.accession), ['PSI-1']);

      await assert.rejects(run({ only: ['PSI-404'] }), /--only names accessions not in the corpus: PSI-404/);
    }),
  );
});

test('generator: ranking, synthesis validation and the system prompt', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      writeFileSync(join(dir, 'challenge.md'), 'Official challenge text for the test.');
      const fake = fakeClaude();
      const { report } = await generateInvestigationsReport(
        { corpus, embed: engineDown, warn: quiet, client: fake.client, model: MODEL, now: FIXED_NOW },
        { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir: PROMPTS },
      );
      const investigation = fake.calls.find((c) => c.accession === 'PSI-1')!.request;
      assert.equal(investigation.system, loadSystemPrompts(PROMPTS, 'Official challenge text for the test.').investigation);
      assert.match(investigation.system, /## The challenge\n\nOfficial challenge text for the test\.\n\n## Output format\n\n/);
      assert.ok(investigation.system.endsWith(outputFormatSection(InvestigationOutputSchema)));
      assert.equal(investigation.maxTokens, 16000);
      assert.match(investigation.system, /### fire_safety_directness/);
      const synthesisCall = fake.calls.find((c) => c.accession === null)!.request;
      assert.match(synthesisCall.system, /`hardware_groups`/);
      assert.match(report.run.prompt_version, /^[0-9a-f]{12}$/);
      assert.match(investigation.messages[0].content, /\[3\] Spacecraft Fire Test — PSI record \| type: psi_record/);

      assert.deepEqual(report.investigations.map((r) => [r.rank, r.accession, r.total]), [
        [1, 'PSI-1', 100],
        [2, 'PSI-2', 33.3],
      ]);
      assert.deepEqual(report.habitat_top.spacecraft.map((e) => e.accession), ['PSI-1', 'PSI-2']);
      assert.deepEqual(report.coverage.prevention.station, ['PSI-1']);
      assert.deepEqual(report.coverage.detection.station, []);

      const synthesis = report.synthesis!;
      assert.deepEqual(synthesis.hardware_groups[0].accessions, ['PSI-1', 'PSI-2']);
      assert.deepEqual(synthesis.hardware_groups[0].differences, []);
      assert.deepEqual(
        synthesis.review_flags.map((f) => f.code),
        ['unknown_accession', 'unknown_accession', 'dropped_statement'],
      );

      // Refresh the Markdown snapshot's input with UPDATE_SNAPSHOTS=1.
      if (process.env.UPDATE_SNAPSHOTS === '1') {
        writeFileSync(SNAPSHOT_JSON, `${JSON.stringify(report, null, 2)}\n`);
      }
    }),
  );
});

test('the Markdown is rendered by code from a fixed JSON and matches the snapshot', () => {
  const report = JSON.parse(readFileSync(SNAPSHOT_JSON, 'utf8')) as InvestigationsReport;
  const markdown = renderInvestigations(report);
  if (process.env.UPDATE_SNAPSHOTS === '1') writeFileSync(SNAPSHOT_MD, markdown);
  assert.equal(markdown, readFileSync(SNAPSHOT_MD, 'utf8'));
});

test('the SDK client sends adaptive thinking, effort and a cached system prompt, and no output format', async () => {
  const seen: Array<Record<string, any>> = [];
  const events = [
    {
      type: 'message_start',
      message: {
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        model: MODEL,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 120, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 4000 },
      },
    },
    { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: '{"ok":' } },
    { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'true}' } },
    { type: 'content_block_stop', index: 0 },
    {
      type: 'message_delta',
      delta: { stop_reason: 'end_turn', stop_sequence: null },
      usage: { output_tokens: 42 },
    },
    { type: 'message_stop' },
  ];
  const body = events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join('');
  const client = new Anthropic({
    apiKey: 'sk-ant-test-not-a-real-key',
    fetch: async (input, init) => {
      seen.push(JSON.parse(String(init?.body)));
      if (String(input).includes('count_tokens')) {
        return new Response(JSON.stringify({ input_tokens: 77 }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
    },
  });

  const call = anthropicReportClient({ apiKey: 'unused', model: MODEL, client });
  const messages: ReportRequest['messages'] = [
    { role: 'user', content: 'User.' },
    { role: 'assistant', content: '{"bad": true}' },
    { role: 'user', content: 'Fix it.' },
  ];
  const result = await call({ system: 'System.', messages, maxTokens: 16000 });
  const counted = await anthropicTokenCounter({ apiKey: 'unused', model: MODEL, client })({
    system: 'System.',
    messages,
    maxTokens: 16000,
  });
  assert.equal(counted, 77);

  assert.deepEqual(result, {
    text: '{"ok":true}',
    stopReason: 'end_turn',
    model: MODEL,
    usage: { calls: 1, input_tokens: 120, output_tokens: 42, cache_creation_input_tokens: 0, cache_read_input_tokens: 4000 },
  });
  const [request] = seen;
  assert.equal(request.model, MODEL);
  assert.equal(request.stream, true);
  assert.equal(request.max_tokens, 16000);
  assert.deepEqual(request.thinking, { type: 'adaptive' });
  assert.deepEqual(request.system, [{ type: 'text', text: 'System.', cache_control: { type: 'ephemeral' } }]);
  assert.deepEqual(request.messages, messages);
  assert.equal(request.fallbacks, 'default');
  assert.equal(seen.length, 2);
  for (const sent of seen) {
    // Effort is the only output setting: no constrained decoding, no strict tools.
    assert.deepEqual(sent.output_config, { effort: EFFORT });
    for (const key of ['output_format', 'tools', 'tool_choice', 'response_format']) assert.ok(!(key in sent), key);
    assert.ok(!JSON.stringify(sent).includes('json_schema'));
  }
});

test('real corpus.db: the evidence for PSI-25', async () => {
  const corpus = openCorpus(CORPUS);
  const { db } = corpus;
  try {
    const investigation = listInvestigations(db).find((i) => i.accession === 'PSI-25');
    assert.ok(investigation, 'PSI-25 is in the corpus');
    const evidence = await buildEvidence(investigation, { corpus, embed: engineDown, warn: quiet });
    const { passages } = evidence;
    assert.deepEqual(passages.map((p) => p.n), passages.map((_, index) => index + 1));

    const card = db
      .prepare('SELECT chunk_id FROM chunks WHERE doc_id = ? ORDER BY chunk_index')
      .all(cardDocId('PSI-25'))
      .map((row) => String(row.chunk_id));
    assert.ok(card.length > 0);
    assert.deepEqual(passages.filter((p) => p.kind === 'card').map((p) => p.hit.chunkId), card);
    assert.deepEqual(passages.slice(0, card.length).map((p) => p.kind), card.map(() => 'card'));

    const record = passages[card.length];
    assert.equal(record.kind, 'record');
    const meta = investigation.metadata as { doi?: string; publications?: unknown[] };
    if (meta.doi) assert.ok(record.hit.text.includes(`DOI: ${meta.doi}`));
    assert.equal(
      record.hit.text.split('\n').filter((line) => line.startsWith('- "')).length,
      meta.publications?.length ?? 0,
    );

    const linked = db
      .prepare(
        `SELECT c.chunk_id FROM documents d, json_each(d.related_accessions) j
           JOIN chunks c ON c.doc_id = d.doc_id
          WHERE d.accession IS NULL AND j.value = 'PSI-25' ORDER BY d.doc_id, c.chunk_index`,
      )
      .all()
      .map((row) => String(row.chunk_id));
    assert.deepEqual(passages.filter((p) => p.kind === 'linked').map((p) => p.hit.chunkId), linked);

    const book = passages.filter((p) => p.kind === 'book');
    assert.ok(book.length <= 3 && book.every((p) => p.hit.docType === 'book'));
    const own = passages.filter((p) => p.kind === 'own');
    assert.ok(own.length <= 12);
    assert.ok(own.every((p) => p.hit.accession === 'PSI-25' && p.hit.docId !== cardDocId('PSI-25')));

    const documents = Number(
      (db.prepare("SELECT count(*) AS n FROM documents WHERE accession = 'PSI-25'").get() as { n: number }).n,
    );
    assert.equal(evidence.coverage.own.reduce((n, e) => n + e.documents, 0), documents);
    assert.equal(evidence.coverage.retrieval, 'bm25');
    for (const passage of passages) assert.ok(toCitation(passage.hit, passage.n).label);
  } finally {
    db.close();
  }
});

test('prompt files: {{CHALLENGE}} is replaced in both, and other placeholders fail', () => {
  const challenge = 'Challenge with {{braces}} of its own.';
  const prompts = loadSystemPrompts(PROMPTS, `\n${challenge}\n\n`);
  for (const text of [prompts.investigation, prompts.synthesis]) {
    assert.ok(
      text.includes(`## The challenge\n\n${challenge}\n\n## Output format\n\n`),
      'the trimmed challenge closes the file, before the output format section',
    );
    assert.ok(!text.includes('{{CHALLENGE}}'));
  }

  assert.equal(renderPrompt('A {{ CHALLENGE }} B', { CHALLENGE: 'x' }, 'p.md'), 'A x B');
  assert.throws(
    () => renderPrompt('A {{CHALLENGE}} {{AUDIENCE}}', { CHALLENGE: 'x' }, 'reports/prompts/p.md'),
    /reports\/prompts\/p\.md still contains the placeholder\(s\) \{\{AUDIENCE\}\}; the code fills only \{\{CHALLENGE\}\}/,
  );
});

test('prompt files: a missing or empty file fails with its path', async () => {
  await withTempDir(async (dir) => {
    assert.throws(() => loadSystemPrompts(dir, 'c'), /cannot read the prompt file .*investigation\.system\.md: it is missing/);
    cpSync(join(PROMPTS, PROMPT_FILES.investigation), join(dir, PROMPT_FILES.investigation));
    assert.throws(() => loadSystemPrompts(dir, 'c'), /cannot read the prompt file .*synthesis\.system\.md/);
    writeFileSync(join(dir, PROMPT_FILES.synthesis), '  \n');
    assert.throws(() => loadSystemPrompts(dir, 'c'), /the prompt file .*synthesis\.system\.md is empty/);

    // The generator fails before any call.
    await withCorpus(async (corpus) => {
      writeFileSync(join(dir, 'challenge.md'), 'Challenge text.');
      const fake = fakeClaude();
      await assert.rejects(
        generateInvestigationsReport(
          { corpus, embed: engineDown, warn: quiet, client: fake.client, model: MODEL },
          { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir: join(dir, 'nowhere') },
        ),
        /cannot read the prompt file .*nowhere.*investigation\.system\.md/,
      );
      assert.equal(fake.calls.length, 0);
    });
  });
});

test('prompt version: editing a prompt file changes it and invalidates the cache', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      const promptsDir = join(dir, 'prompts');
      cpSync(PROMPTS, promptsDir, { recursive: true });
      writeFileSync(join(dir, 'challenge.md'), 'Challenge text.');
      const fake = fakeClaude();
      const run = () =>
        generateInvestigationsReport(
          { corpus, embed: engineDown, warn: quiet, client: fake.client, model: MODEL, now: FIXED_NOW },
          { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir },
        );
      const called = () => fake.calls.splice(0).map((c) => c.accession);

      const first = await run();
      assert.equal(called().length, 3);
      const again = await run();
      assert.deepEqual(called(), [], 'unchanged prompts: everything from the cache');
      assert.equal(again.report.run.prompt_version, first.report.run.prompt_version);

      const file = join(promptsDir, PROMPT_FILES.synthesis);
      writeFileSync(file, readFileSync(file, 'utf8').replace('up to 6 gaps', 'up to 5 gaps'));
      const edited = await run();
      assert.notEqual(edited.report.run.prompt_version, first.report.run.prompt_version);
      assert.deepEqual(called().sort(), ['PSI-1', 'PSI-2', null].sort(), 'every investigation is regenerated');
      assert.deepEqual(edited.report.run.cached, []);
    }),
  );
});

test('prompt version: changing a zod schema changes it', () => {
  const version = (schemas: Parameters<typeof loadSystemPrompts>[2] = OUTPUT_SCHEMAS) =>
    promptVersion(loadSystemPrompts(PROMPTS, 'Challenge.', schemas), RUBRIC_VERSION, { effort: EFFORT });
  const base = version();
  assert.equal(version(), base);
  const extended = { ...OUTPUT_SCHEMAS, synthesis: SynthesisOutputSchema.extend({ extra: z.string() }) };
  assert.notEqual(version(extended), base);
  const limit = { ...OUTPUT_SCHEMAS, synthesis: SynthesisOutputSchema.extend({ gaps: z.array(z.string()).max(5) }) };
  assert.notEqual(version(limit), base);
});

test('--dry-run: one file per investigation, no generation call, no cache write', async () => {
  await withCorpus((corpus) =>
    withTempDir(async (dir) => {
      writeFileSync(join(dir, 'challenge.md'), 'Challenge text for the dry run.');
      const counted: ReportRequest[] = [];
      const countTokens: TokenCounter = async (request) => {
        counted.push(request);
        return 1000 + request.messages[0].content.length;
      };
      const options = { outDir: dir, challengePath: join(dir, 'challenge.md'), promptsDir: PROMPTS };
      // No client at all: the dry run has nothing to call Claude with.
      const result = await dryRunInvestigations(
        { corpus, embed: engineDown, warn: quiet, model: MODEL, countTokens },
        options,
      );

      const dryDir = join(dir, '.dry-run');
      assert.equal(result.dir, dryDir);
      assert.deepEqual(readdirSync(dryDir).sort(), ['PSI-1.md', 'PSI-2.md', '_synthesis.md']);
      assert.ok(!existsSync(join(dir, '.cache')), 'no cache write');
      assert.ok(!existsSync(join(dir, 'investigations.json')));
      assert.equal(counted.length, 2);

      const [psi1] = result.entries;
      assert.equal(psi1.accession, 'PSI-1');
      assert.equal(psi1.input_tokens, 1000 + psi1.user_chars);
      assert.equal(psi1.would_call, true);
      const file = readFileSync(join(dryDir, 'PSI-1.md'), 'utf8');
      assert.ok(file.includes(loadSystemPrompts(PROMPTS, 'Challenge text for the dry run.').investigation));
      const user = counted.find((r) => r.messages[0].content.includes('PSI-1'))!.messages[0].content;
      assert.ok(file.includes(user));
      assert.match(file, /## System prompt\n\n`{3,}markdown\n[\s\S]*\n## Output format\n\nRespond with exactly one JSON object/);
      assert.match(readFileSync(join(dryDir, '_synthesis.md'), 'utf8'), /## Output format\n/);
      assert.match(file, /## Evidence coverage\n\n- Own documents: metadata: 1 document\(s\), 2 chunk\(s\)/);
      assert.match(file, /- Passages given to the model: 5 \(card 2, record 1, linked 2, book 0, own 0\)/);
      assert.match(file, new RegExp(`- Prompt version: ${result.prompt_version}`));

      // --only, and no counter: characters only, one file.
      rmSync(dryDir, { recursive: true });
      const only = await dryRunInvestigations(
        { corpus, embed: engineDown, warn: quiet, model: MODEL },
        { ...options, only: ['PSI-2'] },
      );
      assert.deepEqual(readdirSync(dryDir).sort(), ['PSI-2.md', '_synthesis.md']);
      assert.equal(only.entries[0].input_tokens, null);
      assert.match(readFileSync(join(dryDir, 'PSI-2.md'), 'utf8'), /- Input: \d+ characters \(system \d+, user \d+\); not token-counted/);
    }),
  );
});

test('moon_base and rover: a 3 without lunar conditions in its cited passages is flagged, not changed', async () => {
  await withCorpus(async (corpus) => {
    const [psi1] = listInvestigations(corpus.db);
    const evidence = await buildEvidence(psi1, { corpus, embed: engineDown, warn: quiet });
    // The fixture passages speak of fabric, opposed airflow and spherical flames: no lunar condition.
    const record = validateInvestigation(evidence, fakeOutput([1, 2], 3), MODEL, MODEL);
    assert.equal(record.habitats.moon_base?.score, 3, 'the score is kept');
    assert.deepEqual(
      record.review_flags.filter((f) => f.code === 'lunar_conditions_unsupported').map((f) => f.message),
      [
        'habitats.moon_base is 3, but none of its 2 cited passage(s) mentions elevated oxygen, reduced pressure or partial gravity',
        'habitats.rover is 3, but none of its 2 cited passage(s) mentions elevated oxygen, reduced pressure or partial gravity',
      ],
    );

    // A cited passage reporting 34 % O2 at reduced pressure supports the 3; a 2 is never flagged.
    const supported = structuredClone(evidence);
    supported.passages[1].hit.text = 'Flame spread was measured at 34% O2 and 8.2 psi.';
    const output = fakeOutput([1, 2], 3);
    output.habitats.rover = { score: 2, reason: 'Needs extrapolation.', sources: [1] };
    const ok = validateInvestigation(supported, output, MODEL, MODEL);
    assert.deepEqual(ok.review_flags.filter((f) => f.code === 'lunar_conditions_unsupported'), []);
  });
});

test('lunar condition heuristics', () => {
  assert.ok(mentionsElevatedOxygen('tests at 30% oxygen'));
  assert.ok(mentionsElevatedOxygen('oxygen concentrations from 21 to 40%'));
  assert.ok(mentionsElevatedOxygen('an oxygen-enriched atmosphere'));
  assert.ok(mentionsElevatedOxygen('oxygen mole fraction of 0.35'));
  assert.ok(!mentionsElevatedOxygen('air at 21% O2'));
  assert.ok(!mentionsElevatedOxygen('CO2 at 40% of the mixture'));

  assert.ok(mentionsReducedPressure('at 10.2 psi'));
  assert.ok(mentionsReducedPressure('pressures of 0.5 to 1 atm'));
  assert.ok(mentionsReducedPressure('tests at reduced pressure'));
  assert.ok(mentionsReducedPressure('50 kPa'));
  assert.ok(!mentionsReducedPressure('at 14.7 psi and 1 atm'));
  assert.ok(!mentionsReducedPressure('see 3 PSI-25 for details'));
  assert.ok(!mentionsReducedPressure('the oxygen partial pressure'));

  assert.ok(mentionsPartialGravity('flames in partial gravity'));
  assert.ok(mentionsPartialGravity('at lunar gravity (0.16 g)'));
  assert.ok(mentionsPartialGravity('E-FIELD Flames'));
  assert.ok(!mentionsPartialGravity('combustion in reduced gravity and microgravity'));

  assert.ok(!mentionsLunarConditions('flame spread against a slow opposed airflow'));
});

test('limits: list lengths are enforced by zod, word counts only flagged', async () => {
  const output = fakeOutput();
  output.key_findings = Array.from({ length: LIMITS.key_findings + 1 }, () => ({ text: 'f', sources: [1] }));
  assert.ok(!InvestigationOutputSchema.safeParse(output).success, '6 key findings');
  const limits = fakeOutput();
  limits.limitations = Array.from({ length: LIMITS.limitations + 1 }, () => ({ text: 'l', sources: [1] }));
  assert.ok(!InvestigationOutputSchema.safeParse(limits).success, '4 limitations');
  const gaps = { ...SYNTHESIS, gaps: Array.from({ length: LIMITS.gaps + 1 }, () => SYNTHESIS.gaps[0]) };
  assert.ok(!SynthesisOutputSchema.safeParse(gaps).success, '7 gaps');
  assert.ok(SynthesisOutputSchema.safeParse(SYNTHESIS).success);

  await withCorpus(async (corpus) => {
    const [psi1] = listInvestigations(corpus.db);
    const evidence = await buildEvidence(psi1, { corpus, embed: engineDown, warn: quiet });
    const long = fakeOutput();
    long.summary.plain = { text: Array.from({ length: 61 }, () => 'word').join(' '), sources: [1] };
    long.summary.technical = { text: Array.from({ length: 120 }, () => 'word').join(' '), sources: [1] };
    const record = validateInvestigation(evidence, long, MODEL, MODEL);
    assert.equal(record.summary.plain?.text.split(' ').length, 61, 'kept as written');
    assert.deepEqual(
      record.review_flags.filter((f) => f.code === 'over_word_limit').map((f) => f.message),
      ['summary.plain has 61 words; the prompt asks for at most 60'],
    );
  });
});
