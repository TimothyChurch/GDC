/**
 * Check whether an unknown error is an H3Error (has status or legacy statusCode).
 * Used in catch blocks to re-throw intentional HTTP errors while
 * wrapping unexpected errors in a generic 500.
 */
export function isH3Error(error: unknown): error is { status: number; statusText?: string } {
  return typeof error === 'object' && error !== null && ('status' in error || 'statusCode' in error);
}
