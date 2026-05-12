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
