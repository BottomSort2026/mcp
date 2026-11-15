export const DEFAULT_TIMEOUT_MS = 20_000;

/**
 * A non-2xx answer. `status` lets callers tell a rejected request (the engine's 422) from a
 * failure; `body` is the full response text, the message keeps its first 200 characters.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(label: string, status: number, body: string) {
    super(`${label} returned ${status}: ${body.slice(0, 200)}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

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
  return requestJson(
    url,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
    },
    label,
    timeoutMs,
  );
}

/** GETs JSON with a bounded timeout and a labelled error message. */
export async function getJson(
  url: string,
  label: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  return requestJson(url, { method: 'GET', headers: { accept: 'application/json' } }, label, timeoutMs);
}

async function requestJson(
  url: string,
  init: RequestInit,
  label: string,
  timeoutMs: number,
): Promise<unknown> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });

  if (!response.ok) {
    throw new HttpError(label, response.status, await response.text());
  }

  return response.json();
}
