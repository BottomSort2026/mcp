import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { describeError } from '../errors.ts';
import type { Usage } from './types.ts';

export type StructuredRequest = {
  system: string;
  user: string;
  /** JSON Schema sent as output_config.format (see strictJsonSchema). */
  schema: Record<string, unknown>;
  maxTokens: number;
};

export type StructuredReply = {
  /** The text blocks of the answer, joined: the JSON document. */
  text: string;
  stopReason: string | null;
  /** The model that answered. */
  model: string;
  usage: Usage;
};

/** One structured call. Production uses Claude through the SDK; tests pass a fake. */
export type StructuredClient = (request: StructuredRequest) => Promise<StructuredReply>;

/** The input tokens a structured call would send, from the token counting endpoint. */
export type TokenCounter = (request: StructuredRequest) => Promise<number>;

// Thinking is always on with Claude Opus 5.5; effort sets its depth (the model's default is medium).
export const EFFORT = 'high' as const;
export const MAX_TOKENS = 32_000;
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
function callParams(model: string, request: StructuredRequest) {
  return {
    model,
    system: [{ type: 'text' as const, text: request.system, cache_control: { type: 'ephemeral' as const } }],
    messages: [{ role: 'user' as const, content: request.user }],
    thinking: { type: 'adaptive' as const },
    output_config: { effort: EFFORT, format: { type: 'json_schema' as const, schema: request.schema } },
  };
}

/**
 * Claude through the native Messages API with structured outputs. Streams, because a long
 * structured answer plus thinking can outlast a non-streaming request. The system prompt is the
 * same for every investigation, so it carries a cache breakpoint. Server-side fallback is on:
 * after a policy decline the API reruns the request on a fallback model, reported in `model`.
 */
export function anthropicStructuredClient(options: {
  apiKey: string;
  model: string;
  client?: Anthropic;
}): StructuredClient {
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
 * POST /v1/messages/count_tokens with the same system, message, thinking and output format as the
 * real call. Counting is free of generation charges (it has its own rate limit) and writes no cache.
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

export class StructuredCallError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StructuredCallError';
  }
}

/**
 * One call parsed and validated with zod. A reply that is not valid JSON, does not match the
 * schema, was refused or was cut off is retried once; the second failure throws. API errors
 * (after the SDK's own retries) throw at once. Usage of every attempt goes to `usage`.
 */
export async function callStructured<T>(
  client: StructuredClient,
  request: StructuredRequest,
  schema: z.ZodType<T>,
  usage: Usage,
): Promise<{ value: T; model: string }> {
  let problem = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    let reply: StructuredReply;
    try {
      reply = await client(request);
    } catch (error) {
      throw new StructuredCallError(`Claude call failed: ${describeSdkError(error)}`, { cause: error });
    }
    addUsage(usage, reply.usage);

    if (reply.stopReason === 'refusal' || reply.stopReason === 'max_tokens') {
      problem = `stop_reason ${reply.stopReason}`;
      continue;
    }
    let json: unknown;
    try {
      json = JSON.parse(reply.text);
    } catch {
      problem = 'the reply is not valid JSON';
      continue;
    }
    const parsed = schema.safeParse(json);
    if (parsed.success) return { value: parsed.data, model: reply.model };
    problem = `the reply does not match the schema: ${parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')}`;
  }
  throw new StructuredCallError(`${problem} (after one retry)`);
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
