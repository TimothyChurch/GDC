import mongoose from 'mongoose';
import type { ClientSession } from 'mongoose';
import { Transfer } from '../models/transfer.schema';
import { Batch } from '../models/batch.schema';
import { Vessel } from '../models/vessel.schema';
import { ReportingPeriod } from '../models/reportingPeriod.schema';
import {
	getCurrentReportingPeriod,
	proofGallons,
	RECONCILIATION_EPSILON,
	STAGE_TO_TTB_ACCOUNT,
	type TransferType,
	type LossReasonCode,
} from '../../composables/transferDefinitions';
import type { TransferInput } from '../../types/interfaces/Transfer';
import { roundVolume } from './unitConverter';
import {
	computeTotals,
	validateInvariants,
	TransferEngineError,
	type Totals,
} from './transferEngineCore';
import { applyGrainInCorrection } from './grainInCorrection';

/**
 * The Transfer Engine — single atomic primitive for moving liquid.
 *
 * Every stage advance, vessel move, split, merge, withdrawal, sample,
 * destruction, or TIB transfer goes through `executeTransfer()`. Inside it,
 * a MongoDB multi-document transaction guarantees that source vessel(s),
 * destination vessel(s), the batch's denormalized cache, and the Transfer
 * record all commit together — or none of them do.
 *
 * Fixes Bugs 1.1, 1.2, 1.3, 1.4, 1.5, 12.1 from PLAN-PIPELINE-REVAMP.md §4.1.
 *
 * REQUIREMENTS:
 *   - MongoDB must be a replica set (Atlas is by default; local dev may
 *     need `mongodb-memory-server-replset` or rs.initiate()).
 *   - All input volumes are wine gallons; all proofs are 2 × ABV%.
 *   - PG is computed (volume × proof / 100), never stored on input side.
 */

// ─── Public options ───────────────────────────────────────────────────────────

export interface ExecuteTransferOptions {
	/** Provide an existing session to nest in a larger transaction. If absent, a new session is created. */
	session?: ClientSession;
	/** Recorded on the Transfer doc for audit. */
	createdBy?: { user?: string; name?: string };
	/** Override the reporting period ('YYYY-MM'). Default: current period. */
	reportingPeriod?: string;
	/** For migrations only — skips period-locked check. NEVER use in API routes. */
	bypassPeriodLock?: boolean;
	/** When set, decrement source vessels even if they don't currently show this batch. Used for migrations and rare manual repairs. Default false. */
	allowVesselSlotCreate?: boolean;
}

export interface ExecuteTransferResult {
	transfer: any;       // Mongoose doc
	batch: any;
	updatedVessels: any[];
}

// ─── Period lock check ────────────────────────────────────────────────────────

async function ensurePeriodOpen(period: string, session: ClientSession): Promise<void> {
	const doc = await ReportingPeriod.findOne({ period }).session(session);
	if (!doc) {
		// Period record doesn't exist yet — auto-create as 'open'.
		await ReportingPeriod.create([{ period, status: 'open' }], { session });
		return;
	}
	if (doc.status !== 'open') {
		throw new TransferEngineError(
			'PERIOD_LOCKED',
			`Reporting period ${period} is ${doc.status}. Create a reversal in the current period instead.`,
			409,
		);
	}
}

// ─── Source-side: decrement vessel contents ───────────────────────────────────

