import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransferForm } from '~/composables/useTransferForm';

/**
 * Tests for the Phase 5 form composable.
 *
 * Focus: state derivation, mutation helpers, reconciliation math, TTB account
 * auto-routing, build() payload shape. The submit() path is not exercised
 * here — that requires a $fetch mock and is covered by the engine tests
 * (tests/server/transferEngine.test.ts).
 */

describe('useTransferForm', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.stubGlobal('$fetch', vi.fn());
	});

	describe('initial state', () => {
		it('defaults to stage_transition with no batch and empty source/dest arrays', () => {
			const f = useTransferForm();
			expect(f.type.value).toBe('stage_transition');
			expect(f.batch.value).toBe('');
			expect(f.fromStage.value).toBeNull();
			expect(f.toStage.value).toBeNull();
			expect(f.sources.value).toEqual([]);
			expect(f.destinations.value).toEqual([]);
			expect(f.loss.value).toEqual({ volume: 0, proof: 0, reasonCode: 'no_loss' });
		});

		it('seeds from initialState', () => {
			const f = useTransferForm({
				type: 'split',
				batch: 'b1',
				fromStage: 'Fermenting',
				toStage: 'Stripping Run',
				sources: [{ vessel: 'v1', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'v2', volume: 100, proof: 16 }],
			});
			expect(f.type.value).toBe('split');
			expect(f.batch.value).toBe('b1');
			expect(f.fromStage.value).toBe('Fermenting');
			expect(f.toStage.value).toBe('Stripping Run');
			expect(f.sources.value).toHaveLength(1);
			expect(f.destinations.value).toHaveLength(1);
		});

		it('deep-clones initial state so seed objects are not shared', () => {
			const seed = {
				sources: [{ vessel: 'v1', volume: 100, proof: 16 }],
			} as const;
			const f = useTransferForm(seed);
			f.updateSource(0, { volume: 999 });
			expect(seed.sources[0].volume).toBe(100);
		});
	});

	describe('source mutations', () => {
		it('addSource appends a blank row', () => {
			const f = useTransferForm();
			f.addSource();
			expect(f.sources.value).toHaveLength(1);
			expect(f.sources.value[0]).toEqual({ vessel: '', volume: 0, proof: 0 });
		});

		it('addSource accepts a seed', () => {
			const f = useTransferForm();
			f.addSource({ vessel: 'vA', volume: 50, proof: 80 });
			expect(f.sources.value[0]).toEqual({ vessel: 'vA', volume: 50, proof: 80 });
		});

		it('updateSource patches the row at the given index', () => {
			const f = useTransferForm({ sources: [{ vessel: 'v1', volume: 100, proof: 16 }] });
			f.updateSource(0, { volume: 75 });
			expect(f.sources.value[0]).toEqual({ vessel: 'v1', volume: 75, proof: 16 });
		});

		it('removeSource drops the row at the given index', () => {
			const f = useTransferForm({
				sources: [
					{ vessel: 'a', volume: 1, proof: 16 },
					{ vessel: 'b', volume: 2, proof: 16 },
				],
			});
			f.removeSource(0);
			expect(f.sources.value).toHaveLength(1);
			expect(f.sources.value[0].vessel).toBe('b');
		});

		it('replaces array reference (not mutate-in-place) for reactivity', () => {
			const f = useTransferForm({ sources: [{ vessel: 'a', volume: 1, proof: 16 }] });
			const before = f.sources.value;
			f.addSource();
			expect(f.sources.value).not.toBe(before);
		});
	});

	describe('destination mutations', () => {
		it('addDestination uses toStage as the default stage', () => {
			const f = useTransferForm({ toStage: 'Storage' });
			f.addDestination();
			expect(f.destinations.value[0].stage).toBe('Storage');
		});

		it('removeDestination + updateDestination work', () => {
			const f = useTransferForm({
				destinations: [
					{ vessel: 'a', volume: 1, proof: 16 },
					{ vessel: 'b', volume: 2, proof: 16 },
				],
			});
			f.updateDestination(1, { volume: 99 });
			expect(f.destinations.value[1].volume).toBe(99);
			f.removeDestination(0);
			expect(f.destinations.value).toHaveLength(1);
		});
	});

	describe('volume + PG totals', () => {
		it('sums multi-source volumes and PGs', () => {
			const f = useTransferForm({
				sources: [
					{ vessel: 'a', volume: 60, proof: 100 },
					{ vessel: 'b', volume: 40, proof: 50 },
				],
			});
			expect(f.totalSourceVolume.value).toBe(100);
			// PG = volume * proof / 100
			// 60 * 100 / 100 = 60; 40 * 50 / 100 = 20 → 80
			expect(f.sourcePG.value).toBeCloseTo(80, 5);
		});

		it('accumulates loss volume + PG', () => {
			const f = useTransferForm({
				loss: { volume: 5, proof: 80, reasonCode: 'evaporation' },
			});
			expect(f.totalLossVolume.value).toBe(5);
			// PG = 5 * 80 / 100 = 4
			expect(f.lossPG.value).toBeCloseTo(4, 5);
		});

		it('reconciliationVarianceWG = source - dest - loss', () => {
			const f = useTransferForm({
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 90, proof: 16 }],
				loss: { volume: 5, proof: 16, reasonCode: 'evaporation' },
			});
			expect(f.reconciliationVarianceWG.value).toBeCloseTo(5, 4);
		});
	});

	describe('balanced computed', () => {
		it('balanced when source = dest + loss for both WG and PG', () => {
			const f = useTransferForm({
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 16 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.balanced.value).toBe(true);
		});

		it('unbalanced when WG variance exceeds epsilon', () => {
			const f = useTransferForm({
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 95, proof: 16 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.balanced.value).toBe(false);
		});

		it('balanced for initial-entry (Upcoming → first stage with no sources)', () => {
			const f = useTransferForm({
				type: 'stage_transition',
				fromStage: 'Upcoming',
				toStage: 'Mashing',
				sources: [],
				destinations: [{ vessel: 'b', volume: 600, proof: 0 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.balanced.value).toBe(true);
		});

		it('balanced for tib_in with no sources', () => {
			const f = useTransferForm({
				type: 'tib_in',
				toStage: 'Storage',
				sources: [],
				destinations: [{ vessel: 'tank', volume: 50, proof: 100 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.balanced.value).toBe(true);
		});
	});

	describe('lossLineValid', () => {
		it('valid when reasonCode=no_loss and volume=0', () => {
			const f = useTransferForm();
			expect(f.lossLineValid.value).toBe(true);
		});

		it('invalid when reasonCode=no_loss but volume>0', () => {
			const f = useTransferForm({
				loss: { volume: 5, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.lossLineValid.value).toBe(false);
		});

		it('invalid when a real loss reason is selected but volume=0', () => {
			const f = useTransferForm({
				loss: { volume: 0, proof: 0, reasonCode: 'evaporation' },
			});
			expect(f.lossLineValid.value).toBe(false);
		});

		it('measurement_variance is allowed at zero volume (rounding)', () => {
			const f = useTransferForm({
				loss: { volume: 0, proof: 0, reasonCode: 'measurement_variance' },
			});
			expect(f.lossLineValid.value).toBe(true);
		});
	});

	describe('canSubmit gate', () => {
		it('false without a batch', () => {
			const f = useTransferForm({
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 16 }],
			});
			expect(f.canSubmit.value).toBe(false);
		});

		it('false without any source or destination', () => {
			const f = useTransferForm({ batch: 'b1' });
			expect(f.canSubmit.value).toBe(false);
		});

		it('true for a balanced 1:1 stage transition', () => {
			const f = useTransferForm({
				type: 'stage_transition',
				batch: 'b1',
				fromStage: 'Fermenting',
				toStage: 'Stripping Run',
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 16 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.canSubmit.value).toBe(true);
		});

		it('false when reconciliation breaks', () => {
			const f = useTransferForm({
				batch: 'b1',
				sources: [{ vessel: 'a', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'b', volume: 90, proof: 16 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
			});
			expect(f.canSubmit.value).toBe(false);
		});
	});

	describe('TTB account auto-routing', () => {
		it('seeds ttbAccountFrom + ttbAccountTo from initial stages', () => {
			const f = useTransferForm({
				fromStage: 'Fermenting',
				toStage: 'Storage',
			});
			expect(f.ttbAccountFrom.value).toBe('production');
			expect(f.ttbAccountTo.value).toBe('storage');
		});

		it('clears ttbAccountFrom when fromStage becomes Upcoming', async () => {
			const f = useTransferForm({ fromStage: 'Fermenting' });
			expect(f.ttbAccountFrom.value).toBe('production');
			f.fromStage.value = 'Upcoming';
			await nextTick();
			expect(f.ttbAccountFrom.value).toBeNull();
		});

		it('updates ttbAccountTo when toStage changes', async () => {
			const f = useTransferForm({ toStage: 'Mashing' });
			expect(f.ttbAccountTo.value).toBe('production');
			f.toStage.value = 'Bottled';
			await nextTick();
			expect(f.ttbAccountTo.value).toBe('tax_paid');
		});
	});

	describe('build()', () => {
		it('returns a TransferInput-shaped payload', () => {
			const f = useTransferForm({
				type: 'stage_transition',
				batch: 'b1',
				fromStage: 'Fermenting',
				toStage: 'Stripping Run',
				sources: [{ vessel: 'v1', volume: 100, proof: 16 }],
				destinations: [{ vessel: 'v2', volume: 100, proof: 16 }],
				loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
				notes: 'first run',
			});
			const payload = f.build();
			expect(payload).toMatchObject({
				type: 'stage_transition',
				batch: 'b1',
				fromStage: 'Fermenting',
				toStage: 'Stripping Run',
				notes: 'first run',
				ttbAccount: { from: 'production', to: 'production' },
			});
			expect(payload.sources).toHaveLength(1);
			expect(payload.destinations).toHaveLength(1);
		});

		it('omits notes when blank', () => {
			const f = useTransferForm({ batch: 'b1' });
			expect(f.build().notes).toBeUndefined();
		});
	});

	describe('reset()', () => {
		it('clears state to defaults when called with no seed', () => {
			const f = useTransferForm({
				batch: 'b1',
				sources: [{ vessel: 'v1', volume: 100, proof: 16 }],
				notes: 'hello',
			});
			f.reset();
			expect(f.batch.value).toBe('');
			expect(f.sources.value).toEqual([]);
			expect(f.notes.value).toBe('');
			expect(f.loss.value).toEqual({ volume: 0, proof: 0, reasonCode: 'no_loss' });
		});

		it('reseeds with new initial state', () => {
			const f = useTransferForm();
			f.reset({
				batch: 'b2',
				type: 'split',
				fromStage: 'Spirit Run',
				toStage: 'Barrel Aging',
			});
			expect(f.batch.value).toBe('b2');
			expect(f.type.value).toBe('split');
			expect(f.fromStage.value).toBe('Spirit Run');
			expect(f.toStage.value).toBe('Barrel Aging');
		});
	});
});
