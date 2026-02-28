/**
 * Extract a human-readable error message from an unknown error.
 * Handles $fetch FetchError (with `data.statusMessage` / `data.message`),
 * standard Error instances, and completely unknown values.
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    // $fetch / FetchError shape: { data: { statusMessage?, message? }, message? }
    const e = error as Record<string, unknown>;
    const data = e.data as Record<string, unknown> | undefined;
    if (data) {
      if (typeof data.statusMessage === 'string') return data.statusMessage;
      if (typeof data.message === 'string') return data.message;
    }
    if (typeof e.message === 'string') return e.message;
  }
  if (typeof error === 'string') return error;
  return 'Unknown error';
}
