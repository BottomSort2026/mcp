import { nullable } from "zod";

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

const required = (name: string, hint: string): string => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required, ${hint}`);
  return value;
};

export const config = {
  dbPath: env.DB_PATH ?? 'data/app.sqlite',
  port: int('PORT', 3000),
  dim: int('EMBED_DIM', 1536),
  embedUrl: required('EMBED_URL', 'e.g. EMBED_URL=http://localhost:11434/v1/embeddings'),
  embedModel: env.EMBED_MODEL,
  llmUrl: required('LLM_URL', 'e.g. LLM_URL=http://localhost:11434/v1/chat/completions'),
  llmModel: required('LLM_MODEL', 'e.g. LLM_MODEL=llama3.1'),
  llmApiKey: env.LLM_API_KEY,
  predictUrl: env.PREDICT_URL,
};
