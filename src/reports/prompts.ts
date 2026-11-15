import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { investigationName } from '../citations.ts';
import { passageBlock } from '../pipeline.ts';
import type { Evidence, EvidenceCoverage } from './evidence.ts';
import { InvestigationOutputSchema, SynthesisOutputSchema } from './schema.ts';

/*
 * The system prompts live in reports/prompts/*.system.md, written and reviewed by the team. The
 * code fills their placeholders and appends an `## Output format` section generated from the
 * call's zod schema, so the files stay free of schema text. The result is hashed into the prompt
 * version, so editing a prompt or a schema invalidates the cache by itself.
 */

/** Where the prompt files are, relative to the repository root. Not moved by --out. */
export const PROMPTS_DIR = 'reports/prompts';

export const PROMPT_FILES = {
  investigation: 'investigation.system.md',
  synthesis: 'synthesis.system.md',
} as const;

export type SystemPrompts = Record<keyof typeof PROMPT_FILES, string>;

const PLACEHOLDER = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** The zod schema of each call's reply, the source of its `## Output format` section. */
export const OUTPUT_SCHEMAS = {
  investigation: InvestigationOutputSchema,
  synthesis: SynthesisOutputSchema,
} as const satisfies Record<keyof typeof PROMPT_FILES, z.ZodType>;

/**
 * Reads both prompt files, replaces {{CHALLENGE}} with the challenge text and appends each call's
 * output format section.
 */
export function loadSystemPrompts(
  dir: string,
  challenge: string,
  schemas: Record<keyof typeof PROMPT_FILES, z.ZodType> = OUTPUT_SCHEMAS,
): SystemPrompts {
  const values = { CHALLENGE: challenge.trim() };
  return {
    investigation: `${renderPromptFile(join(dir, PROMPT_FILES.investigation), values)}\n\n${outputFormatSection(schemas.investigation)}`,
    synthesis: `${renderPromptFile(join(dir, PROMPT_FILES.synthesis), values)}\n\n${outputFormatSection(schemas.synthesis)}`,
  };
}

/** The section appended to a system prompt: the reply format and the JSON Schema of `schema`. */
export function outputFormatSection(schema: z.ZodType): string {
  return [
    '## Output format',
    '',
    'Respond with exactly one JSON object that matches the schema below. Write no prose before or after it and no Markdown fences. Use the field names exactly as the schema gives them.',
    '',
    JSON.stringify(z.toJSONSchema(schema), null, 2),
  ].join('\n');
}

export function renderPromptFile(path: string, values: Record<string, string>): string {
  let template: string;
  try {
    template = readFileSync(path, 'utf8');
  } catch {
    throw new Error(`cannot read the prompt file ${path}: it is missing or unreadable`);
  }
  if (!template.trim()) throw new Error(`the prompt file ${path} is empty`);
  return renderPrompt(template, values, path);
}

/**
 * Replaces every {{NAME}} in one pass, so a value that itself contains braces is never scanned.
 * A placeholder with no value fails, naming the file.
 */
export function renderPrompt(template: string, values: Record<string, string>, origin: string): string {
  const unknown = new Set<string>();
  const text = template.replace(PLACEHOLDER, (match, name: string) => {
    if (Object.hasOwn(values, name)) return values[name];
    unknown.add(match);
    return match;
  });
  if (unknown.size) {
    throw new Error(
      `${origin} still contains the placeholder(s) ${[...unknown].join(', ')}; the code fills only ${Object.keys(values)
        .map((name) => `{{${name}}}`)
        .join(', ')}`,
    );
  }
  return text.trimEnd();
}

/**
 * The prompt version: a short hash of everything that shapes a call besides the evidence: both
 * system prompts (rendered, with their output format sections, so the schemas are included), the
 * rubric version and the call settings.
 */
export function promptVersion(prompts: SystemPrompts, rubricVersion: string, callShape: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify([prompts.investigation, prompts.synthesis, rubricVersion, callShape]))
    .digest('hex')
    .slice(0, 12);
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
