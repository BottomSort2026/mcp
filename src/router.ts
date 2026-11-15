import type { Turn } from './history.ts';
import type { Chat } from './provider.ts';

export type Scalar = string | number | boolean;

export type Decision =
  | { sensible: false }
  | { sensible: true; english: string; intent: 'investigate' }
  | { sensible: true; english: string; intent: 'simulate'; params: Record<string, Scalar> };

export const ROUTER_SYSTEM = `You route messages for Flame in Freefall, an assistant on NASA microgravity
combustion research and spacecraft fire safety, used by researchers and by students. It answers
from a corpus in English: NASA Physical Sciences Informatics (PSI) combustion investigations such
as SAFFIRE, FLEX, BASS and their test data, plus NASA fact sheets and a book on combustion in
reduced gravity.

Return ONLY a JSON object:
{"sensible": true|false, "english": "...", "intent": "investigate"|"simulate", "params": {...}}

Rules:
- sensible=true for any question about fire, flames, combustion, extinction, fire safety in space
  or on Earth, microgravity science, or these investigations and their data. Basic conceptual
  questions from students ("what is a flame?", "why are flames round in space?") are sensible.
- sensible=false only for gibberish, or a message that is unrelated to that domain. Then leave
  english empty.
- english is ONE standalone English search query for the corpus. Translate the latest message if
  needed, and resolve references to earlier turns with the conversation: after a question about
  FLEX droplet extinction, "and with helium?" becomes "effect of helium dilution on droplet flame
  extinction in the FLEX experiments". Keep technical terms, acronyms, units and investigation
  names exactly as written (SAFFIRE-III, PMMA, LOI, CO2, mm2/s).
- intent="simulate" only when the user asks to run or predict a scenario and provides concrete
  values. Put those values in params as a flat object of numbers, strings or booleans. Never invent
  values; if any are missing, use intent="investigate".
- Otherwise intent="investigate".`;

/**
 * One structured call that translates, resolves follow-ups and classifies. The
 * history goes inside the user message as a transcript: as real chat turns, the
 * previous prose answers would pull the model away from answering in JSON.
 */
export async function route(message: string, history: Turn[], chat: Chat): Promise<Decision> {
  const content =
    history.length === 0
      ? message
      : [
          'Conversation so far:',
          ...history.map((turn) => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}`),
          '',
          'Latest message:',
          message,
        ].join('\n');

  const raw = await chat(
    [
      { role: 'system', content: ROUTER_SYSTEM },
      { role: 'user', content },
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
