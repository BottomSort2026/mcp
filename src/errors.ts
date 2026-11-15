export type UpstreamCode = 'llm_unavailable' | 'predict_unavailable';

/** A dependency that can fail a /chat request. Answered as 502 with this code. */
export class UpstreamError extends Error {
  readonly code: UpstreamCode;

  constructor(code: UpstreamCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'UpstreamError';
    this.code = code;
  }
}

/** Runs one upstream call and labels any failure with `code`. */
export async function upstream<T>(code: UpstreamCode, call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw new UpstreamError(code, describeError(error), { cause: error });
  }
}

/** The message, plus the network reason that fetch() hides in `cause` (ECONNREFUSED, DNS). */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause as { message?: string; code?: string } | undefined;
  const detail = cause?.message || cause?.code;
  return detail ? `${error.message} (${detail})` : error.message;
}
