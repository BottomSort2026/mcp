import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { describeError } from '../errors.ts';
import { parseJsonObject } from '../text.ts';
import type { Usage } from './types.ts';

export type ReportTurn = { role: 'user' | 'assistant'; content: string };

export type ReportRequest = {
  /** The rendered system prompt, ending with its `## Output format` section. */
  system: string;
  /** The user message, and on a repair call the previous reply and the list of problems. */
  messages: ReportTurn[];
  maxTokens: number;
};

export type ReportReply = {
  /** The text blocks of the answer, joined; thinking blocks are left out. */
  text: string;
  stopReason: string | null;
  /** The model that answered. */
  model: string;
  usage: Usage;
};

/** One report call. Production uses Claude through the SDK; tests pass a fake. */
export type ReportClient = (request: ReportRequest) => Promise<ReportReply>;

/** The input tokens a report call would send, from the token counting endpoint. */
export type TokenCounter = (request: ReportRequest) => Promise<number>;

// Thinking is always on with Claude Opus 5.5; effort sets its depth (the model's default is medium).
export const EFFORT = 'high' as const;
/** max_tokens of every report call (it also covers thinking); REPORT_MAX_TOKENS overrides it. */
export const DEFAULT_MAX_TOKENS = 16_000;
export const MAX_TOKENS_VARIABLE = 'REPORT_MAX_TOKENS';
/** zod issues listed in a repair request. */
const REPAIR_ISSUES = 10;
/** zod issues kept in the error of a failed call. */
const ERROR_ISSUES = 3;
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export function emptyUsage(): Usage {
  return {
    calls: 0,
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };
}

export function addUsage(into: Usage, more: Usage): Usage {
  into.calls += more.calls;
  into.input_tokens += more.input_tokens;
  into.output_tokens += more.output_tokens;
  into.cache_creation_input_tokens += more.cache_creation_input_tokens;
  into.cache_read_input_tokens += more.cache_read_input_tokens;
  return into;
}

/** What a report call and its token count share, so --dry-run counts exactly what a run sends. */
function callParams(model: string, request: ReportRequest) {
  return {
    model,
    system: [{ type: 'text' as const, text: request.system, cache_control: { type: 'ephemeral' as const } }],
    messages: request.messages.map((turn) => ({ role: turn.role, content: turn.content })),
    thinking: { type: 'adaptive' as const },
    output_config: { effort: EFFORT },
  };
}

/**
 * Claude through the native Messages API, without constrained decoding: the system prompt asks
 * for one JSON object and callJson parses and validates it. Streams, because a long answer plus
 * thinking can outlast a non-streaming request. The system prompt is the same for every
 * investigation, so it carries a cache breakpoint. Server-side fallback is on: after a policy
 * decline the API reruns the request on a fallback model, reported in `model`.
 */
export function anthropicReportClient(options: { apiKey: string; model: string; client?: Anthropic }): ReportClient {
  const client = options.client ?? new Anthropic({ apiKey: options.apiKey, maxRetries: 2 });

  return async (request) => {
    const stream = client.beta.messages.stream({
      ...callParams(options.model, request),
      max_tokens: request.maxTokens,
      betas: [FALLBACK_BETA],
      fallbacks: 'default',
    });
    const message = await stream.finalMessage();

    return {
      text: message.content.map((block) => (block.type === 'text' ? block.text : '')).join(''),
      stopReason: message.stop_reason,
      model: message.model,
      usage: {
        calls: 1,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: message.usage.cache_read_input_tokens ?? 0,
      },
    };
  };
}

/**
 * POST /v1/messages/count_tokens with the same system, messages and thinking as the real call.
 * Counting is free of generation charges (it has its own rate limit) and writes no cache.
 */
export function anthropicTokenCounter(options: { apiKey: string; model: string; client?: Anthropic }): TokenCounter {
  const client = options.client ?? new Anthropic({ apiKey: options.apiKey, maxRetries: 2 });
  return async (request) => {
    try {
      return (await client.messages.countTokens(callParams(options.model, request))).input_tokens;
    } catch (error) {
      throw new Error(`token count failed: ${describeSdkError(error)}`, { cause: error });
    }
  };
}

export class ReportCallError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ReportCallError';
  }
}

type Checked<T> = { ok: true; value: T } | { ok: false; issues: string[] };

/** The reply text parsed (fences and surrounding prose tolerated) and validated with zod. */
export function checkReply<T>(text: string, schema: z.ZodType<T>): Checked<T> {
  const json = parseJsonObject(text);
  if (!json) return { ok: false, issues: ['(reply): no valid JSON object found'] };
  const parsed = schema.safeParse(json);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => `${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`),
  };
}

export function repairMessage(issues: string[]): string {
  const listed = issues.slice(0, REPAIR_ISSUES);
  const more = issues.length > listed.length ? `\n(and ${issues.length - listed.length} more)` : '';
  return [
    'Your reply could not be used. Problems found:',
    listed.map((issue) => `- ${issue}`).join('\n') + more,
    'Respond with the complete corrected JSON object only, matching the schema in the Output format section: no prose before or after it and no Markdown fences.',
  ].join('\n\n');
}

/**
 * One report call, its reply parsed and validated with zod. A reply that is not a JSON object
 * or does not match the schema gets one repair call: the same system prompt and messages plus
 * that reply and the list of problems. A truncated reply (stop_reason max_tokens) or a refusal
 * fails at once, since a repair would not fix it. API errors (after the SDK's own retries) throw
 * at once. Usage of every call goes to `usage`.
 */
export async function callJson<T>(
  client: ReportClient,
  request: ReportRequest,
  schema: z.ZodType<T>,
  usage: Usage,
): Promise<{ value: T; model: string }> {
  const call = async (messages: ReportTurn[]): Promise<ReportReply> => {
    let reply: ReportReply;
    try {
      reply = await client({ ...request, messages });
    } catch (error) {
      throw new ReportCallError(`Claude call failed: ${describeSdkError(error)}`, { cause: error });
    }
    addUsage(usage, reply.usage);
    if (reply.stopReason === 'max_tokens') {
      throw new ReportCallError(
        `the output was truncated at max_tokens (${request.maxTokens}); raise ${MAX_TOKENS_VARIABLE} and rerun`,
      );
    }
    if (reply.stopReason === 'refusal') throw new ReportCallError('Claude declined the request (stop_reason refusal)');
    return reply;
  };

  const first = await call(request.messages);
  const checked = checkReply(first.text, schema);
  if (checked.ok) return { value: checked.value, model: first.model };

  // An empty assistant turn is rejected by the API; two user turns in a row are merged.
  const previous: ReportTurn[] = first.text.trim() ? [{ role: 'assistant', content: first.text }] : [];
  const second = await call([...request.messages, ...previous, { role: 'user', content: repairMessage(checked.issues) }]);
  const repaired = checkReply(second.text, schema);
  if (repaired.ok) return { value: repaired.value, model: second.model };
  throw new ReportCallError(
    `the reply is not valid after one repair: ${repaired.issues.slice(0, ERROR_ISSUES).join('; ')}`,
  );
}

/** "529 overloaded_error: Overloaded (request req_…)"; SDK errors never carry the key. */
function describeSdkError(error: unknown): string {
  if (!(error instanceof Anthropic.APIError) || error.status === undefined) return describeError(error);
  const body = error.error as { error?: { type?: string; message?: string } } | undefined;
  const detail = body?.error?.message
    ? `${error.status} ${body.error.type ?? 'error'}: ${body.error.message}`
    : error.message;
  return error.requestID ? `${detail} (request ${error.requestID})` : detail;
}
