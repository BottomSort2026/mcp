import type { Chat } from './provider.ts';

export type Scalar = string | number | boolean;

export type Decision =
  | { sensible: false }
  | { sensible: true; english: string; intent: 'investigate' }
  | { sensible: true; english: string; intent: 'simulate'; params: Record<string, Scalar> };

const SYSTEM = `You route user messages for a service that searches a set of PDF documents
and can run simulations.

Return ONLY a JSON object:
{"sensible": true|false, "english": "...", "intent": "investigate"|"simulate", "params": {...}}

Rules:
- sensible=false when the message is gibberish, ambiguous beyond use, or not a request about the
  documents or a simulation. Do not translate those.
- english is the message translated to English. If it is already English, repeat it unchanged.
- intent="simulate" only when the user asks to run or predict a scenario and provides concrete
  values. Put those values in params as a flat object of numbers, strings or booleans. Never invent
  values; if any are missing, use intent="investigate".
- Otherwise intent="investigate".`;

export async function route(prompt: string, chat: Chat): Promise<Decision> {
  const raw = await chat(
    [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
    { json: true },
  );

  const decision = parseObject(raw);
  if (!decision) return { sensible: false };

  const english = typeof decision.english === 'string' ? decision.english.trim() : '';
  if (decision.sensible !== true || !english) return { sensible: false };

  const params = flatScalars(decision.params);
  if (decision.intent === 'simulate' && params && Object.keys(params).length > 0) {
    return { sensible: true, english, intent: 'simulate', params };
  }

  return { sensible: true, english, intent: 'investigate' };
}

// Models sometimes wrap JSON in prose or code fences.
function parseObject(raw: string): Record<string, unknown> | undefined {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return undefined;

  try {
    const value = JSON.parse(text.slice(start, end + 1)) as unknown;
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function flatScalars(value: unknown): Record<string, Scalar> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;

  const params: Record<string, Scalar> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
      return undefined;
    }
    params[key] = item;
  }
  return params;
}
