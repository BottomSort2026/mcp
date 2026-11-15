import Anthropic from '@anthropic-ai/sdk';
import { describeError } from './errors.ts';
import type { Chat, Message } from './provider.ts';

export type AnthropicChatOptions = {
  apiKey: string;
  model: string;
  maxTokens: number;
  timeoutMs?: number;
  /** Tests inject a client whose `fetch` is faked; production builds one from the options. */
  client?: Anthropic;
};

type Turn = Anthropic.Beta.Messages.BetaMessageParam & { content: string };

// The SDK retries 408/409/429/5xx and connection errors with backoff; 2 is also its default.
const MAX_RETRIES = 2;

// Server-side fallback when the model declines for policy reasons. "default" lets the API
// pick the fallback model, and on a model without fallbacks the request simply runs alone.
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/**
 * Maps OpenAI-style messages onto the Messages API: every system message, joined in order,
 * becomes the top-level `system`; the remaining turns are merged when consecutive turns share
 * a role, and a leading assistant turn is dropped so the list starts with `user`.
 */
export function toAnthropicRequest(messages: Message[]): { system?: string; messages: Turn[] } {
  const system = messages.filter((message) => message.role === 'system').map((m) => m.content);
  const turns: Turn[] = [];
  for (const message of messages) {
    if (message.role === 'system') continue;
    const last = turns.at(-1);
    if (last?.role === message.role) last.content += `\n\n${message.content}`;
    else turns.push({ role: message.role, content: message.content });
  }
  if (turns[0]?.role === 'assistant') turns.shift();
  return { ...(system.length ? { system: system.join('\n\n') } : {}), messages: turns };
}

/**
 * Claude through the native Messages API, one call per invocation. `json` sends nothing extra:
 * the router prompt demands a bare JSON object and parseObject tolerates fences and prose.
 */
export function createAnthropicChat(options: AnthropicChatOptions): Chat {
  const client =
    options.client ??
    new Anthropic({ apiKey: options.apiKey, timeout: options.timeoutMs, maxRetries: MAX_RETRIES });

  return async (messages) => {
    let response: Anthropic.Beta.Messages.BetaMessage;
    try {
      response = await client.beta.messages.create({
        model: options.model,
        max_tokens: options.maxTokens,
        ...toAnthropicRequest(messages),
        betas: [FALLBACK_BETA],
        fallbacks: 'default',
      });
    } catch (error) {
      throw new Error(`llm provider failed: ${describeSdkError(error)}`);
    }

    if (response.stop_reason === 'refusal') {
      throw new Error(`llm provider refused (${response.stop_details?.category ?? 'no category'})`);
    }

    // Thinking and fallback blocks are skipped; only the answer text counts.
    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');
    if (!text.trim()) throw new Error('llm provider returned no content');
    return text;
  };
}

/** "529 overloaded_error: Overloaded (request req_…)"; SDK errors never carry the key. */
function describeSdkError(error: unknown): string {
  if (!(error instanceof Anthropic.APIError) || error.status === undefined) {
    // Connection failures and timeouts: the network reason sits in `cause`.
    return describeError(error);
  }
  const body = error.error as { error?: { type?: string; message?: string } } | undefined;
  const detail = body?.error?.message
    ? `${error.status} ${body.error.type ?? 'error'}: ${body.error.message}`
    : error.message;
  return error.requestID ? `${detail} (request ${error.requestID})` : detail;
}
