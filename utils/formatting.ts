export const Dollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Format a volume (or any numeric) for display: max 2 decimal places,
 * trailing zeros and trailing dot stripped so whole numbers stay clean.
 * Examples: 42.003348 → "42", 258.1 → "258.1", 26.153028 → "26.15"
 */
export function formatVolume(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "0";
  return (+value.toFixed(2)).toString();
}
