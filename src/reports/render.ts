import { investigationName } from '../citations.ts';
import { HABITAT_LABELS, HABITATS, OBJECTIVES, PILLARS } from './rubric.ts';
import { PROFILE_LIST_FIELDS, PROFILE_TEXT_FIELDS } from './schema.ts';
import type { Claim, InvestigationsReport, RankedInvestigation, Statement, Usage } from './types.ts';

/*
 * investigations.md is rendered by code from investigations.json and from nothing else, so the
 * two cannot disagree. The model never writes Markdown.
 */

const FLAG_MEANINGS: Record<string, string> = {
  dropped_claim: 'A claim cited no passage or a passage that does not exist, and was removed.',
  dropped_score: 'A score had no valid source; it was removed and counts as 0 in the total.',
  card_only: 'The evidence is only the PSI card and the PSI record; this row rests on the least text.',
  tier_mismatch: 'The rank disagrees with the corpus fire_relevance tier (1 in the bottom third, or 3 in the top third).',
  served_by_fallback: 'Another model answered after a server-side fallback.',
  unknown_accession: 'The synthesis named an accession that is not a ranked investigation; it was removed.',
  dropped_statement: 'A synthesis statement named no ranked investigation and was removed.',
};

const label = (key: string): string => {
  const text = key.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const cell = (text: string): string => text.replace(/\s*\n\s*/g, ' ').replaceAll('|', '\\|');
const markers = (sources: number[]): string => (sources.length ? ` [${sources.join(', ')}]` : '');
const claimText = (claim: Claim | null): string =>
  claim ? `${claim.text}${markers(claim.sources)}` : '_Not stated in the corpus._';
const name = (r: { acronym: string | null; accession: string }): string =>
  investigationName(r.acronym, r.accession) ?? r.accession;
const anchor = (r: RankedInvestigation): string => `rank-${r.rank}-${r.accession.toLowerCase()}`;
const score = (value: number | undefined | null): string =>
  value === undefined || value === null ? '—' : Number.isInteger(value) ? String(value) : value.toFixed(2);
const tokens = (u: Usage): string =>
  `${u.calls} call(s); in ${u.input_tokens} (cache write ${u.cache_creation_input_tokens}, cache read ${u.cache_read_input_tokens}); out ${u.output_tokens}`;

export function renderInvestigations(report: InvestigationsReport): string {
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);
  const { run, rubric, investigations: ranked } = report;
  const criteria = rubric.criteria;

  push(
    '# Investigations report',
    '',
    '_Rendered by code from `investigations.json` (`pnpm report investigations`). Do not edit by hand: rerun the command._',
    '',
    '## Provenance',
    '',
    '| | |',
    '|---|---|',
    `| Generated | ${run.generated_at} |`,
    `| Model | ${run.model} |`,
    `| Prompt version | ${run.prompt_version} |`,
    `| Rubric version | ${run.rubric_version} |`,
    `| Corpus built at | ${run.corpus_built_at} |`,
    `| Challenge text | sha256 ${run.challenge_sha256.slice(0, 12)} |`,
    `| Investigations | ${ranked.length} ranked, ${run.cached.length} from cache, ${report.failed.filter((f) => f.step === 'investigation').length} failed, ${run.skipped.length} skipped |`,
    `| Tokens, investigations | ${tokens(run.usage.investigations)} |`,
    `| Tokens, synthesis | ${tokens(run.usage.synthesis)} |`,
    `| Tokens, total | ${tokens(run.usage.total)} |`,
    '',
  );
  if (run.skipped.length) {
    push(`Skipped (not in \`--only\` and not cached): ${run.skipped.join(', ')}.`, '');
  }
  if (report.failed.length) {
    push('Failed:', '', ...report.failed.map((f) => `- ${f.accession ?? f.step}: ${f.error}`), '');
  }

  push(
    '## How to read this report',
    '',
    "- Claude read each investigation's own passages (its PSI card, a PSI record built from the card's metadata, linked fact sheets, mini-book passages and its own other documents) and scored every criterion from 0 to 3 with reasons and sources. The code computed the totals, the ranking, the top lists and the coverage matrix.",
    `- Total = weighted sum of the criterion scores, normalized to 0–100. Ties: corpus \`fire_relevance\` (1 first), then accession.`,
    '- Evidence was never a reason for a lower score: a thin evidence set only limits the profile, findings and data fields. `card_only` marks the rows that rest on the least text.',
    '- `[n]` markers point to the numbered sources listed under each investigation.',
    '- These are research results, not material certification or engineering approval.',
    '',
    '| Criterion | Weight | 3 means |',
    '|---|---|---|',
    ...criteria.map((c) => `| ${c.key} | ${c.weight} | ${cell(c.three)} |`),
    '',
  );

  const flagged = ranked.flatMap((r) => r.review_flags.map((flag) => ({ who: name(r), flag })));
  const synthesisFlags = report.synthesis?.review_flags ?? [];
  push('## Review flags', '');
  if (flagged.length === 0 && synthesisFlags.length === 0) {
    push('None.', '');
  } else {
    const codes = [...new Set([...flagged.map((f) => f.flag.code), ...synthesisFlags.map((f) => f.code)])].sort();
    push(...codes.map((code) => `- \`${code}\`: ${FLAG_MEANINGS[code] ?? ''}`.trimEnd()), '');
    push('| Where | Flag | Detail |', '|---|---|---|');
    push(...flagged.map(({ who, flag }) => `| ${who} | ${flag.code} | ${cell(flag.message)} |`));
    push(...synthesisFlags.map((flag) => `| Synthesis | ${flag.code} | ${cell(flag.message)} |`));
    push('');
  }

  push(
    '## Ranking',
    '',
    `| Rank | Investigation | Tier | Total | ${criteria.map((c) => c.key).join(' | ')} | Flags |`,
    `|---|---|---|---|${criteria.map(() => '---|').join('')}---|`,
    ...ranked.map(
      (r) =>
        `| ${r.rank} | [${cell(name(r))}](#${anchor(r)}) | ${r.fire_relevance} | ${r.total.toFixed(1)} | ${criteria
          .map((c) => score(r.scores[c.key]?.score))
          .join(' | ')} | ${[...new Set(r.review_flags.map((f) => f.code))].join(', ')} |`,
    ),
    '',
    '### Top per habitat',
    '',
    '| Habitat | Investigations (habitat score, total) |',
    '|---|---|',
    ...HABITATS.map(
      (h) =>
        `| ${HABITAT_LABELS[h]} | ${
          report.habitat_top[h].map((e) => `${name(e)} (${e.score}, ${e.total.toFixed(1)})`).join('; ') || '—'
        } |`,
    ),
    '',
    `### Coverage: pillar × habitat (habitat score ≥ ${rubric.coverage_min_habitat_score})`,
    '',
    `| Pillar | ${HABITATS.map((h) => HABITAT_LABELS[h]).join(' | ')} |`,
    `|---|${HABITATS.map(() => '---|').join('')}`,
    ...PILLARS.map(
      (p) => `| ${label(p)} | ${HABITATS.map((h) => report.coverage[p][h].join(', ') || '—').join(' | ')} |`,
    ),
    '',
    '## Investigations',
    '',
  );

  for (const r of ranked) renderInvestigation(r, push);

  const synthesis = report.synthesis;
  push('## Comparison by hardware', '');
  if (!synthesis) {
    push('_The synthesis is not available for this run._', '');
  } else {
    if (synthesis.overview) push(statement(synthesis.overview), '');
    for (const group of synthesis.groups) {
      push(`### ${group.name}`, '', `Hardware: ${group.hardware}. Investigations: ${group.accessions.join(', ')}.`, '');
      if (group.similarities.length) push('Similarities:', '', ...group.similarities.map((s) => `- ${statement(s)}`), '');
      if (group.differences.length) push('Differences:', '', ...group.differences.map((s) => `- ${statement(s)}`), '');
    }
  }

  push('## Gaps', '');
  if (!synthesis) push('_The synthesis is not available for this run._', '');
  else if (synthesis.gaps.length === 0) push('None stated.', '');
  else push(...synthesis.gaps.map((s) => `- ${statement(s)}`), '');

  return `${out.join('\n').trimEnd()}\n`;
}

