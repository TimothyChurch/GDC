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
			// Mark stage completed
			const stageKey = stageKeyFor(input.fromStage);
			if (stageKey && (batch.stages as any)?.[stageKey]) {
				(batch.stages as any)[stageKey].completedAt = new Date();
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
			existing.pg += proofGallons(d.volume, d.proof);
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

	// Update currentStage if a destination is further in pipeline
	if (input.toStage && batch.pipeline) {
		const toIdx = (batch.pipeline as string[]).indexOf(input.toStage);
		const curIdx = (batch.pipeline as string[]).indexOf(batch.currentStage);
		if (toIdx > -1 && toIdx > curIdx) {
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
	// 1. Compute and validate
	const totals = computeTotals(input);
	validateInvariants(input, totals);

	const period = options.reportingPeriod || getCurrentReportingPeriod();
	const ownsSession = !options.session;
	const session = options.session || (await mongoose.startSession());

	let result: ExecuteTransferResult | null = null;

	try {
		if (ownsSession) {
			await session.withTransaction(async () => {
				result = await executeWithSession(input, totals, period, options, session);
			}, {
				readConcern: { level: 'snapshot' },
				writeConcern: { w: 'majority' },
			});
		} else {
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
		// Original destinations become new sources (and vice versa). For non-vessel
		// destinations (withdrawal/destruction), we synthesize a virtual source
		// from the loss line — but for now we only support reversing transfers
		// that have at least one non-null vessel on each side with content.
		sources: (original.destinations as any[])
			.filter(d => d.vessel)
			.map(d => ({
				vessel: String(d.vessel),
				volume: d.volume,
				proof: d.proof,
				gauging: d.gauging,
			})),
		destinations: (original.sources as any[]).map(s => ({
			vessel: String(s.vessel),
			stage: original.fromStage ?? null,
			volume: s.volume,
			proof: s.proof,
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

	// If the original had a non-zero loss, the reversal needs to account for that
	// liquid coming back too. We can't physically restore lost liquid, so we
	// synthesize an extra "virtual" destination volume equal to the original loss.
	// This keeps invariants balanced while documenting that the reversal restores
	// the pre-transfer state.
	const originalLossVolume = original.loss?.volume || 0;
	if (originalLossVolume > 0) {
		// Distribute the original loss back to source(s) proportionally
		const totalDest = (original.destinations as any[]).reduce((sum, d) => sum + (d.volume || 0), 0);
		const baselineDest = (original.destinations as any[])
			.filter(d => d.vessel)
			.reduce((sum, d) => sum + (d.volume || 0), 0);
		// Add the loss volume back to the first source (simple distribution).
		// More sophisticated allocation is possible but yields no functional gain.
		if (inverseInput.destinations.length > 0) {
			const first = inverseInput.destinations[0];
			first.volume = roundVolume(first.volume + originalLossVolume);
		}
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
