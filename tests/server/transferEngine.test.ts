import { describe, it, expect } from 'vitest';
import {
	computeTotals,
	validateInvariants,
	TransferEngineError,
} from '~/server/utils/transferEngineCore';
import type { TransferInput } from '~/types/interfaces/Transfer';

/**
 * Pure-logic tests for the Transfer engine's deterministic helpers.
 * Full transactional integration tests require mongodb-memory-server-replset
 * and are scheduled for Phase 11 (PLAN-PIPELINE-REVAMP.md §10.2).
 */

const baseInput: TransferInput = {
	type: 'stage_transition',
	batch: '000000000000000000000001',
	fromStage: 'Fermenting',
	toStage: 'Stripping Run',
	sources: [
		{ vessel: '000000000000000000000010', volume: 100, proof: 16 },
	],
	destinations: [
		{ vessel: '000000000000000000000020', volume: 100, proof: 16 },
	],
	loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
};

describe('computeTotals', () => {
	it('sums simple 1:1 transfer', () => {
		const totals = computeTotals(baseInput);
		expect(totals.totalSourceVolume).toBe(100);
		expect(totals.totalDestVolume).toBe(100);
		expect(totals.totalLossVolume).toBe(0);
		expect(totals.sourcePG).toBe(16);  // 100 × 16 / 100
		expect(totals.destPG).toBe(16);
		expect(totals.lossPG).toBe(0);
	});

	it('sums multi-source merge', () => {
		const totals = computeTotals({
			...baseInput,
			sources: [
				{ vessel: 'a', volume: 60, proof: 16 },
				{ vessel: 'b', volume: 40, proof: 16 },
			],
		});
		expect(totals.totalSourceVolume).toBe(100);
		expect(totals.sourcePG).toBe(16);
	});

	it('sums multi-dest split', () => {
		const totals = computeTotals({
			...baseInput,
			destinations: [
				{ vessel: 'a', volume: 30, proof: 16 },
				{ vessel: 'b', volume: 30, proof: 16 },
				{ vessel: 'c', volume: 40, proof: 16 },
			],
		});
		expect(totals.totalDestVolume).toBe(100);
		expect(totals.destPG).toBe(16);
	});

	it('accounts for distillation loss with different proof', () => {
		// 100 gal of 16 proof wash → 30 gal of 50 proof low wines + 70 gal foreshots/heads/tails
		const totals = computeTotals({
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Fermenting',
			toStage: 'Low Wines',
			sources: [{ vessel: 'still', volume: 100, proof: 16 }],
			destinations: [{ vessel: 'low_wines_tank', volume: 30, proof: 50 }],
			loss: {
				volume: 70,
				proof: (100 * 16 - 30 * 50) / 70,  // proof of the loss to balance PG
				reasonCode: 'foreshots_heads_tails',
			},
		});
		expect(totals.totalSourceVolume).toBe(100);
		expect(totals.totalDestVolume).toBe(30);
		expect(totals.totalLossVolume).toBe(70);
		expect(totals.sourcePG).toBe(16);
		expect(totals.destPG).toBe(15);
		expect(totals.lossPG).toBe(1);  // 16 - 15 = 1 PG lost
	});
});

/**
 * Helper: invoke validateInvariants and return the thrown error's `code` field.
 * Lets tests assert against the stable error code rather than the message text.
 */
function expectThrowsWithCode(input: TransferInput, expectedCode: string): void {
	let captured: any = null;
	try {
		validateInvariants(input, computeTotals(input));
	} catch (e) {
		captured = e;
	}
	expect(captured, `expected validateInvariants to throw with code ${expectedCode}`).toBeInstanceOf(TransferEngineError);
	expect((captured as TransferEngineError).code).toBe(expectedCode);
}