async function decrementVesselSlot(
	vesselId: string,
	batchId: string,
	volumeWG: number,
	transferId: mongoose.Types.ObjectId,
	session: ClientSession,
	allowSlotCreate: boolean,
): Promise<void> {
	const vessel = await Vessel.findById(vesselId).session(session);
	if (!vessel) {
		throw new TransferEngineError('VESSEL_NOT_FOUND', `Source vessel ${vesselId} not found`, 404);
	}

	const contents = (vessel.contents as any[]) || [];
	const slotIdx = contents.findIndex(c => String(c.batch) === String(batchId));

	if (slotIdx === -1) {
		if (!allowSlotCreate) {
			throw new TransferEngineError(
				'SOURCE_SLOT_MISSING',
				`Vessel ${vessel.name} (${vesselId}) does not contain batch ${batchId}`,
				409,
			);
		}
		return;
	}

	const slot = contents[slotIdx];
	const slotVolume = slot.volume || 0;

	if (slotVolume < volumeWG - RECONCILIATION_EPSILON) {
		throw new TransferEngineError(
			'INSUFFICIENT_VOLUME',
			`Vessel ${vessel.name} contains ${slotVolume} gal of batch but transfer requests ${volumeWG} gal`,
			409,
			{ vesselId, batchId, available: slotVolume, requested: volumeWG },
		);
	}

	const newVolume = roundVolume(slotVolume - volumeWG);

	if (newVolume <= RECONCILIATION_EPSILON) {
		// Slot drained — capture cooperage history if this is a barrel.
		if (vessel.type === 'Barrel') {
			const batchDoc = await Batch.findById(batchId).populate('recipe', 'name').session(session);
			(vessel.previousContentsHistory as any[]) ||= [];
			(vessel.previousContentsHistory as any[]).push({
				batchRecipeName: (batchDoc?.recipe as any)?.name || undefined,
				batchId: batchId,
				departedAt: new Date(),
				transferId,
			});
			vessel.previousContents = (batchDoc?.recipe as any)?.name || vessel.previousContents;
		}
		contents.splice(slotIdx, 1);
	} else {
		slot.volume = newVolume;
		slot.lastTransferId = transferId;
	}

	vessel.contents = contents as any;
	(vessel as any).contentsVersion = ((vessel as any).contentsVersion || 0) + 1;
	(vessel as any).cachedAt = new Date();
	recalculateVesselCurrent(vessel);
	await vessel.save({ session });
}

// ─── Destination-side: increment vessel contents ──────────────────────────────

async function incrementVesselSlot(
	vesselId: string,
	batchId: string,
	volumeWG: number,
	proof: number,
	transferId: mongoose.Types.ObjectId,
	session: ClientSession,
): Promise<void> {
	const vessel = await Vessel.findById(vesselId).session(session);
	if (!vessel) {
		throw new TransferEngineError('VESSEL_NOT_FOUND', `Destination vessel ${vesselId} not found`, 404);
	}

	const contents = ((vessel.contents as any[]) || []).slice();
	const existingIdx = contents.findIndex(c => String(c.batch) === String(batchId));

	const abv = proof / 2;
	const now = new Date();

	if (existingIdx >= 0) {
		// Merge: volume-weighted average proof.
		const existing = contents[existingIdx];
		const existingVol = existing.volume || 0;
		const existingProof = existing.proof !== undefined
			? existing.proof
			: (existing.abv || 0) * 2;
		const newVol = roundVolume(existingVol + volumeWG);
		const newProof = newVol > 0
			? ((existingVol * existingProof) + (volumeWG * proof)) / newVol
			: proof;
		existing.volume = newVol;
		existing.volumeUnit = existing.volumeUnit || 'gallon';
		existing.proof = roundVolume(newProof);
		existing.abv = roundVolume(newProof / 2);
		existing.lastTransferId = transferId;
	} else {
		contents.push({
			batch: batchId,
			volume: roundVolume(volumeWG),
			volumeUnit: 'gallon',
			abv: roundVolume(abv),
			proof: roundVolume(proof),
			value: 0,
			addedAt: now,
			lastTransferId: transferId,
		});
	}

	vessel.contents = contents as any;
	(vessel as any).contentsVersion = ((vessel as any).contentsVersion || 0) + 1;
	(vessel as any).cachedAt = now;
	recalculateVesselCurrent(vessel);
	await vessel.save({ session });
}

// ─── Recompute denormalized vessel.current aggregate ──────────────────────────

function recalculateVesselCurrent(vessel: any): void {
	const contents = (vessel.contents || []) as any[];
	if (contents.length === 0) {
		vessel.current = { volume: 0, volumeUnit: vessel.stats?.volumeUnit || 'gallon', abv: 0, value: 0 };
		return;
	}
	let totalVol = 0;
	let abvWeighted = 0;
	let totalValue = 0;
	for (const slot of contents) {
		const vol = slot.volume || 0;
		const abv = slot.abv || (slot.proof ? slot.proof / 2 : 0);
		totalVol += vol;
		abvWeighted += vol * abv;
		totalValue += slot.value || 0;
	}
	vessel.current = {
		volume: roundVolume(totalVol),
		volumeUnit: vessel.stats?.volumeUnit || 'gallon',
		abv: totalVol > 0 ? roundVolume(abvWeighted / totalVol) : 0,
		value: roundVolume(totalValue),
	};
}

// ─── Apply transfer to batch's denormalized cache ─────────────────────────────

