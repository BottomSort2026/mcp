import { truncateChars } from './text.ts';

export type Turn = { role: 'user' | 'assistant'; content: string };

export const MAX_HISTORY_TURNS = 6;
export const MAX_TURN_CHARS = 2000;

/**
 * The conversation as /chat receives it, made safe to forward: malformed
 * entries are dropped silently, then the last 6 are kept, each cut to 2000
 * characters. Citation markers are removed from earlier answers because their
 * numbers pointed at that turn's passages, not at the ones the model gets now.
 */
export function normalizeHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];

  const turns: Turn[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const text = (role === 'assistant' ? stripMarkers(content) : content).trim();
    if (text) turns.push({ role, content: text });
  }

  return turns
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({ ...turn, content: truncateChars(turn.content, MAX_TURN_CHARS) }));
}

const stripMarkers = (text: string): string => text.replace(/\s?\[\d{1,2}(?:\s*,\s*\d{1,2})*\]/g, '');