describe('validateInvariants', () => {
	it('passes a balanced 1:1 transfer', () => {
		expect(() => validateInvariants(baseInput, computeTotals(baseInput))).not.toThrow();
	});

	it('throws when volume reconciliation fails (too much output)', () => {
		expectThrowsWithCode({
			...baseInput,
			destinations: [{ vessel: 'a', volume: 110, proof: 16 }],
		}, 'INVARIANT_VIOLATION_VOLUME');
	});

	it('throws when volume reconciliation fails (unaccounted source)', () => {
		expectThrowsWithCode({
			...baseInput,
			destinations: [{ vessel: 'a', volume: 80, proof: 16 }],
		}, 'INVARIANT_VIOLATION_VOLUME');
	});

	it('passes when loss accounts for the gap', () => {
		const input: TransferInput = {
			...baseInput,
			destinations: [{ vessel: 'a', volume: 80, proof: 16 }],
			loss: { volume: 20, proof: 16, reasonCode: 'evaporation' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('throws when PG reconciliation fails', () => {
		expectThrowsWithCode({
			...baseInput,
			destinations: [{ vessel: 'a', volume: 100, proof: 50 }],
		}, 'INVARIANT_VIOLATION_PG');
	});

	it('throws when reasonCode is no_loss but loss > 0', () => {
		expectThrowsWithCode({
			...baseInput,
			destinations: [{ vessel: 'a', volume: 80, proof: 16 }],
			loss: { volume: 20, proof: 16, reasonCode: 'no_loss' },
		}, 'LOSS_INCONSISTENT');
	});

	it('throws when loss is 0 but reasonCode implies loss', () => {
		expectThrowsWithCode({
			...baseInput,
			loss: { volume: 0, proof: 0, reasonCode: 'evaporation' },
		}, 'LOSS_INCONSISTENT');
	});

	it('allows zero-loss attestation when all volume accounts for', () => {
		expect(() => validateInvariants(baseInput, computeTotals(baseInput))).not.toThrow();
	});

	it('throws on negative volumes', () => {
		expectThrowsWithCode({
			...baseInput,
			sources: [{ vessel: 'a', volume: -10, proof: 16 }],
		}, 'NEGATIVE_VOLUME');
	});

	it('throws on out-of-range proof', () => {
		expectThrowsWithCode({
			...baseInput,
			sources: [{ vessel: 'a', volume: 100, proof: 250 }],
		}, 'INVALID_PROOF');
	});

	it('throws on empty transfer (no source AND no destination)', () => {
		expectThrowsWithCode({
			...baseInput,
			sources: [],
			destinations: [],
		}, 'EMPTY_TRANSFER');
	});

	it('requires loss reasonCode', () => {
		expectThrowsWithCode({
			...baseInput,
			loss: { volume: 0, proof: 0, reasonCode: undefined as any },
		}, 'LOSS_REQUIRED');
	});
});

describe('initial-entry transfers (Upcoming → first stage)', () => {
	it('skips reconciliation when source is empty and fromStage is Upcoming', () => {
		const input: TransferInput = {
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Upcoming',
			toStage: 'Mashing',
			sources: [],  // no physical source — batch starts here
			destinations: [{ vessel: '000000000000000000000010', volume: 600, proof: 0 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('skips reconciliation when fromStage is null and sources empty', () => {
		const input: TransferInput = {
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: null,
			toStage: 'Mashing',
			sources: [],
			destinations: [{ vessel: '000000000000000000000010', volume: 600, proof: 0 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('still validates everything else (e.g. negative volumes)', () => {
		expectThrowsWithCode({
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Upcoming',
			toStage: 'Mashing',
			sources: [],
			destinations: [{ vessel: '000000000000000000000010', volume: -10, proof: 0 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		}, 'NEGATIVE_VOLUME');
	});

	it('skips reconciliation for tib_in (external receipt)', () => {
		const input: TransferInput = {
			type: 'tib_in',
			batch: '000000000000000000000001',
			fromStage: null,
			toStage: 'Storage',
			sources: [],  // external DSP — not on our books
			destinations: [{ vessel: '000000000000000000000010', volume: 100, proof: 100 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});
});

describe('distillation transfers (volume balance bypass)', () => {
	// 100 gal of wash @ 8% ABV (16 proof) = 16 PG charge.
	// Distillation concentrates this into ~30 gal of low wines @ ~26.7% ABV
	// (~53 proof) = ~16 PG output. Wine-gallon volume drops dramatically
	// because spent wash leaves as effluent — that material was never bonded.
	// PG should still balance (alcohol can't disappear without a loss line).

	it('Stripping Run → Low Wines passes when PG balances despite WG mismatch', () => {
		const input: TransferInput = {
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Low Wines',
			sources: [{ vessel: '000000000000000000000010', volume: 100, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 30, proof: 53.333333 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('Spirit Run → Storage passes when PG balances despite WG mismatch', () => {
		const input: TransferInput = {
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Spirit Run',
			toStage: 'Storage',
			sources: [{ vessel: '000000000000000000000010', volume: 30, proof: 60 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 12, proof: 150 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('still rejects PG mismatch on a distillation transfer (alcohol cannot vanish)', () => {
		expectThrowsWithCode({
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Low Wines',
			sources: [{ vessel: '000000000000000000000010', volume: 100, proof: 16 }],   // 16 PG in
			destinations: [{ vessel: '000000000000000000000020', volume: 30, proof: 20 }], // 6 PG out
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		}, 'INVARIANT_VIOLATION_PG');
	});

	it('non-distillation stages still enforce volume balance', () => {
		expectThrowsWithCode({
			type: 'stage_transition',
			batch: '000000000000000000000001',
			fromStage: 'Fermenting',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 400, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, proof: 16 }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		}, 'INVARIANT_VIOLATION_VOLUME');
	});
});

describe('grain-in correction (effectiveVolume)', () => {
	// Background: when the source batch is grain-in (whiskey/bourbon/rye), the
	// fermenter's bulk volume includes the grain bed. PG must be computed from
	// the *effective liquid volume* — bulk volume minus grain displacement —
	// otherwise production is overstated by ~10–20% on every grain-in batch.
	//
	// Worked example: 100 gal bulk @ 8% ABV (16 proof), 20 gal grain displacement
	//   pre-fix PG  = 100 × 16 / 100 = 16
	//   post-fix PG =  80 × 16 / 100 = 12.8

	it('computes PG from effectiveVolume when provided on the source', () => {
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 100, effectiveVolume: 80, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, effectiveVolume: 80, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		const totals = computeTotals(input);
		expect(totals.totalSourceVolume).toBe(100); // bulk preserved
		expect(totals.sourcePG).toBeCloseTo(12.8, 4);
		expect(totals.destPG).toBeCloseTo(12.8, 4);
	});

	it('grain-out batch (no effectiveVolume) computes PG from bulk — no drift', () => {
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 100, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		const totals = computeTotals(input);
		expect(totals.sourcePG).toBe(16);
		expect(totals.destPG).toBe(16);
	});

	it('passes PG invariant when source and dest both carry matched effectiveVolume', () => {
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 100, effectiveVolume: 80, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, effectiveVolume: 80, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).not.toThrow();
	});

	it('rejects effectiveVolume larger than bulk volume', () => {
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 80, effectiveVolume: 100, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 80, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).toThrow(/INVALID_EFFECTIVE_VOLUME|effectiveVolume/i);
	});

	it('rejects negative effectiveVolume', () => {
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 100, effectiveVolume: -10, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).toThrow();
	});

	it('source effectiveVolume only: PG mismatch surfaces when dest is uncorrected (the bug we are fixing in real flow)', () => {
		// This is the case BEFORE the destination side gets symmetric correction.
		// It should fail PG balance (12.8 vs 16) — proving the validator is
		// engaged when only one side is corrected.
		const input: TransferInput = {
			type: 'vessel_move',
			batch: '000000000000000000000001',
			fromStage: 'Stripping Run',
			toStage: 'Stripping Run',
			sources: [{ vessel: '000000000000000000000010', volume: 100, effectiveVolume: 80, proof: 16 }],
			destinations: [{ vessel: '000000000000000000000020', volume: 100, proof: 16, stage: 'Stripping Run' }],
			loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		};
		expect(() => validateInvariants(input, computeTotals(input))).toThrow(/PG reconciliation failed/i);
	});
});

describe('TransferEngineError', () => {
	it('carries code, status, and details', () => {
		const err = new TransferEngineError('TEST_CODE', 'test message', 418, { foo: 'bar' });
		expect(err.code).toBe('TEST_CODE');
		expect(err.status).toBe(418);
		expect(err.details).toEqual({ foo: 'bar' });
		expect(err.message).toBe('test message');
		expect(err.name).toBe('TransferEngineError');
	});

	it('defaults to status 400', () => {
		const err = new TransferEngineError('X', 'msg');
		expect(err.status).toBe(400);
	});
});
