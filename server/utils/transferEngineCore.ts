/**
 * Pure-logic helpers for the Transfer Engine.
 *
 * Extracted from transferEngine.ts so they can be unit-tested without pulling
 * in Mongoose models (which require Nuxt's `#nuxt/mongoose` resolver and a
 * MongoDB connection).
 *
 * No I/O, no DB, no Vue, no Nuxt — just deterministic functions.
 */

import {
	proofGallons,
	isVolumeBalanced,
	isPGBalanced,
	RECONCILIATION_EPSILON,
} from '../../composables/transferDefinitions';
import type { TransferInput } from '../../types/interfaces/Transfer';
import { roundVolume } from './unitConverter';

// ─── Errors ───────────────────────────────────────────────────────────────────

export class TransferEngineError extends Error {
	readonly code: string;
	readonly status: number;
	readonly details?: unknown;
	constructor(code: string, message: string, status = 400, details?: unknown) {
		super(message);
		this.name = 'TransferEngineError';
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

// ─── Totals ───────────────────────────────────────────────────────────────────

export interface Totals {
	totalSourceVolume: number;
	totalDestVolume: number;
	totalLossVolume: number;
	sourcePG: number;
	destPG: number;
	lossPG: number;
}

/**
 * Volume to use for PG calculation. When the caller has supplied an
 * `effectiveVolume` (the grain-in-corrected liquid volume), that takes
 * precedence over the bulk `volume` field. Undefined / non-finite falls back
 * to the bulk volume, which keeps grain-out and downstream transfers
 * mathematically identical to the pre-grain-in-correction behavior.
 */
function pgVolume(line: { volume?: number; effectiveVolume?: number }): number {
	const ev = line.effectiveVolume;
	if (typeof ev === 'number' && Number.isFinite(ev) && ev >= 0) return ev;
	return line.volume || 0;
}

export function computeTotals(input: TransferInput): Totals {
	let totalSourceVolume = 0;
	let totalDestVolume = 0;
	let totalLossVolume = input.loss?.volume || 0;
	let sourcePG = 0;
	let destPG = 0;
	let lossPG = 0;

	for (const s of input.sources) {
		// Wine-gallon totals track BULK volume (vessel slot decrement uses bulk).
		totalSourceVolume += s.volume || 0;
		// PG is computed from the effective liquid volume when supplied.
		sourcePG += proofGallons(pgVolume(s), s.proof || 0);
	}
	for (const d of input.destinations) {
		totalDestVolume += d.volume || 0;
		destPG += proofGallons(pgVolume(d), d.proof || 0);
	}
	if (input.loss) {
		lossPG = proofGallons(pgVolume(input.loss), input.loss.proof || 0);
	}

	return {
		totalSourceVolume: roundVolume(totalSourceVolume),
		totalDestVolume: roundVolume(totalDestVolume),
		totalLossVolume: roundVolume(totalLossVolume),
		sourcePG: roundVolume(sourcePG),
		destPG: roundVolume(destPG),
		lossPG: roundVolume(lossPG),
	};
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Some transfer types create or destroy liquid rather than move it:
 *   - `tib_in` and `stage_transition` from `Upcoming`: liquid enters the system
 *   - `tib_out` to an external DSP: leaves our books
 *   - `tax_paid_withdrawal` to a virtual destination (null vessel)
 *
 * For these, the source-dest-loss balance check is not applicable because one
 * side of the equation is conceptually outside the bond.
 */
function bypassesBalanceCheck(input: TransferInput): boolean {
	// Initial entry: batch is being mashed/fermented for the first time.
	if (
		(input.fromStage === 'Upcoming' || input.fromStage == null)
		&& input.sources.length === 0
		&& input.destinations.length > 0
	) {
		return true;
	}
	// Inbound from another DSP — we receive without a source on our books.
	if (input.type === 'tib_in' && input.sources.length === 0) {
		return true;
	}
	return false;
}

/**
 * Distillation transfers concentrate alcohol: the wine-gallon volume legitimately
 * drops because spent wash (water + grain residue) is removed as effluent — that
 * material was never bonded liquid in the TTB sense. PG must still balance
 * (any alcohol that disappears requires a loss attestation), but wine-gallon
 * mismatch is expected.
 *
 * Applies when the source side is a still (fromStage in distillation stages).
 */
const DISTILLATION_FROM_STAGES = new Set(['Stripping Run', 'Spirit Run', 'Distilling']);

export function bypassesVolumeBalance(input: TransferInput): boolean {
	if (bypassesBalanceCheck(input)) return true;
	return !!input.fromStage && DISTILLATION_FROM_STAGES.has(input.fromStage);
}

export function validateInvariants(input: TransferInput, totals: Totals): void {
	// Order matters — check structural problems first so callers get actionable errors,
	// then loss-line consistency, then the math reconciliation last.

	// 1. Structural: at least one source or destination
	if (input.sources.length === 0 && input.destinations.length === 0) {
		throw new TransferEngineError('EMPTY_TRANSFER', 'Transfer must have at least one source or destination');
	}

	// 2. Loss line presence + reasonCode
	if (!input.loss) {
		throw new TransferEngineError(
			'LOSS_REQUIRED',
			'Loss line is required. Use reasonCode="no_loss" if zero loss.',
		);
	}
	if (!input.loss.reasonCode) {
		throw new TransferEngineError(
			'LOSS_REQUIRED',
			'Loss reasonCode is required. Use "no_loss" for zero-loss attestation.',
		);
	}

	// 3. Per-line value sanity (volume sign, proof range)
	for (const s of input.sources) {
		if (s.volume < 0) throw new TransferEngineError('NEGATIVE_VOLUME', 'Source volume cannot be negative');
		if (s.proof < 0 || s.proof > 200) throw new TransferEngineError('INVALID_PROOF', `Source proof must be 0–200, got ${s.proof}`);
		if (typeof s.effectiveVolume === 'number') {
			if (s.effectiveVolume < 0) {
				throw new TransferEngineError('NEGATIVE_VOLUME', 'Source effectiveVolume cannot be negative');
			}
			if (s.effectiveVolume > s.volume + RECONCILIATION_EPSILON) {
				throw new TransferEngineError(
					'INVALID_EFFECTIVE_VOLUME',
					`Source effectiveVolume ${s.effectiveVolume} cannot exceed bulk volume ${s.volume}`,
				);
			}
		}
	}
	for (const d of input.destinations) {
		if (d.volume < 0) throw new TransferEngineError('NEGATIVE_VOLUME', 'Destination volume cannot be negative');
		if (d.proof < 0 || d.proof > 200) throw new TransferEngineError('INVALID_PROOF', `Destination proof must be 0–200, got ${d.proof}`);
		if (typeof d.effectiveVolume === 'number') {
			if (d.effectiveVolume < 0) {
				throw new TransferEngineError('NEGATIVE_VOLUME', 'Destination effectiveVolume cannot be negative');
			}
			if (d.effectiveVolume > d.volume + RECONCILIATION_EPSILON) {
				throw new TransferEngineError(
					'INVALID_EFFECTIVE_VOLUME',
					`Destination effectiveVolume ${d.effectiveVolume} cannot exceed bulk volume ${d.volume}`,
				);
			}
		}
	}
	if (input.loss.volume < 0) throw new TransferEngineError('NEGATIVE_VOLUME', 'Loss volume cannot be negative');
	if (typeof input.loss.effectiveVolume === 'number') {
		if (input.loss.effectiveVolume < 0) {
			throw new TransferEngineError('NEGATIVE_VOLUME', 'Loss effectiveVolume cannot be negative');
		}
		if (input.loss.effectiveVolume > input.loss.volume + RECONCILIATION_EPSILON) {
			throw new TransferEngineError(
				'INVALID_EFFECTIVE_VOLUME',
				`Loss effectiveVolume ${input.loss.effectiveVolume} cannot exceed bulk loss volume ${input.loss.volume}`,
			);
		}
	}

	// 4. Loss-line / reasonCode consistency
	if (input.loss.volume > 0 && input.loss.reasonCode === 'no_loss') {
		throw new TransferEngineError(
			'LOSS_INCONSISTENT',
			'Cannot use reasonCode="no_loss" when loss volume is greater than 0.',
		);
	}
	if (input.loss.volume === 0 && input.loss.reasonCode !== 'no_loss' && input.loss.reasonCode !== 'measurement_variance') {
		throw new TransferEngineError(
			'LOSS_INCONSISTENT',
			`Loss volume is 0 but reasonCode="${input.loss.reasonCode}" implies a non-zero loss. Use "no_loss" instead.`,
		);
	}

	// 5. Math reconciliation
	//    Volume balance is skipped for create/destroy operations (e.g. Upcoming→Mashing)
	//    AND for distillation transfers (Stripping/Spirit Run/Distilling) where the
	//    spent wash isn't bonded liquid. PG balance still applies.
	if (!bypassesVolumeBalance(input)) {
		if (!isVolumeBalanced(totals.totalSourceVolume, totals.totalDestVolume, totals.totalLossVolume)) {
			throw new TransferEngineError(
				'INVARIANT_VIOLATION_VOLUME',
				`Volume reconciliation failed: source ${totals.totalSourceVolume} ≠ dest ${totals.totalDestVolume} + loss ${totals.totalLossVolume} (epsilon ${RECONCILIATION_EPSILON})`,
				400,
				{ totals },
			);
		}
	}
	if (!bypassesBalanceCheck(input)) {
		if (!isPGBalanced(totals.sourcePG, totals.destPG, totals.lossPG)) {
			throw new TransferEngineError(
				'INVARIANT_VIOLATION_PG',
				`PG reconciliation failed: source ${totals.sourcePG} ≠ dest ${totals.destPG} + loss ${totals.lossPG}`,
				400,
				{ totals },
			);
		}
	}
}
