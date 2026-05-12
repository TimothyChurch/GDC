import { describe, it, expect } from 'vitest';
import { buildChargeTransferInput } from '~/composables/useStillCharge';
import {
	computeTotals,
	validateInvariants,
} from '~/server/utils/transferEngineCore';

const BATCH = '000000000000000000000001';
const STILL = '000000000000000000000099';
const FERMENTER = '000000000000000000000010';
const FERMENTER_2 = '000000000000000000000011';
const FEINTS_VESSEL = '000000000000000000000020';

describe('buildChargeTransferInput — single source', () => {
	it('builds a balanced TransferInput from a single vessel charge', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
		});

		expect(input.type).toBe('vessel_move');
		expect(input.batch).toBe(BATCH);
		expect(input.fromStage).toBe('Stripping Run');
		expect(input.toStage).toBe('Stripping Run');
		expect(input.sources).toHaveLength(1);
		expect(input.sources[0]).toMatchObject({
			vessel: FERMENTER,
			volume: 100,
			proof: 16,
		});
		expect(input.destinations).toHaveLength(1);
		expect(input.destinations[0]).toMatchObject({
			vessel: STILL,
			volume: 100,
			proof: 16,
			stage: 'Stripping Run',
		});
		expect(input.loss).toEqual({ volume: 0, proof: 0, reasonCode: 'no_loss' });
		expect(input.ttbAccount).toEqual({ from: 'production', to: 'production' });
	});

	it('passes the engine invariant validation', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
		});
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});
});

describe('buildChargeTransferInput — unit conversion', () => {
	it('converts liters to wine gallons', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 378.541, volumeUnit: 'L' },
			],
		});
		// 378.541 L ≈ 100 gallons
		expect(input.sources[0]!.volume).toBeCloseTo(100, 3);
		expect(input.destinations[0]!.volume).toBeCloseTo(100, 3);
	});

	it('converts milliliters to wine gallons', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 3785.41, volumeUnit: 'mL' },
			],
		});
		// 3785.41 mL ≈ 1 gallon
		expect(input.sources[0]!.volume).toBeCloseTo(1, 3);
	});

	it('throws on unknown unit (no silent fallback)', () => {
		expect(() =>
			buildChargeTransferInput({
				batchId: BATCH,
				stage: 'Stripping Run',
				stillId: STILL,
				chargeAbv: 8,
				chargeSources: [
					{ vesselId: FERMENTER, volume: 1, volumeUnit: 'barrel' },
				],
			}),
		).toThrow();
	});
});

describe('buildChargeTransferInput — multi-source merge', () => {
	it('combines two charge sources with a weighted-average destination proof', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8, // both charge sources at same proof
			chargeSources: [
				{ vesselId: FERMENTER, volume: 60, volumeUnit: 'gallon' },
				{ vesselId: FERMENTER_2, volume: 40, volumeUnit: 'gallon' },
			],
		});

		expect(input.sources).toHaveLength(2);
		expect(input.destinations[0]!.volume).toBe(100);
		expect(input.destinations[0]!.proof).toBe(16); // both sources at proof 16
	});

	it('weights destination proof when an addition has different ABV', () => {
		// 100 gal at 16 proof + 10 gal at 60 proof feints
		// total PG = 100*16/100 + 10*60/100 = 16 + 6 = 22
		// total vol = 110
		// dest proof = 22 / 110 * 100 = 20
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Spirit Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			additions: [
				{ sourceVessel: FEINTS_VESSEL, volume: 10, volumeUnit: 'gallon', abv: 30 },
			],
		});

		expect(input.sources).toHaveLength(2);
		expect(input.destinations[0]!.volume).toBe(110);
		expect(input.destinations[0]!.proof).toBeCloseTo(20, 6);
	});

	it('passes invariants on weighted multi-source merge', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Spirit Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			additions: [
				{ sourceVessel: FEINTS_VESSEL, volume: 10, volumeUnit: 'gallon', abv: 30 },
			],
		});
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});
});

describe('buildChargeTransferInput — additions filtering', () => {
	it('skips additions without a sourceVessel (water from city supply)', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			additions: [
				{ volume: 5, volumeUnit: 'gallon', abv: 0, label: 'Water' },
			],
		});

		expect(input.sources).toHaveLength(1); // only the charge source
		expect(input.destinations[0]!.volume).toBe(100); // water excluded
	});

	it('skips additions with zero or missing volume', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			additions: [
				{ sourceVessel: FEINTS_VESSEL, volume: 0, volumeUnit: 'gallon', abv: 60 },
				{ sourceVessel: FEINTS_VESSEL, volumeUnit: 'gallon', abv: 60 }, // no volume
			],
		});

		expect(input.sources).toHaveLength(1);
	});
});

describe('buildChargeTransferInput — empty/edge cases', () => {
	it('skips charge sources with zero volume or missing vesselId', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 0, volumeUnit: 'gallon' },
				{ vesselId: '', volume: 100, volumeUnit: 'gallon' },
			],
		});
		expect(input.sources).toHaveLength(0);
		expect(input.destinations[0]!.volume).toBe(0);
		expect(input.destinations[0]!.proof).toBe(0);
	});
});

