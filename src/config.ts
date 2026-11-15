import { joinUrl } from './http.ts';

const env = process.env;

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

export const config = {
  corpusPath: env.CORPUS_PATH || 'storage/corpus.db',
  // The gateway expects MCP_URL=http://mcp:8001.
  port: int('PORT', 8001),
  engineUrl,
  llmUrl: required('LLM_URL', 'e.g. LLM_URL=http://localhost:11434/v1/chat/completions'),
  llmModel: required('LLM_MODEL', 'e.g. LLM_MODEL=llama3.1'),
  llmApiKey: env.LLM_API_KEY,
  llmTimeoutMs: int('LLM_TIMEOUT_MS', 60_000),
  // Only the chat's simulate intent. Off by default: the router does not extract the six FLEX
  // inputs yet, so the engine would reject its parameters (422). The Flame Lab does not depend on
  // it: /lab/predict always calls ${ENGINE_URL}/predict.
  predictUrl: bool('PREDICT_ENABLED', false) ? joinUrl(engineUrl, 'predict') : undefined,
};
