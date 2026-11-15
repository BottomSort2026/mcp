export const DEFAULT_TIMEOUT_MS = 20_000;

/** Joins a base URL and a path, tolerating a trailing slash on the base. */
export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** POSTs JSON with a bounded timeout and a labelled error message. */
export async function postJson(
  url: string,
  body: unknown,
  label: string,
  headers: Record<string, string> = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`${label} returned ${response.status}: ${detail}`);
  }

  return response.json();
}
