/**
 * Federal Excise Tax (FET) on distilled spirits.
 *
 * 26 U.S.C. § 5001 sets the standard rate at $13.50/PG. The Craft Beverage
 * Modernization Act (CBMA) adds a tiered reduced-rate schedule for domestic
 * production, by calendar-year proof-gallon volume:
 *
 *   Tier 1:    $2.70 / PG  for the first 100,000 PG
 *   Tier 2:   $13.34 / PG  for the next 22,130,000 PG (100,001–22,230,000)
 *   Standard: $13.50 / PG  beyond that
 *
 * GDC's volume falls comfortably under the Tier 1 ceiling; the higher tiers
 * are kept here so historical/projection scenarios can use the same kernel.
 *
 * See tech-debt #63 (CBMA_TIER1_LIMIT_PG) for the magic-number cleanup.
 */

export type CbmaTier = 'tier1' | 'tier2' | 'standard';

export const TTB_CBMA_TIER1_RATE_PER_PG = 2.70;
export const TTB_CBMA_TIER2_RATE_PER_PG = 13.34;
export const TTB_STANDARD_RATE_PER_PG = 13.50;

/** Annual proof-gallon ceiling for each CBMA tier, cumulative. */
export const CBMA_TIER1_LIMIT_PG = 100_000;
export const CBMA_TIER2_LIMIT_PG = 22_230_000; // 100k + 22.13M

/** Resolve the per-PG rate for a given CBMA tier. */
export function getCbmaRate(tier: CbmaTier): number {
	if (tier === 'tier1') return TTB_CBMA_TIER1_RATE_PER_PG;
	if (tier === 'tier2') return TTB_CBMA_TIER2_RATE_PER_PG;
	return TTB_STANDARD_RATE_PER_PG;
}

/** Human-readable label for the rate, suitable for report headers. */
export function getCbmaRateLabel(tier: CbmaTier): string {
	if (tier === 'tier1') {
		return `CBMA Reduced Rate — $${TTB_CBMA_TIER1_RATE_PER_PG.toFixed(2)}/PG (first ${CBMA_TIER1_LIMIT_PG.toLocaleString()} PG)`;
	}
	if (tier === 'tier2') {
		return `CBMA Reduced Rate — $${TTB_CBMA_TIER2_RATE_PER_PG.toFixed(2)}/PG (${(CBMA_TIER1_LIMIT_PG + 1).toLocaleString()}–${CBMA_TIER2_LIMIT_PG.toLocaleString()} PG)`;
	}
	return `Standard Rate — $${TTB_STANDARD_RATE_PER_PG.toFixed(2)}/PG`;
}

/**
 * Federal excise tax due, in dollars. Pass a CBMA tier (or numeric rate
 * override) to compute. Tracking annual PG cumulative volume is the caller's
 * responsibility — this fn is single-rate by design.
 */
export function computeFederalExciseTax(
	proofGallons: number,
	tierOrRate: CbmaTier | number = 'tier1',
): number {
	if (!Number.isFinite(proofGallons) || proofGallons <= 0) return 0;
	const rate = typeof tierOrRate === 'number' ? tierOrRate : getCbmaRate(tierOrRate);
	return proofGallons * rate;
}
