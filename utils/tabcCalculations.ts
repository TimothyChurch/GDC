import { calculateProofGallons, toGallons } from '~/utils/proofGallons';

/**
 * Texas excise tax rate on distilled spirits — $2.40 per wine gallon.
 * (Tex. Alco. Bev. Code §201.03; rate stable since 1985.)
 *
 * NOTE: federal CBMA rates and the FET tier breakpoints live in
 * `useProductionCosts` / TTB report components.
 */
export const TABC_TAX_RATE_PER_WG = 2.40;

export interface SpiritFraction {
	volume?: number;
	volumeUnit?: string;
	abv?: number;
}

export interface VolumeAbvAggregate {
	/** Total volume in wine gallons. */
	wineGallons: number;
	/** Volume-weighted average ABV (percent, 0-100 scale). */
	avgAbv: number;
	/** Proof gallons derived from totals. */
	proofGallons: number;
}

/**
 * Sum a list of spirit fractions into one aggregate. Each fraction's volume
 * is converted to wine gallons, the ABV is volume-weighted, and proof gallons
 * are derived from the totals (NOT summed per-fraction — preserves precision
 * when fractions have differing ABV).
 *
 * Pure: stateless and unit-test friendly. Used to roll up hearts / heads /
 * tails for TABC reporting.
 */
export function aggregateFractions(
	fractions: ReadonlyArray<SpiritFraction | undefined | null>,
): VolumeAbvAggregate {
	let wineGallons = 0;
	let abvWeighted = 0;

	for (const f of fractions) {
		if (!f) continue;
		const vol = toGallons(f.volume || 0, f.volumeUnit || 'gallon');
		if (vol <= 0) continue;
		wineGallons += vol;
		abvWeighted += vol * (f.abv || 0);
	}

	const avgAbv = wineGallons > 0 ? abvWeighted / wineGallons : 0;
	const proofGallons = wineGallons > 0 && avgAbv > 0
		? calculateProofGallons(wineGallons, 'gallon', avgAbv)
		: 0;

	return { wineGallons, avgAbv, proofGallons };
}

/**
 * Texas excise tax due, in dollars. Applies the per-wine-gallon rate to the
 * total wine gallons of taxable spirits produced.
 */
export function computeTabcTaxDue(
	totalProductionWG: number,
	rate: number = TABC_TAX_RATE_PER_WG,
): number {
	if (!Number.isFinite(totalProductionWG) || totalProductionWG <= 0) return 0;
	return totalProductionWG * rate;
}
