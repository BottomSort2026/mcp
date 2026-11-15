import { joinUrl, postJson } from './http.ts';
import { truncateChars } from './text.ts';

/** The engine answers 422 above this many characters (Python len, i.e. code points). */
export const MAX_EMBED_CHARS = 2000;

export type EmbedOptions = {
  /** Engine base URL, e.g. http://localhost:8000. */
  engineUrl: string;
  /** corpus_info.embedding.model_id: the engine must run the model that built the index. */
  modelId: string;
  /** corpus_info.embedding.dimension. */
  dimension: number;
};

/**
 * Embeds one query with the engine:
 * POST /embed { text } -> { embedding, dimension, model_id, revision }.
 * The engine adds the query prefix itself, so the raw text is sent.
 */
export async function embed(text: string, options: EmbedOptions): Promise<number[]> {
  const body = (await postJson(
    joinUrl(options.engineUrl, 'embed'),
    { text: truncateChars(text, MAX_EMBED_CHARS) },
    'embedding engine',
  )) as { embedding?: unknown; model_id?: unknown } | null;

  const vector = body?.embedding;
  if (
    !Array.isArray(vector) ||
    vector.some((value) => typeof value !== 'number' || !Number.isFinite(value))
  ) {
    throw new Error('embedding engine returned no numeric vector');
  }
  if (body?.model_id !== options.modelId) {
    throw new Error(
      `embedding engine runs model ${String(body?.model_id)} but the corpus was built with ${options.modelId}`,
    );
  }
  if (vector.length !== options.dimension) {
    throw new Error(
      `embedding engine returned ${vector.length} dims, the corpus stores ${options.dimension}`,
    );
  }

  return vector as number[];
}
