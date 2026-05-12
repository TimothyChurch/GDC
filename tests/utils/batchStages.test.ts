import { describe, it, expect } from 'vitest';
import { getStage } from '~/utils/batchStages';

const baseBatch: any = {
	stages: {
		mashing: { startedAt: '2026-01-01', vessel: 'mashTun1' },
		fermenting: { startedAt: '2026-01-03', vessel: 'fermenter1' },
		barrelAging: { entry: { date: '2026-02-01', volume: 50, volumeUnit: 'gal', abv: 60 } },
	},
};

describe('getStage', () => {
	it('returns the stage object for a known key', () => {
		const stage = getStage(baseBatch, 'mashing');
		expect(stage).toEqual({ startedAt: '2026-01-01', vessel: 'mashTun1' });
	});

	it('returns undefined for a stage that has no data', () => {
		expect(getStage(baseBatch, 'distilling')).toBeUndefined();
	});

	it('returns undefined for null/undefined batch', () => {
		expect(getStage(null, 'mashing')).toBeUndefined();
		expect(getStage(undefined, 'mashing')).toBeUndefined();
	});

	it('returns undefined when batch has no stages', () => {
		expect(getStage({} as any, 'mashing')).toBeUndefined();
	});

	it('supports dynamic string keys (e.g. from STAGE_KEY_MAP)', () => {
		const dynamicKey = 'fermenting';
		const stage = getStage(baseBatch, dynamicKey);
		expect(stage).toBeDefined();
		expect((stage as any).vessel).toBe('fermenter1');
	});

	it('returns undefined for an unknown dynamic key', () => {
		expect(getStage(baseBatch, 'totallyMadeUpStage')).toBeUndefined();
	});

	it('preserves nested data (stage objects are not cloned)', () => {
		const stage = getStage(baseBatch, 'barrelAging');
		expect(stage?.entry?.volume).toBe(50);
		expect(stage?.entry?.abv).toBe(60);
	});
});
