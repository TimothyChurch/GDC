import { describe, it, expect } from 'vitest';
import {
	aggregateFractions,
	computeTabcTaxDue,
	TABC_TAX_RATE_PER_WG,
} from '~/utils/tabcCalculations';

describe('aggregateFractions', () => {
	it('returns zeros for an empty array', () => {
		expect(aggregateFractions([])).toEqual({
			wineGallons: 0,
			avgAbv: 0,
			proofGallons: 0,
		});
	});

	it('skips null/undefined entries without crashing', () => {
		const result = aggregateFractions([
			null,
			undefined,
			{ volume: 10, volumeUnit: 'gallon', abv: 50 },
		]);
		expect(result.wineGallons).toBe(10);
		expect(result.avgAbv).toBe(50);
	});

	it('skips fractions with zero or missing volume', () => {
		const result = aggregateFractions([
			{ volume: 0, volumeUnit: 'gallon', abv: 50 },
			{ volumeUnit: 'gallon', abv: 50 },
			{ volume: 5, volumeUnit: 'gallon', abv: 60 },
		]);
		expect(result.wineGallons).toBe(5);
		expect(result.avgAbv).toBe(60);
	});

	it('sums volumes in gallons (identity)', () => {
		const result = aggregateFractions([
			{ volume: 10, volumeUnit: 'gallon', abv: 50 },
			{ volume: 20, volumeUnit: 'gallon', abv: 50 },
		]);
		expect(result.wineGallons).toBe(30);
		expect(result.avgAbv).toBe(50);
	});

	it('converts liters to wine gallons', () => {
		// 3.78541 L ≈ 1 gallon
		const result = aggregateFractions([
			{ volume: 3.78541, volumeUnit: 'L', abv: 40 },
		]);
		expect(result.wineGallons).toBeCloseTo(1, 4);
		expect(result.avgAbv).toBeCloseTo(40, 6);
	});

	it('computes volume-weighted average ABV across mixed proofs', () => {
		// 10 gal at 80% + 30 gal at 40% → weighted: (10*80 + 30*40) / 40 = 50%
		const result = aggregateFractions([
			{ volume: 10, volumeUnit: 'gallon', abv: 80 },
			{ volume: 30, volumeUnit: 'gallon', abv: 40 },
		]);
		expect(result.wineGallons).toBe(40);
		expect(result.avgAbv).toBe(50);
	});

	it('derives proof gallons from totals (not summed per-fraction)', () => {
		// PG = WG × ABV / 50  (TTB: 1 PG = 1 gal at 50% ABV)
		// 50 gal at 80% ABV → 50 × 80 / 50 = 80 PG
		const result = aggregateFractions([
			{ volume: 50, volumeUnit: 'gallon', abv: 80 },
		]);
		expect(result.proofGallons).toBeCloseTo(80, 4);
	});

	it('PG of weighted average matches PG of summed fractions (precision invariant)', () => {
		// Hearts split across two runs: 30 gal at 80% + 20 gal at 60%
		// Weighted avg ABV = (30*80 + 20*60) / 50 = 72
		// Total PG = 50 × 72 / 50 = 72
		const result = aggregateFractions([
			{ volume: 30, volumeUnit: 'gallon', abv: 80 },
			{ volume: 20, volumeUnit: 'gallon', abv: 60 },
		]);
		expect(result.wineGallons).toBe(50);
		expect(result.avgAbv).toBeCloseTo(72, 6);
		expect(result.proofGallons).toBeCloseTo(72, 4);
	});

	it('returns zero proof gallons when ABV is zero', () => {
		const result = aggregateFractions([
			{ volume: 100, volumeUnit: 'gallon', abv: 0 },
		]);
		expect(result.wineGallons).toBe(100);
		expect(result.proofGallons).toBe(0);
	});

	it('falls back to gallons when volumeUnit is missing', () => {
		const result = aggregateFractions([
			{ volume: 10, abv: 50 },
		]);
		expect(result.wineGallons).toBe(10);
	});

	it('treats missing abv as zero (not NaN)', () => {
		const result = aggregateFractions([
			{ volume: 10, volumeUnit: 'gallon' },
		]);
		expect(result.avgAbv).toBe(0);
		expect(result.proofGallons).toBe(0);
	});
});

describe('computeTabcTaxDue', () => {
	it('exposes the canonical Texas excise rate', () => {
		expect(TABC_TAX_RATE_PER_WG).toBe(2.40);
	});

	it('returns 0 for zero production', () => {
		expect(computeTabcTaxDue(0)).toBe(0);
	});

	it('returns 0 for negative input (defensive)', () => {
		expect(computeTabcTaxDue(-10)).toBe(0);
	});

	it('returns 0 for non-finite input', () => {
		expect(computeTabcTaxDue(NaN)).toBe(0);
		expect(computeTabcTaxDue(Infinity)).toBe(0);
	});

	it('multiplies by the default rate', () => {
		expect(computeTabcTaxDue(100)).toBeCloseTo(240, 6);
	});

	it('accepts a custom rate override (for fixture/historical filings)', () => {
		expect(computeTabcTaxDue(100, 1.5)).toBe(150);
	});

	it('preserves precision on fractional production volumes', () => {
		// 12.345 gal × $2.40/gal = $29.628
		expect(computeTabcTaxDue(12.345)).toBeCloseTo(29.628, 6);
	});
});
