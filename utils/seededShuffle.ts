/**
 * Deterministic shuffle using a seeded pseudo-random number generator.
 * Used for SSR-safe random selections — the same seed produces the same
 * result on both server and client, avoiding hydration mismatches.
 *
 * Uses a simple mulberry32 PRNG seeded from a numeric value.
 */

/** mulberry32 — fast 32-bit PRNG that returns a function producing 0..1 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a new array with elements shuffled deterministically.
 * Same seed always produces the same order (Fisher-Yates with seeded RNG).
 */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a numeric seed based on the current UTC date.
 * Changes once per day, so featured items rotate daily while
 * remaining consistent across server and client within the same request.
 */
export function todaySeed(): number {
  const now = new Date();
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}
