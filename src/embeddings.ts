import { postJson } from './http.ts';

export type EmbedOptions = {
  url: string;
  model: string;
  dim: number;
};

/**
 * Embeds one query with the engine that owns the model. Expects an
 * OpenAI-compatible POST: { model, input } -> { data: [{ embedding }] }.
 */
export async function embed(text: string, options: EmbedOptions): Promise<number[]> {
  const body = await postJson(
    options.url,
    { model: options.model, input: [text] },
    'embedding engine',
  );

  const vector = (body as { data?: Array<{ embedding?: unknown }> }).data?.[0]?.embedding;
  if (!Array.isArray(vector) || vector.some((value) => typeof value !== 'number')) {
    throw new Error('embedding engine returned no numeric vector');
  }
  if (vector.length !== options.dim) {
    throw new Error(`embedding engine returned ${vector.length} dims, EMBED_DIM=${options.dim}`);
  }

  return vector as number[];
}
