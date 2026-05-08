import { describe, it, expect } from 'vitest';
import {
	TRANSFER_TYPES,
	LOSS_REASON_CODES,
	TTB_ACCOUNTS,
	STAGE_TO_TTB_ACCOUNT,
	getReportingPeriodForDate,
	getCurrentReportingPeriod,
	proofGallons,
	abvToProof,
	proofToAbv,
	isVolumeBalanced,
	isPGBalanced,
	RECONCILIATION_EPSILON,
} from '~/composables/transferDefinitions';

describe('TRANSFER_TYPES', () => {
	it('includes all expected transfer types', () => {
		expect(TRANSFER_TYPES).toContain('stage_transition');
		expect(TRANSFER_TYPES).toContain('vessel_move');
		expect(TRANSFER_TYPES).toContain('split');
		expect(TRANSFER_TYPES).toContain('merge');
		expect(TRANSFER_TYPES).toContain('tib_in');
		expect(TRANSFER_TYPES).toContain('tib_out');
		expect(TRANSFER_TYPES).toContain('tax_paid_withdrawal');
		expect(TRANSFER_TYPES).toContain('destruction');
		expect(TRANSFER_TYPES).toContain('sample');
		expect(TRANSFER_TYPES).toContain('reversal');
	});
});

describe('LOSS_REASON_CODES', () => {
	it('includes mandatory zero-loss attestation', () => {
		expect(LOSS_REASON_CODES).toContain('no_loss');
	});

	it('includes TTB-relevant loss categories', () => {
		expect(LOSS_REASON_CODES).toContain('evaporation');
		expect(LOSS_REASON_CODES).toContain('foreshots_heads_tails');
		expect(LOSS_REASON_CODES).toContain('measurement_variance');
	});
});

describe('STAGE_TO_TTB_ACCOUNT', () => {
	it('maps production stages to production', () => {
		expect(STAGE_TO_TTB_ACCOUNT.Mashing).toBe('production');
		expect(STAGE_TO_TTB_ACCOUNT.Fermenting).toBe('production');
		expect(STAGE_TO_TTB_ACCOUNT.Distilling).toBe('production');
	});

	it('maps storage stages to storage', () => {
		expect(STAGE_TO_TTB_ACCOUNT['Barrel Aging']).toBe('storage');
		expect(STAGE_TO_TTB_ACCOUNT.Storage).toBe('storage');
	});

	it('maps processing stages to processing', () => {
		expect(STAGE_TO_TTB_ACCOUNT.Blending).toBe('processing');
		expect(STAGE_TO_TTB_ACCOUNT.Proofing).toBe('processing');
		expect(STAGE_TO_TTB_ACCOUNT.Filtering).toBe('processing');
	});

	it('maps Bottled to tax_paid', () => {
		expect(STAGE_TO_TTB_ACCOUNT.Bottled).toBe('tax_paid');
	});

	it('all mapped accounts are valid TTB accounts', () => {
		for (const account of Object.values(STAGE_TO_TTB_ACCOUNT)) {
			expect(TTB_ACCOUNTS).toContain(account);
		}
	});
});

describe('getReportingPeriodForDate', () => {
	it('formats as YYYY-MM', () => {
		expect(getReportingPeriodForDate(new Date(Date.UTC(2026, 4, 7)))).toBe('2026-05');
		expect(getReportingPeriodForDate(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-01');
		expect(getReportingPeriodForDate(new Date(Date.UTC(2026, 11, 31)))).toBe('2026-12');
	});

	it('accepts ISO string input', () => {
		expect(getReportingPeriodForDate('2026-05-07T12:00:00Z')).toBe('2026-05');
	});
});

describe('getCurrentReportingPeriod', () => {
	it('returns current YYYY-MM', () => {
		const period = getCurrentReportingPeriod();
		expect(period).toMatch(/^\d{4}-\d{2}$/);
	});
});

describe('proofGallons', () => {
	it('computes PG = volume × proof / 100', () => {
		expect(proofGallons(10, 100)).toBe(10);    // 10 gal × 100 proof = 10 PG
		expect(proofGallons(50, 80)).toBe(40);     // 50 gal × 80 proof = 40 PG
		expect(proofGallons(100, 160)).toBe(160);  // 100 gal × 160 proof = 160 PG
	});

	it('returns 0 for invalid input', () => {
		expect(proofGallons(NaN, 100)).toBe(0);
		expect(proofGallons(10, NaN)).toBe(0);
	});
});

describe('abvToProof and proofToAbv', () => {
	it('converts ABV percentage to proof', () => {
		expect(abvToProof(40)).toBe(80);
		expect(abvToProof(50)).toBe(100);
	});

	it('handles ABV as decimal (<1)', () => {
		expect(abvToProof(0.4)).toBe(80);
	});

	it('proof to ABV is inverse', () => {
		expect(proofToAbv(80)).toBe(40);
		expect(proofToAbv(100)).toBe(50);
	});
});

describe('isVolumeBalanced', () => {
	it('returns true when source = dest + loss', () => {
		expect(isVolumeBalanced(100, 90, 10)).toBe(true);
		expect(isVolumeBalanced(100, 100, 0)).toBe(true);
	});

	it('returns false when imbalanced', () => {
		expect(isVolumeBalanced(100, 90, 0)).toBe(false);    // 10 gal unaccounted
		expect(isVolumeBalanced(100, 110, 0)).toBe(false);   // dest > source
	});

	it('tolerates floating-point rounding within epsilon', () => {
		expect(isVolumeBalanced(100, 99.9999, 0.0001)).toBe(true);
		// 100 - (99.99 + 0.005) = 0.005, which exceeds RECONCILIATION_EPSILON (0.001)
		expect(isVolumeBalanced(100, 99.99, 0.005)).toBe(false);
	});
});

describe('isPGBalanced', () => {
	it('checks PG conservation similarly', () => {
		expect(isPGBalanced(80, 72, 8)).toBe(true);
		expect(isPGBalanced(80, 70, 8)).toBe(false);
	});
});

describe('RECONCILIATION_EPSILON', () => {
	it('is small enough to be physically meaningful', () => {
		// 0.001 wine gallons ≈ 0.13 fluid ounces — tighter than any gauge
		expect(RECONCILIATION_EPSILON).toBeLessThanOrEqual(0.01);
		expect(RECONCILIATION_EPSILON).toBeGreaterThan(0);
	});
});
