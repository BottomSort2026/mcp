import { joinUrl } from './http.ts';

type Env = Record<string, string | undefined>;

export const LLM_PROVIDERS = ['openai', 'anthropic'] as const;
export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5-5';

export type LlmConfig =
  | { provider: 'openai'; url: string; model: string; apiKey?: string; timeoutMs: number }
  | { provider: 'anthropic'; model: string; apiKey: string; maxTokens: number; timeoutMs: number };

/** Reads the environment once at boot; throws a readable message on the first bad value. */
export function loadConfig(env: Env = process.env) {
  const int = (name: string, fallback: number): number => {
    const raw = env[name];
    if (raw === undefined) return fallback;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${name} must be a positive integer, got ${raw}`);
    }
    return parsed;
  };

  const bool = (name: string, fallback: boolean): boolean => {
    const raw = env[name];
    if (raw === undefined || raw === '') return fallback;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new Error(`${name} must be true or false, got ${raw}`);
  };

  const required = (name: string, hint: string): string => {
    const value = env[name];
    if (!value) throw new Error(`${name} is required, ${hint}`);
    return value;
  };

  // Base URL of the engine service; /embed and /predict hang off it.
  const engineUrl = required('ENGINE_URL', 'e.g. ENGINE_URL=http://localhost:8000');

  const provider = env.LLM_PROVIDER || 'openai';
  if (!LLM_PROVIDERS.includes(provider as LlmProvider)) {
    throw new Error(`LLM_PROVIDER must be ${LLM_PROVIDERS.join(' or ')}, got ${provider}`);
  }
  const timeoutMs = int('LLM_TIMEOUT_MS', 60_000);

  const llm: LlmConfig =
    provider === 'anthropic'
      ? {
          provider,
          // Only named here, never echoed: the error message must not carry the key.
          apiKey: required('ANTHROPIC_API_KEY', 'set it when LLM_PROVIDER=anthropic'),
          model: env.LLM_MODEL || DEFAULT_ANTHROPIC_MODEL,
          // The Messages API requires max_tokens.
          maxTokens: int('LLM_MAX_TOKENS', 4096),
          timeoutMs,
        }
      : {
          provider: 'openai',
          url: required('LLM_URL', 'e.g. LLM_URL=http://localhost:11434/v1/chat/completions'),
          model: required('LLM_MODEL', 'e.g. LLM_MODEL=llama3.1'),
          apiKey: env.LLM_API_KEY,
          timeoutMs,
        };

  return {
    corpusPath: env.CORPUS_PATH || 'storage/corpus.db',
    // The gateway expects MCP_URL=http://mcp:8001.
    port: int('PORT', 8001),
    engineUrl,
    llm,
    // Off by default: the engine's /predict is still a placeholder with a different
    // body, so the simulate intent falls back to retrieval.
    predictUrl: bool('PREDICT_ENABLED', false) ? joinUrl(engineUrl, 'predict') : undefined,
  };
}

export type Config = ReturnType<typeof loadConfig>;
