import { postJson } from './http.ts';
import type { Scalar } from './router.ts';

export type Predict = (params: Record<string, Scalar>) => Promise<unknown>;

/**
 * The simulation engine's request body is its own contract, so the routed
 * parameters are forwarded as-is. They are already restricted to flat scalars.
 */
export function createPredict(url: string | undefined): Predict {
  return async (params) => {
    if (!url) throw new Error('prediction is disabled, set PREDICT_ENABLED=true');
    return postJson(url, params, 'predict engine');
  };
}
