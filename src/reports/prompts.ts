import { investigationName } from '../citations.ts';
import { passageBlock } from '../pipeline.ts';
import type { Evidence, EvidenceCoverage } from './evidence.ts';
import { HABITATS, OBJECTIVES, PILLARS, rubricText } from './rubric.ts';

/**
 * Bump when a prompt, a schema or a call setting (effort, max_tokens) changes: it is part of the
 * cache key, so every investigation is regenerated on the next run.
 */
export const PROMPT_VERSION = '2026-11-15.1';

/** The system prompt of the per-investigation call. Identical for every call, so it is cached. */
export function investigationSystem(challenge: string): string {
  return `You assess one NASA PSI combustion investigation at a time for Flame in Freefall, a team
answering the NASA Space Apps 2026 challenge quoted below. A program will rank the investigations
from your scores; you never rank them yourself.

<challenge>
${challenge.trim()}
</challenge>

The challenge text defines the objectives and the rubric. It is not evidence about any
investigation: never cite it and never take facts about an investigation from it.

<rubric>
${rubricText()}
</rubric>

Rules:
- Use only the numbered passages in the user message. Every text you write lists in "sources" the
  numbers of the passages it comes from, at least one, and only numbers that exist.
- When the passages do not state something, set "stated" to false (text "not stated in the
  corpus", sources []) or use "not_stated" / "unknown". Never fill a field from general knowledge.
- Score relevance from what the investigation is and does: its objectives, hardware, approach and
  impacts, which every card states. A thinner evidence set is never a reason for a lower score; it
  only limits the profile, findings and data fields.
- Habitats: ${HABITATS.join(', ')}. For moon_base and rover, weigh the expected atmosphere (at
  least 30 % O2 at 10.2 psi or less) and the absence of partial-gravity data, as the challenge
  describes.
- Contributions (${OBJECTIVES.join(', ')}) are what the investigation brings to each challenge
  objective. Pillars (${PILLARS.join(', ')}): stated true only where the passages support it.
- Profile: hardware, flight platform and dates; fuel type and fuels; sample shape and size;
  oxygen, pressure and airflow; variables (what changed between tests), constants (what stayed
  the same), sensors and measurements. Keep numbers and units exactly as the passages give them.
- data_for_modeling: what data exists and how ready it is for flammability or fire-scenario models.
- key_findings are results the passages report; limitations are limits of the investigation or
  of this evidence for the challenge.
- Write two summaries: "plain" for students, in simple words; "technical" for researchers.
- Write in English. Keep acronyms, units and names as written in the passages.
- This is research. Never present a result as material certification, flight qualification or
  engineering approval.
- Reasons are short explanations, not step-by-step reasoning.`;
}

export function investigationUser(evidence: Evidence): string {
  const { investigation, passages, coverage } = evidence;
  return [
    `Investigation: ${investigationName(investigation.acronym, investigation.accession)}: ${investigation.title}`,
    `Evidence coverage (computed from the corpus):\n${coverageText(coverage)}`,
    `Passages:\n${passages.map((p) => passageBlock(p.hit, p.n)).join('\n\n')}`,
  ].join('\n\n');
}

export function coverageText(coverage: EvidenceCoverage): string {
  const entries = (list: EvidenceCoverage['own']) =>
    list.length
      ? list
          .map(
            (e) =>
              `${e.doc_type}: ${e.documents} document(s), ${e.chunks} chunk(s)${e.paginated_documents ? `, ${e.paginated_documents} with pages` : ''}`,
          )
          .join('; ')
      : 'none';
  return [
    `- Own documents: ${entries(coverage.own)}`,
    `- Linked external documents: ${entries(coverage.linked)}`,
    `- Any own document with pages: ${coverage.has_pages ? 'yes' : 'no'}`,
  ].join('\n');
}

export const SYNTHESIS_SYSTEM = `You compare NASA PSI combustion investigations for Flame in Freefall, a team answering
the NASA Space Apps 2026 challenge on spacecraft fire safety. The user message holds validated
records, one per investigation, already scored and ranked by a program, and facts computed from
the corpus.

Write:
- groups: investigations that share hardware. Use these groups when they apply: the ACME modules
  in the Combustion Integrated Rack (CIR); the Multi-user Droplet Combustion Apparatus (MDCA) in
  the CIR; the SPICE flow duct in the Microgravity Science Glovebox (MSG); then any other shared
  hardware; and one group "Others" for the rest. Put an investigation in a group only when its
  record says it used that hardware. For each group, its similarities and differences.
- gaps: what the challenge needs that these investigations do not provide, for example the
  absence of partial-gravity data, or which investigations have no paginated documents (papers,
  reports) in this corpus. Take evidence facts from the corpus facts, never assume them.
- overview: one short paragraph on what the set offers the challenge.

Rules: use only the records and facts given. Every statement lists in "accessions" the PSI
accessions it is about, at least one. Do not rank or rescore. This is research, not material
certification or engineering approval. Write in English.`;
