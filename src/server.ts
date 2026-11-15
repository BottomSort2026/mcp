import { buildApp } from './app.ts';
import { loadConfig, type LlmConfig } from './config.ts';
import { openCorpus } from './db.ts';
import { embed } from './embeddings.ts';
import { createPredict } from './predict.ts';
import { createChat, type Chat } from './provider.ts';
import { createAnthropicChat } from './provider-anthropic.ts';
import type { Embed } from './rag.ts';

// Before the corpus opens: a missing ENGINE_URL or ANTHROPIC_API_KEY stops the boot here.
const config = loadConfig();

function chatFor(llm: LlmConfig): Chat {
  if (llm.provider === 'anthropic') {
    return createAnthropicChat({
      apiKey: llm.apiKey,
      model: llm.model,
      maxTokens: llm.maxTokens,
      timeoutMs: llm.timeoutMs,
    });
  }
  return createChat({ url: llm.url, model: llm.model, apiKey: llm.apiKey, timeoutMs: llm.timeoutMs });
}

// The corpus opens before the app exists, so its warnings wait for the logger.
const bootWarnings: string[] = [];
const corpus = openCorpus(config.corpusPath, { warn: (message) => bootWarnings.push(message) });
const { embedding } = corpus.info;

// The engine must run the model that built the corpus; embed() checks model_id and dimension.
const embedQuery: Embed = (text) =>
  embed(text, {
    engineUrl: config.engineUrl,
    modelId: embedding.model_id,
    dimension: embedding.dimension,
  });

const app = buildApp({
  corpus,
  embed: embedQuery,
  chat: chatFor(config.llm),
  predict: config.predictUrl ? createPredict(config.predictUrl) : undefined,
});

for (const message of bootWarnings) app.log.warn(message);
app.log.info(
  {
    corpus: corpus.info.corpus_name,
    builtAt: corpus.info.built_at,
    chunks: corpus.info.counts.chunks,
    model: embedding.model_id,
    dimension: embedding.dimension,
  },
  'corpus opened',
);
// Provider and model only; the API key is never logged.
app.log.info({ provider: config.llm.provider, model: config.llm.model }, 'llm configured');

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void app.close().then(() => {
      corpus.db.close();
      process.exit(0);
    });
  });
}

// All interfaces: the gateway reaches this service from another container.
await app.listen({ host: '0.0.0.0', port: config.port });
