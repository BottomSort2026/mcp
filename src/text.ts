/**
 * Keeps at most `max` characters, counted as code points (Python's len), so a
 * surrogate pair is never split.
 */
export function truncateChars(text: string, max: number): string {
  if (text.length <= max) return text;
  return Array.from(text).slice(0, max).join('');
}

/**
 * The outermost JSON object in a model reply. Models sometimes wrap JSON in prose or code
 * fences, so a leading ```json fence and a trailing ``` are stripped and everything outside the
 * first `{` and the last `}` is ignored. Undefined when there is no object or it does not parse.
 */
export function parseJsonObject(raw: string): Record<string, unknown> | undefined {
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