describe('buildChargeTransferInput — grain-in correction', () => {
	// Worked example from PLAN: 100 gal fermenter, 8% ABV, 20 gal grain
	// displacement (e.g. 200 lb malted barley × 0.10 gal/lb). Without
	// correction, source PG = 100 × 16 / 100 = 16. With correction,
	// source PG = 80 × 16 / 100 = 12.8 — a 20% reduction reflecting the
	// liquid that actually carries the alcohol.

	it('stamps effectiveVolume on each source when grain-in context is provided', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			grainIn: { totalDisplacementGal: 20, totalBulkGal: 100 },
		});

		expect(input.sources).toHaveLength(1);
		expect(input.sources[0]!.volume).toBe(100);
		expect(input.sources[0]!.effectiveVolume).toBeCloseTo(80, 4);
		expect(input.sources[0]!.proof).toBe(16);
	});

	it('mirrors source effectiveVolume on the destination so PG balances', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			grainIn: { totalDisplacementGal: 20, totalBulkGal: 100 },
		});

		expect(input.destinations[0]!.volume).toBe(100);
		expect(input.destinations[0]!.effectiveVolume).toBeCloseTo(80, 4);
		// PG balance: source 12.8 == dest 12.8
		const totals = computeTotals(input);
		expect(totals.sourcePG).toBeCloseTo(12.8, 4);
		expect(totals.destPG).toBeCloseTo(12.8, 4);
		expect(() => validateInvariants(input, totals)).not.toThrow();
	});

	it('grain-out batch (no grainIn ctx) leaves effectiveVolume undefined — PG matches pre-fix bulk math', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
		});
		expect(input.sources[0]!.effectiveVolume).toBeUndefined();
		expect(input.destinations[0]!.effectiveVolume).toBeUndefined();
		const totals = computeTotals(input);
		expect(totals.sourcePG).toBe(16);
		expect(totals.destPG).toBe(16);
	});

	it('Spirit Run is downstream of grain — skip correction even if grainIn ctx supplied', () => {
		// The wash has been stripped already; bulk volume is pure liquid.
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Spirit Run',
			stillId: STILL,
			chargeAbv: 30,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 30, volumeUnit: 'gallon' },
			],
			grainIn: { totalDisplacementGal: 20, totalBulkGal: 30 },
		});
		expect(input.sources[0]!.effectiveVolume).toBeUndefined();
		expect(input.destinations[0]!.effectiveVolume).toBeUndefined();
	});

	it('zero displacement (e.g. all sugar-based recipe) skips correction', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			grainIn: { totalDisplacementGal: 0, totalBulkGal: 100 },
		});
		expect(input.sources[0]!.effectiveVolume).toBeUndefined();
		expect(input.destinations[0]!.effectiveVolume).toBeUndefined();
	});

	it('partial draw pro-rates displacement by bulk share', () => {
		// 50 gal drawn from a 100 gal batch with 20 gal total displacement →
		// share = 0.5 → line displacement = 10 → effective = 40
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 50, volumeUnit: 'gallon' },
			],
			grainIn: { totalDisplacementGal: 20, totalBulkGal: 100 },
		});
		expect(input.sources[0]!.effectiveVolume).toBeCloseTo(40, 4);
		expect(input.destinations[0]!.effectiveVolume).toBeCloseTo(40, 4);
	});

	it('additions (feints) are NOT corrected — pure liquid from a tank', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [
				{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' },
			],
			additions: [
				{ sourceVessel: FEINTS_VESSEL, volume: 10, volumeUnit: 'gallon', abv: 30 },
			],
			grainIn: { totalDisplacementGal: 20, totalBulkGal: 100 },
		});
		expect(input.sources).toHaveLength(2);
		// Charge source corrected; feints addition NOT corrected.
		expect(input.sources[0]!.effectiveVolume).toBeCloseTo(80, 4);
		expect(input.sources[1]!.effectiveVolume).toBeUndefined();
		// PG balance: 80*16/100 + 10*60/100 = 12.8 + 6 = 18.8 = dest effective × dest proof / 100
		const totals = computeTotals(input);
		expect(totals.sourcePG).toBeCloseTo(18.8, 4);
		expect(totals.destPG).toBeCloseTo(18.8, 4);
		expect(() => validateInvariants(input, totals)).not.toThrow();
	});
});

describe('buildChargeTransferInput — TTB account routing', () => {
	it('routes Stripping Run as production → production', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Stripping Run',
			stillId: STILL,
			chargeAbv: 8,
			chargeSources: [{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' }],
		});
		expect(input.ttbAccount).toEqual({ from: 'production', to: 'production' });
	});

	it('routes Spirit Run as production → production', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Spirit Run',
			stillId: STILL,
			chargeAbv: 30,
			chargeSources: [{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' }],
		});
		expect(input.ttbAccount).toEqual({ from: 'production', to: 'production' });
	});

	it('routes Distilling as production → production', () => {
		const input = buildChargeTransferInput({
			batchId: BATCH,
			stage: 'Distilling',
			stillId: STILL,
			chargeAbv: 30,
			chargeSources: [{ vesselId: FERMENTER, volume: 100, volumeUnit: 'gallon' }],
		});
		expect(input.ttbAccount).toEqual({ from: 'production', to: 'production' });
	});
});