const statement = (s: Statement): string => `${s.text} (${s.accessions.join(', ')})`;

function renderInvestigation(r: RankedInvestigation, push: (...lines: string[]) => void): void {
  const coverage = r.evidence_coverage;
  const docs = (list: typeof coverage.own) =>
    list.map((e) => `${e.doc_type} ${e.documents} doc / ${e.chunks} chunks`).join(', ') || 'none';

  push(
    `<a id="${anchor(r)}"></a>`,
    `### ${r.rank}. ${name(r)}: ${r.title}`,
    '',
    `[PSI investigation page](${r.investigation_url}) · Tier ${r.fire_relevance} · Total ${r.total.toFixed(1)}`,
    '',
    `Evidence: own ${docs(coverage.own)}; linked ${docs(coverage.linked)}; pages ${coverage.has_pages ? 'yes' : 'no'}; retrieval ${coverage.retrieval}.`,
    '',
    `**For students.** ${claimText(r.summary.plain)}`,
    '',
    `**For researchers.** ${claimText(r.summary.technical)}`,
    '',
    '| Criterion | Score | Reason |',
    '|---|---|---|',
    ...Object.entries(r.scores).map(([key, s]) =>
      s
        ? `| ${key} | ${score(s.score)} | ${cell('sources' in s ? `${s.reason}${markers(s.sources)}` : s.reason)} |`
        : `| ${key} | — | _dropped in validation, counts as 0_ |`,
    ),
    '',
    '| Habitat | Score | Reason |',
    '|---|---|---|',
    ...HABITATS.map((h) => {
      const s = r.habitats[h];
      return s
        ? `| ${HABITAT_LABELS[h]} | ${s.score} | ${cell(`${s.reason}${markers(s.sources)}`)} |`
        : `| ${HABITAT_LABELS[h]} | — | _dropped in validation, counts as 0_ |`;
    }),
    '',
    '**Contributions to the challenge objectives**',
    '',
    ...OBJECTIVES.map((o) => `- ${label(o)}: ${claimText(r.contributions[o])}`),
    '',
    '**Fire safety pillars**',
    '',
    ...(PILLARS.some((p) => r.pillars[p])
      ? PILLARS.flatMap((p) => (r.pillars[p] ? [`- ${label(p)}: ${claimText(r.pillars[p]!)}`] : []))
      : ['- None supported by the passages.']),
    '',
    '**Profile**',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Fuel type | ${r.profile.fuel_type ? `${r.profile.fuel_type.value}${markers(r.profile.fuel_type.sources)}` : '_Not stated in the corpus._'} |`,
    ...PROFILE_TEXT_FIELDS.map((f) => `| ${label(f)} | ${cell(claimText(r.profile[f]))} |`),
    ...PROFILE_LIST_FIELDS.map(
      (f) =>
        `| ${label(f)} | ${r.profile[f].length ? cell(r.profile[f].map((c) => claimText(c)).join('; ')) : '_Not stated in the corpus._'} |`,
    ),
    '',
    `**Data for modeling**${r.data_for_modeling ? ` (${r.data_for_modeling.readiness.replaceAll('_', ' ')})` : ''}: ${
      r.data_for_modeling ? `${r.data_for_modeling.text}${markers(r.data_for_modeling.sources)}` : '_Not stated in the corpus._'
    }`,
    '',
    '**Key findings**',
    '',
    ...(r.key_findings.length ? r.key_findings.map((c) => `- ${claimText(c)}`) : ['- _None stated in the corpus._']),
    '',
    '**Limitations**',
    '',
    ...(r.limitations.length ? r.limitations.map((c) => `- ${claimText(c)}`) : ['- _None stated._']),
    '',
  );
  if (r.review_flags.length) {
    push('**Review flags**', '', ...r.review_flags.map((f) => `- \`${f.code}\`: ${f.message}`), '');
  }
  push(
    '**Sources**',
    '',
    ...r.sources.map((c) => {
      const url = c.investigation_url ?? c.public_url;
      return `${c.n}. ${c.label}${url ? ` <${url}>` : ''}`;
    }),
    '',
  );
}