async function applyTransferToBatch(
	batchId: string,
	input: TransferInput,
	totals: Totals,
	transferType: TransferType,
	session: ClientSession,
): Promise<any> {
	const batch = await Batch.findById(batchId).session(session);
	if (!batch) {
		throw new TransferEngineError('BATCH_NOT_FOUND', `Batch ${batchId} not found`, 404);
	}

	// stageVolumes / stageProofs are stored as Mongoose Maps. Mutate in place.
	const stageVolumes = (batch.stageVolumes ||= new Map()) as Map<string, number>;
	const stageProofs = ((batch as any).stageProofs ||= new Map()) as Map<string, number>;

	// Decrement source stage(s).
	// For "initial entry" (Upcoming → first stage with sources=[]), there's no
	// physical source vessel, so totalSourceVolume is 0 — but the planned volume
	// in stageVolumes[fromStage] still needs to be drawn down. Fall back to the
	// destination total in that case so Upcoming reflects what was committed.
	const isInitialEntry =
		(input.fromStage === 'Upcoming' || input.fromStage == null)
		&& input.sources.length === 0
		&& input.destinations.length > 0;
	const sourceDecrement = isInitialEntry
		? totals.totalDestVolume + (input.loss?.volume || 0)
		: totals.totalSourceVolume;
	if (input.fromStage && sourceDecrement > 0) {
		const current = stageVolumes.get(input.fromStage) || 0;
		const newVol = roundVolume(current - sourceDecrement);
		if (newVol <= RECONCILIATION_EPSILON) {
			stageVolumes.delete(input.fromStage);
			stageProofs.delete(input.fromStage);
			const stageKey = stageKeyFor(input.fromStage);
			if (stageKey && (batch.stages as any)?.[stageKey]) {
				if (transferType === 'reversal') {
					// We're reverting out of this stage, not finishing it. Clear
					// any prior completedAt so the UI doesn't show a stale checkmark.
					delete (batch.stages as any)[stageKey].completedAt;
				} else {
					(batch.stages as any)[stageKey].completedAt = new Date();
				}
			}
		} else {
			stageVolumes.set(input.fromStage, newVol);
			// Proof unchanged — same liquid, less of it
		}
	}

	// Increment destination stage(s) — group by toStage in case of split-with-stage.
	// Tax-paid withdrawals are virtual exits from bond; they should NOT inflate any
	// destination stage cache (the spirit has left the DSP's records). Source drain
	// alone is what flips the batch to status='completed' below.
	const stageInflow = new Map<string, { volume: number; pg: number }>();
	if (transferType !== 'tax_paid_withdrawal') {
		for (const d of input.destinations) {
			const toStage = d.stage || input.toStage;
			if (!toStage) continue;
			const existing = stageInflow.get(toStage) || { volume: 0, pg: 0 };
			existing.volume += d.volume;
			// PG uses effectiveVolume when supplied so grain-in destinations
			// (e.g. mash → fermenter) don't overstate the receiving stage's PG.
			const ev = (typeof d.effectiveVolume === 'number' && Number.isFinite(d.effectiveVolume))
				? d.effectiveVolume
				: d.volume;
			existing.pg += proofGallons(ev, d.proof);
			stageInflow.set(toStage, existing);
		}
	}

	for (const [stageName, inflow] of stageInflow) {
		const currentVol = stageVolumes.get(stageName) || 0;
		const currentProof = stageProofs.get(stageName) || 0;
		const currentPG = currentVol * currentProof / 100;
		const newVol = roundVolume(currentVol + inflow.volume);
		const newPG = currentPG + inflow.pg;
		const newProof = newVol > 0 ? roundVolume((newPG / newVol) * 100) : 0;
		stageVolumes.set(stageName, newVol);
		stageProofs.set(stageName, newProof);
		// Initialize stage.startedAt if first time
		const stageKey = stageKeyFor(stageName);
		if (stageKey) {
			(batch.stages as any)[stageKey] ||= {};
			if (!(batch.stages as any)[stageKey].startedAt) {
				(batch.stages as any)[stageKey].startedAt = new Date();
			}
		}
	}

	// Update currentStage so it points at the most-advanced stage that still
	// holds liquid after this transfer. Forward transfers normally advance the
	// cursor; reversals roll it backward when the current stage is now empty.
	if (batch.pipeline) {
		const pipeline = batch.pipeline as string[];
		const toIdx = input.toStage ? pipeline.indexOf(input.toStage) : -1;
		const curIdx = pipeline.indexOf(batch.currentStage);

		if (transferType === 'reversal') {
			// If the stage we just drained (input.fromStage = original.toStage)
			// was the current cursor and is now empty, walk back to the latest
			// non-empty pipeline stage at or before its index.
			const drainedNow = !!input.fromStage
				&& (stageVolumes.get(input.fromStage) || 0) <= RECONCILIATION_EPSILON;
			if (drainedNow && batch.currentStage === input.fromStage) {
				let resolved: string | null = null;
				for (let i = curIdx; i >= 0; i--) {
					const s = pipeline[i];
					const v = stageVolumes.get(s) || 0;
					if (v > RECONCILIATION_EPSILON) { resolved = s; break; }
				}
				if (resolved) {
					batch.currentStage = resolved;
				} else if (input.toStage && toIdx > -1) {
					// No content anywhere; fall back to the inverse destination's
					// stage so the batch doesn't get stuck on an empty cursor.
					batch.currentStage = input.toStage;
				}
			}
		} else if (input.toStage && toIdx > -1 && toIdx > curIdx) {
			batch.currentStage = input.toStage;
		}
	}

	// Update TTB account based on destination stage
	if (input.toStage && STAGE_TO_TTB_ACCOUNT[input.toStage]) {
		(batch as any).ttbAccount = STAGE_TO_TTB_ACCOUNT[input.toStage];
	}

	// Status: completed if all stage volumes are at or beyond Bottled
	if (transferType === 'tax_paid_withdrawal' || input.toStage === 'Bottled') {
		const remaining = Array.from(stageVolumes.entries()).filter(([_, v]) => v > RECONCILIATION_EPSILON);
		if (remaining.length === 0) {
			batch.status = 'completed';
		}
	}

	// Status: completed if destruction drained everything
	if (transferType === 'destruction') {
		const remaining = Array.from(stageVolumes.entries()).filter(([_, v]) => v > RECONCILIATION_EPSILON);
		if (remaining.length === 0) {
			batch.status = 'cancelled';
		}
	}

	// Reversal that restores content should bump status back to active.
	if (transferType === 'reversal' && batch.status !== 'active') {
		const remaining = Array.from(stageVolumes.entries()).filter(([_, v]) => v > RECONCILIATION_EPSILON);
		if (remaining.length > 0) {
			batch.status = 'active';
		}
	}

	(batch as any).cacheVersion = ((batch as any).cacheVersion || 0) + 1;
	(batch as any).cachedAt = new Date();

	await batch.save({ session });
	return batch;
}

