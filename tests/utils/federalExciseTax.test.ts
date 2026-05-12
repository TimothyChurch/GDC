import { describe, it, expect } from 'vitest';
import {
	computeFederalExciseTax,
	getCbmaRate,
	getCbmaRateLabel,
	CBMA_TIER1_LIMIT_PG,
	CBMA_TIER2_LIMIT_PG,
	TTB_CBMA_TIER1_RATE_PER_PG,
	TTB_CBMA_TIER2_RATE_PER_PG,
	TTB_STANDARD_RATE_PER_PG,
} from '~/utils/federalExciseTax';

describe('CBMA constants', () => {
	it('exposes the canonical rates', () => {
		expect(TTB_CBMA_TIER1_RATE_PER_PG).toBe(2.70);
		expect(TTB_CBMA_TIER2_RATE_PER_PG).toBe(13.34);
		expect(TTB_STANDARD_RATE_PER_PG).toBe(13.50);
	});

	it('exposes the canonical PG ceilings', () => {
		expect(CBMA_TIER1_LIMIT_PG).toBe(100_000);
		expect(CBMA_TIER2_LIMIT_PG).toBe(22_230_000);
	});
});

describe('getCbmaRate', () => {
	it('returns the Tier 1 rate', () => {
		expect(getCbmaRate('tier1')).toBe(2.70);
	});

	it('returns the Tier 2 rate', () => {
		expect(getCbmaRate('tier2')).toBe(13.34);
	});

	it('returns the standard rate', () => {
		expect(getCbmaRate('standard')).toBe(13.50);
	});
});

describe('getCbmaRateLabel', () => {
	it('describes the Tier 1 rate with the PG ceiling', () => {
		const label = getCbmaRateLabel('tier1');
		expect(label).toContain('$2.70/PG');
		expect(label).toContain('100,000');
		expect(label).toContain('CBMA');
	});

	it('describes the Tier 2 rate with both bounds', () => {
		const label = getCbmaRateLabel('tier2');
		expect(label).toContain('$13.34/PG');
		expect(label).toContain('100,001');
		expect(label).toContain('22,230,000');
	});

	it('describes the standard rate without CBMA framing', () => {
		const label = getCbmaRateLabel('standard');
		expect(label).toContain('$13.50/PG');
		expect(label).toContain('Standard');
		expect(label).not.toContain('CBMA');
	});
});

describe('computeFederalExciseTax', () => {
	it('returns 0 for zero proof gallons', () => {
		expect(computeFederalExciseTax(0)).toBe(0);
	});

	it('returns 0 for negative input (defensive)', () => {
		expect(computeFederalExciseTax(-100)).toBe(0);
	});

	it('returns 0 for non-finite input', () => {
		expect(computeFederalExciseTax(NaN)).toBe(0);
		expect(computeFederalExciseTax(Infinity)).toBe(0);
	});

	it('defaults to Tier 1 when no tier is specified', () => {
		// 100 PG × $2.70 = $270
		expect(computeFederalExciseTax(100)).toBeCloseTo(270, 6);
	});

	it('applies the Tier 1 rate by name', () => {
		expect(computeFederalExciseTax(100, 'tier1')).toBeCloseTo(270, 6);
	});

	it('applies the Tier 2 rate by name', () => {
		// 100 PG × $13.34 = $1334
		expect(computeFederalExciseTax(100, 'tier2')).toBeCloseTo(1334, 6);
	});

	it('applies the standard rate by name', () => {
		// 100 PG × $13.50 = $1350
		expect(computeFederalExciseTax(100, 'standard')).toBeCloseTo(1350, 6);
	});

	it('accepts a numeric rate override', () => {
		expect(computeFederalExciseTax(100, 5.0)).toBe(500);
	});

	it('preserves precision on fractional proof gallons', () => {
		// 3.7575 PG × $2.70 = $10.14525
		expect(computeFederalExciseTax(3.7575)).toBeCloseTo(10.14525, 6);
	});

	it('matches the per-bottle FET for a typical 750mL/40% ABV bottling run at Tier 1', () => {
		// 750mL ≈ 0.198129 gallons → at 40% ABV: PG = WG × ABV/50 = 0.198129 × 0.8 ≈ 0.15850 PG/bottle
		// 100 bottles ≈ 15.850 PG → tax ≈ $42.80
		const pgFor100Bottles = 0.198129 * 0.8 * 100;
		const tax = computeFederalExciseTax(pgFor100Bottles);
		expect(tax).toBeCloseTo(42.80, 1);
	});

	it('shows the same bottling at the standard rate would be ~5x more expensive', () => {
		const pgFor100Bottles = 0.198129 * 0.8 * 100;
		const tier1Tax = computeFederalExciseTax(pgFor100Bottles, 'tier1');
		const standardTax = computeFederalExciseTax(pgFor100Bottles, 'standard');
		expect(standardTax / tier1Tax).toBeCloseTo(13.50 / 2.70, 4);
	});
});
