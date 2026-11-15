/**
 * Keeps at most `max` characters, counted as code points (Python's len), so a
 * surrogate pair is never split.
 */
export function truncateChars(text: string, max: number): string {
  if (text.length <= max) return text;
  return Array.from(text).slice(0, max).join('');
}