// ─── Stage name → stages object key mapping ───────────────────────────────────
// Mirrors STAGE_KEY_MAP from composables/batchPipeline.ts but we copy it here
// to avoid a cross-import that would pull Vue runtime into Nitro.

const STAGE_KEY_MAP_LOCAL: Record<string, string> = {
	Mashing: 'mashing',
	Fermenting: 'fermenting',
	'Stripping Run': 'strippingRun',
	'Low Wines': 'lowWines',
	'Spirit Run': 'spiritRun',
	Distilling: 'distilling',
	Maceration: 'maceration',
	Filtering: 'filtering',
	'Barrel Aging': 'barrelAging',
	Storage: 'storage',
	Blending: 'blending',
	Proofing: 'proofing',
	Bottled: 'bottled',
};

function stageKeyFor(stageName: string | null | undefined): string | null {
	if (!stageName) return null;
	return STAGE_KEY_MAP_LOCAL[stageName] || null;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function executeTransfer(
	input: TransferInput,
	options: ExecuteTransferOptions = {},
): Promise<ExecuteTransferResult> {
	const period = options.reportingPeriod || getCurrentReportingPeriod();
	const ownsSession = !options.session;
	const session = options.session || (await mongoose.startSession());

	let result: ExecuteTransferResult | null = null;

	try {
		if (ownsSession) {
			await session.withTransaction(async () => {
				// 1. Server-side grain-in correction: stamp effectiveVolume on any
				// source/dest/loss line that needs it (pre-distillation grain-in
				// batches). No-op when the batch is grain-out or stages are
				// downstream of the stripping run. Safe to call even if the
				// caller already provided effectiveVolume — won't overwrite.
				await applyGrainInCorrection(input, session);

				// 2. Compute and validate (uses effectiveVolume for PG when set)
				const totals = computeTotals(input);
				validateInvariants(input, totals);

				result = await executeWithSession(input, totals, period, options, session);
			}, {
				readConcern: { level: 'snapshot' },
				writeConcern: { w: 'majority' },
			});
		} else {
			await applyGrainInCorrection(input, session);
			const totals = computeTotals(input);
			validateInvariants(input, totals);
			result = await executeWithSession(input, totals, period, options, session);
		}
	} finally {
		if (ownsSession) {
			await session.endSession();
		}
	}

	if (!result) {
		throw new TransferEngineError('UNKNOWN', 'Transfer engine completed without result');
	}
	return result;
}

async function executeWithSession(
	input: TransferInput,
	totals: Totals,
	period: string,
	options: ExecuteTransferOptions,
	session: ClientSession,
): Promise<ExecuteTransferResult> {
	// 2. Period lock check
	if (!options.bypassPeriodLock) {
		await ensurePeriodOpen(period, session);
	}

	// 3. Validate batch exists
	const batchExists = await Batch.exists({ _id: input.batch }).session(session);
	if (!batchExists) {
		throw new TransferEngineError('BATCH_NOT_FOUND', `Batch ${input.batch} not found`, 404);
	}

	// 4. Pre-create the Transfer doc to get an _id (used as audit pointer in vessel slots)
	const transferDoc = new Transfer({
		type: input.type,
		status: 'committed',
		reverses: null,
		reversedBy: null,
		reportingPeriod: period,
		batch: input.batch,
		fromStage: input.fromStage ?? null,
		toStage: input.toStage ?? null,
		sources: input.sources,
		destinations: input.destinations,
		loss: input.loss,
		ttbAccount: input.ttbAccount,
		notes: input.notes,
		attachments: input.attachments,
		createdBy: options.createdBy,
		...totals,
	});

	// 5. Decrement source vessels
	for (const src of input.sources) {
		if (!src.vessel) continue; // null = virtual source (reversal of withdrawal/destruction/sample/tib_out)
		await decrementVesselSlot(
			src.vessel,
			input.batch,
			src.volume,
			transferDoc._id as mongoose.Types.ObjectId,
			session,
			options.allowVesselSlotCreate || false,
		);
	}

	// 6. Increment destination vessels
	for (const dest of input.destinations) {
		if (!dest.vessel) continue; // null = withdrawal/destruction destination
		await incrementVesselSlot(
			dest.vessel,
			input.batch,
			dest.volume,
			dest.proof,
			transferDoc._id as mongoose.Types.ObjectId,
			session,
		);
	}

	// 7. Apply to batch (decrement source stage, increment dest stage, update TTB account)
	const updatedBatch = await applyTransferToBatch(input.batch, input, totals, input.type, session);

	// 8. Persist transfer doc
	await transferDoc.save({ session });

	// 9. Collect updated vessels for return
	const vesselIds = new Set<string>();
	for (const s of input.sources) vesselIds.add(String(s.vessel));
	for (const d of input.destinations) if (d.vessel) vesselIds.add(String(d.vessel));
	const updatedVessels = vesselIds.size > 0
		? await Vessel.find({ _id: { $in: Array.from(vesselIds) } }).session(session).lean()
		: [];

	return {
		transfer: transferDoc.toObject(),
		batch: typeof updatedBatch.toObject === 'function' ? updatedBatch.toObject() : updatedBatch,
		updatedVessels,
	};
}

// ─── Reverse a committed transfer ─────────────────────────────────────────────

export async function reverseTransfer(
	originalTransferId: string,
	options: ExecuteTransferOptions & { reverseNotes?: string } = {},
): Promise<ExecuteTransferResult> {
	const ownsSession = !options.session;
	const session = options.session || (await mongoose.startSession());

	let result: ExecuteTransferResult | null = null;

	try {
		if (ownsSession) {
			await session.withTransaction(async () => {
				result = await reverseWithSession(originalTransferId, options, session);
			}, {
				readConcern: { level: 'snapshot' },
				writeConcern: { w: 'majority' },
			});
		} else {
			result = await reverseWithSession(originalTransferId, options, session);
		}
	} finally {
		if (ownsSession) {
			await session.endSession();
		}
	}

	if (!result) {
		throw new TransferEngineError('UNKNOWN', 'Reverse completed without result');
	}
	return result;
}

async function reverseWithSession(
	originalId: string,
	options: ExecuteTransferOptions & { reverseNotes?: string },
	session: ClientSession,
): Promise<ExecuteTransferResult> {
	const original: any = await Transfer.findById(originalId).session(session);
	if (!original) {
		throw new TransferEngineError('TRANSFER_NOT_FOUND', `Transfer ${originalId} not found`, 404);
	}
	if (original.status === 'reversed') {
		throw new TransferEngineError('ALREADY_REVERSED', `Transfer ${originalId} has already been reversed`, 409);
	}
	if (original.type === 'reversal') {
		throw new TransferEngineError('CANNOT_REVERSE_REVERSAL', `Cannot reverse a reversal transfer; create a new forward transfer instead`, 409);
	}

	// Period must be open (or bypassed). The reversal lands in the CURRENT period,
	// not the original period — that's how TTB corrections are supposed to work.
	const reversalPeriod = options.reportingPeriod || getCurrentReportingPeriod();
	if (!options.bypassPeriodLock) {
		await ensurePeriodOpen(reversalPeriod, session);
	}

	// Build the inverse input: swap sources ↔ destinations, swap from ↔ to stage,
	// and the loss line gets a negated zero (reversal also reverses the loss).
	const inverseInput: TransferInput = {
		type: 'reversal',
		batch: String(original.batch),
		fromStage: original.toStage ?? null,
		toStage: original.fromStage ?? null,
		// Original destinations become new sources (and vice versa). Null-vessel
		// destinations from the original (destruction/withdrawal/sample/tib_out,
		// or a buggy stage_transition that was committed before the destination
		// vessel was required) are preserved as null-vessel sources so the math
		// balances and the batch stage cache is properly drained. The engine
		// skips vessel-slot operations for null-vessel sources.
		sources: (original.destinations as any[]).map(d => ({
			vessel: d.vessel ? String(d.vessel) : null,
			volume: d.volume,
			proof: d.proof,
			// Preserve grain-in correction on reversal so PG balances symmetrically.
			...(typeof d.effectiveVolume === 'number' ? { effectiveVolume: d.effectiveVolume } : {}),
			gauging: d.gauging,
		})),
		destinations: (original.sources as any[])
			.filter(s => s.vessel) // skip phantom sources (legacy data); their slot can't be restored
			.map(s => ({
				vessel: String(s.vessel),
				stage: original.fromStage ?? null,
				volume: s.volume,
				proof: s.proof,
				...(typeof s.effectiveVolume === 'number' ? { effectiveVolume: s.effectiveVolume } : {}),
				gauging: s.gauging,
			})),
		loss: {
			volume: 0,
			proof: 0,
			reasonCode: 'no_loss' as LossReasonCode,
			notes: `Reversal of transfer ${originalId}. Original loss: ${original.loss?.volume || 0} gal (${original.loss?.reasonCode || 'unknown'}).`,
		},
		ttbAccount: {
			from: original.ttbAccount?.to ?? null,
			to: original.ttbAccount?.from ?? null,
		},
		notes: options.reverseNotes || `Reversal of transfer ${originalId}`,
		attachments: [],
	};

	// If the original had a non-zero loss, the reversal needs to "un-lose" that
	// volume so the source vessel(s) are restored to their pre-transfer state.
	// We can't physically restore lost liquid, so we synthesize a virtual
	// (null-vessel) source on the inverse equal to the original loss line.
	// This keeps invariants balanced (source = dest + 0 loss) while documenting
	// that the reversal undoes the original loss attestation.
	const originalLossVolume = original.loss?.volume || 0;
	const originalLossProof = original.loss?.proof || 0;
	if (originalLossVolume > 0) {
		const phantomLossSource: any = {
			vessel: null,
			volume: originalLossVolume,
			proof: originalLossProof,
		};
		const olEv = (original.loss as any)?.effectiveVolume;
		if (typeof olEv === 'number' && Number.isFinite(olEv)) {
			phantomLossSource.effectiveVolume = olEv;
		}
		inverseInput.sources.push(phantomLossSource);
	}

	// Execute the inverse transfer
	const result = await executeWithSession(
		inverseInput,
		computeTotals(inverseInput),
		reversalPeriod,
		{ ...options, allowVesselSlotCreate: true }, // sources may have already been emptied; allow slot create
		session,
	);

	// Mark the original as reversed and link it to the reversal
	original.status = 'reversed';
	original.reversedBy = result.transfer._id;
	await original.save({ session });
	(result.transfer as any).reverses = original._id;
	await Transfer.findByIdAndUpdate(
		result.transfer._id,
		{ reverses: original._id },
		{ session },
	);

	return result;
}
