const TIMEOUT_MS = 20_000;

/** POSTs JSON with a bounded timeout and a labelled error message. */
export async function postJson(
  url: string,
  body: unknown,
  label: string,
  headers: Record<string, string> = {},
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`${label} returned ${response.status}: ${detail}`);
  }

  return response.json();
}
