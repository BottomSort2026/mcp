import { z } from 'zod';
import { getJson, joinUrl, postJson } from './http.ts';
import type { Scalar } from './router.ts';

/** The six Flame Lab inputs (fuel, pressure_atm, o2, suppressant, suppressant_fraction, droplet_d0_mm). */
export type LabInputs = Record<string, Scalar>;

/**
 * The engine's FLEX endpoints used by the Flame Lab. Both return the body exactly as the engine
 * sent it: the engine owns the contract (its /openapi.json), and its own validation decides what a
 * valid input is.
 */
export type Engine = {
  /** POST ${ENGINE_URL}/predict with the inputs as the body. */
  predict: (inputs: LabInputs) => Promise<unknown>;
  /** GET ${ENGINE_URL}/model-info. */
  modelInfo: () => Promise<unknown>;
};

export function createEngine(engineUrl: string, timeoutMs?: number): Engine {
  return {
    predict: (inputs) => postJson(joinUrl(engineUrl, 'predict'), inputs, 'engine /predict', {}, timeoutMs),
    modelInfo: () => getJson(joinUrl(engineUrl, 'model-info'), 'engine /model-info', timeoutMs),
  };
}

// --- The part of the engine's POST /predict response that this service reads. ---
// The source of truth is the engine's /openapi.json (PredictResponse). Only the fields used to build
// the explanation are checked here; the response itself is forwarded unchanged, extra fields included.

const NearestTestSchema = z.object({
  cir_id: z.string().nullable(),
  /** e.g. FLEX-046; its TestSheet in corpus.db is titled FLEX-046_TestSheet. */
  testsheet_id: z.string().nullable(),
  /** How the real test ended: extinction, disruption or completion. */
  test_end: z.string().nullable(),
  conditions: z.record(z.string(), z.union([z.number(), z.string(), z.null()])),
  distance: z.number(),
});

const SupportSchema = z.object({
  in_tested_range: z.boolean(),
  out_of_range_fields: z.array(z.string()),
  support_n: z.number().int(),
  threshold: z.number(),
  confidence: z.enum(['low', 'medium', 'high']),
  nearest_tests: z.array(NearestTestSchema),
});

const ModelSourceSchema = z.object({
  model_version: z.string(),
  training_source: z.object({
    dataset: z.string(),
    accession: z.string(),
    rows: z.number().int(),
  }),
});

export const PredictionSchema = z.object({
  outcome: z.object({
    prediction: z.object({
      label: z.enum(['extinction', 'no_extinction']),
      probabilities: z.record(z.string(), z.number()),
    }),
    support: SupportSchema,
    model: ModelSourceSchema,
  }),
  extinction: z.object({
    prediction: z.object({
      extinction_diameter_ratio: z.number(),
      extinction_diameter_mm: z.number(),
      fuel_burned_fraction: z.number(),
    }),
    support: SupportSchema,
    model: ModelSourceSchema,
  }),
});

export type Prediction = z.infer<typeof PredictionSchema>;
export type Support = z.infer<typeof SupportSchema>;
export type NearestTest = z.infer<typeof NearestTestSchema>;
