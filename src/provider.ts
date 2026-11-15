import { postJson } from './http.ts';

export type Message = { role: 'system' | 'user' | 'assistant'; content: string };
export type Chat = (messages: Message[], options?: { json?: boolean }) => Promise<string>;

export type ChatOptions = { url: string; model: string; apiKey?: string };

/** OpenAI-compatible chat completions, one call per invocation. */
export function createChat(options: ChatOptions): Chat {
  return async (messages, callOptions = {}) => {
    const body = await postJson(
      options.url,
      {
        model: options.model,
        messages,
        ...(callOptions.json ? { response_format: { type: 'json_object' } } : {}),
      },
      'llm provider',
      options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {},
    );

    const content = (body as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
      ?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('llm provider returned no content');
    }
    return content;
  };
}
