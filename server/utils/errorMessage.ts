/**
 * Check whether an unknown error is an H3Error (has statusCode).
 * Used in catch blocks to re-throw intentional HTTP errors while
 * wrapping unexpected errors in a generic 500.
 */
export function isH3Error(error: unknown): error is { statusCode: number; statusMessage?: string } {
  return typeof error === 'object' && error !== null && 'statusCode' in error;
}
