/**
 * Grain-in correction for the Transfer Engine.
 *
 * When a batch is mashed grain-in (bourbon/whiskey/rye/moonshine), the
 * operator-reported bulk volume in the fermenter includes the grain bed.
 * Using that bulk volume to compute PG overstates production by ~10–20%.
 *
 * This helper derives the *effective liquid volume* for each source /
 * destination / loss line on a Transfer, by:
 *   1. Loading the source batch's per-batch grain-in override (or falling
 *      back to the recipe-level flag).
 *   2. Checking the stage the liquid is moving FROM (and to) — grain
 *      displacement only applies in pre-distillation stages
 *      (mashing / fermenting / strippingRun). Once spent wash is left in the
 *      still after the stripping run, what comes out the condenser is pure
 *      liquid and the bulk volume *is* the effective volume.
 *   3. Computing total grain displacement (gal) from the recipe's
 *      fermentable items.
 *   4. Setting `effectiveVolume = max(0, bulk − displacementForThisFraction)`.
 *      The fraction is `bulkVolume / totalBatchVolume` so partial draws get a
 *      proportional share of the displacement.
 *
 * The vessel slot's stored volume is the BULK volume; we never change that.
 * Only the `effectiveVolume` field on the Transfer line is set so PG
 * downstream uses the corrected number.
 *
 * Authoritative reference for the math: `utils/grainBill.ts`
 * (`calcGrainDisplacement`, `getEffectiveLiquidVolume`).
 */

import { Batch } from '../models/batch.schema';
import { Recipe } from '../models/recipe.schema';
import { Item } from '../models/item.schema';
import { Vessel } from '../models/vessel.schema';
import {
	calcGrainDisplacement,
	getEffectiveLiquidVolume,
	type ExtractType,
} from '../../utils/grainBill';
import type { TransferInput } from '../../types/interfaces/Transfer';
import type { ClientSession } from 'mongoose';

/**
 * Pre-distillation stages where grain is physically present in the wash.
 * Outside this set, the bulk volume is already pure liquid.
 *
 * `Stripping Run` is included: an "on-the-grain" still charge has the source
 * fermenter still carrying grain. The output of the stripping run is clean
 * (grain stays in the still pot), so downstream stages are not corrected.
 */
const GRAIN_PRESENT_STAGES = new Set(['Mashing', 'Fermenting', 'Stripping Run']);

/**
 * Vessel types whose contents are pure liquid even when the batch is grain-in.
 * Stills sit at the boundary: they're charged grain-on but distillation leaves
 * grain in the still pot, so anything that comes OUT of a still through the
 * condenser is bulk == effective.
 *
 * When this set matches the source-side vessel type, source-side correction is
 * skipped regardless of stage.
 */
const STILL_VESSEL_TYPES = new Set(['Still']);

interface BatchGrainContext {
	grainIn: boolean;
	totalDisplacementGal: number;
	/** Sum of bulk slot volumes for this batch across all vessels at correction
	 *  time. Used to pro-rate displacement across partial draws. */
	totalBulkGal: number;
}

/**
 * Load and cache the grain-in context for a batch. Returns null when the
 * batch isn't grain-in, has no fermentable items, or computation fails.
 */
async function loadBatchGrainContext(
	batchId: string,
	session?: ClientSession,
): Promise<BatchGrainContext | null> {
	const batchQ = Batch.findById(batchId).select('stages.mashing.grainIn recipe').lean();
	if (session) batchQ.session(session);
	const batch: any = await batchQ;
	if (!batch) return null;

	const batchOverride = batch.stages?.mashing?.grainIn;
	let recipeDoc: any = null;
	if (batch.recipe) {
		const recipeQ = Recipe.findById(batch.recipe).select('grainIn items').lean();
		if (session) recipeQ.session(session);
		recipeDoc = await recipeQ;
	}

	const grainIn = typeof batchOverride === 'boolean'
		? batchOverride
		: !!recipeDoc?.grainIn;

	if (!grainIn) return null;

	const recipeItems: any[] = Array.isArray(recipeDoc?.items) ? recipeDoc.items : [];
	if (recipeItems.length === 0) return null;

	const itemIds = recipeItems.map((i: any) => i?._id).filter(Boolean).map(String);
	if (itemIds.length === 0) return null;

	const itemQ = Item.find({ _id: { $in: itemIds } })
		.select('displacement extractType fermentable')
		.lean();
	if (session) itemQ.session(session);
	const items: any[] = await itemQ;

	const lookup = new Map<string, {
		displacement?: number;
		extractType?: ExtractType;
		fermentable?: boolean;
	}>();
	for (const it of items) {
		lookup.set(String(it._id), {
			displacement: it.displacement,
			extractType: it.extractType as ExtractType | undefined,
			fermentable: it.fermentable,
		});
	}

	const normalized = recipeItems.map((i: any) => ({
		_id: String(i._id),
		amount: Number(i.amount) || 0,
		unit: String(i.unit || ''),
	}));

	const totalDisplacementGal = calcGrainDisplacement(normalized, lookup);
	if (totalDisplacementGal <= 0) return null;

	// Sum bulk slot volumes for this batch across every vessel that holds it.
	const vesselQ = Vessel.find({ 'contents.batch': batchId })
		.select('contents')
		.lean();
	if (session) vesselQ.session(session);
	const vessels: any[] = await vesselQ;
	let totalBulkGal = 0;
	for (const v of vessels) {
		for (const c of (v.contents || [])) {
			if (String(c.batch) === String(batchId)) {
				totalBulkGal += Number(c.volume) || 0;
			}
		}
	}

	return {
		grainIn: true,
		totalDisplacementGal,
		totalBulkGal,
	};
}

function applyCorrectionToLine<T extends { volume?: number; effectiveVolume?: number }>(
	line: T,
	ctx: BatchGrainContext,
): T {
	if (!line || typeof line.volume !== 'number' || line.volume <= 0) return line;
	// Skip if caller already supplied an effectiveVolume.
	if (typeof line.effectiveVolume === 'number' && Number.isFinite(line.effectiveVolume)) {
		return line;
	}

	// Pro-rate the grain displacement to this line's bulk volume. If the batch
	// has zero recorded bulk (rare edge case — pre-fill from totalBulk fails),
	// fall back to the line volume so the correction is conservative.
	const baseBulk = ctx.totalBulkGal > 0 ? ctx.totalBulkGal : line.volume;
	const share = Math.min(1, line.volume / baseBulk);
	const lineDisplacement = ctx.totalDisplacementGal * share;
	const effective = getEffectiveLiquidVolume(line.volume, lineDisplacement, true);
	line.effectiveVolume = +effective.toFixed(4);
	return line;
}

/**
 * Walk a TransferInput and stamp `effectiveVolume` on every source/destination/
 * loss line that needs grain-in correction. Mutates the input in place AND
 * returns it (for chaining). Lines outside pre-distillation stages, or for
 * grain-out batches, are left untouched (so PG falls back to bulk volume).
 *
 * Source correction applies when the FROM stage is in GRAIN_PRESENT_STAGES.
 * Destination correction applies when the TO stage is in GRAIN_PRESENT_STAGES.
 * Loss correction follows the source side (lost liquid had grain in it).
 *
 * This is safe to call on every transfer: it's a no-op when the batch isn't
 * grain-in or when the stages are downstream of the stripping run.
 */
export async function applyGrainInCorrection(
	input: TransferInput,
	session?: ClientSession,
): Promise<TransferInput> {
	if (!input?.batch) return input;

	const sourceStageHasGrain = !!input.fromStage && GRAIN_PRESENT_STAGES.has(input.fromStage);
	// A destination's stage can override the top-level toStage; check per-line below.
	const anyDestStageHasGrain = (input.destinations || []).some(d => {
		const s = d.stage || input.toStage;
		return !!s && GRAIN_PRESENT_STAGES.has(s);
	});

	if (!sourceStageHasGrain && !anyDestStageHasGrain) {
		// Nothing to correct — bulk volume IS effective volume downstream of stripping.
		return input;
	}
	void anyDestStageHasGrain; // referenced for early-exit; subsequent dest loop checks per-line.

	const ctx = await loadBatchGrainContext(input.batch, session);
	if (!ctx) return input; // not grain-in / no fermentables / not enough data

	// Look up SOURCE vessel types so we can suppress correction for stills,
	// whose contents are pure liquid even mid-distillation (grain stays in
	// the pot). Destination correction doesn't need vessel type — it's
	// stage-driven and a still being charged briefly holds grain so it
	// must receive the corrected volume to keep PG balanced.
	const sourceVesselIds = new Set<string>();
	if (sourceStageHasGrain) {
		for (const s of input.sources) if (s.vessel) sourceVesselIds.add(String(s.vessel));
	}
	const vesselTypeById = new Map<string, string>();
	if (sourceVesselIds.size > 0) {
		const vQ = Vessel.find({ _id: { $in: Array.from(sourceVesselIds) } })
			.select('type')
			.lean();
		if (session) vQ.session(session);
		const docs: any[] = await vQ;
		for (const v of docs) vesselTypeById.set(String(v._id), String(v.type || ''));
	}

	let anySourceCorrected = false;
	if (sourceStageHasGrain) {
		for (const s of input.sources) {
			const vType = s.vessel ? vesselTypeById.get(String(s.vessel)) : undefined;
			// A Still as source means we're recording its output — grain stays
			// in the pot, so output is bulk == effective. Skip correction.
			if (vType && STILL_VESSEL_TYPES.has(vType)) continue;
			applyCorrectionToLine(s, ctx);
			anySourceCorrected = true;
		}
		// Loss came from the source side; correct it only if any source got
		// corrected (otherwise it's pure-liquid loss from a still output).
		if (anySourceCorrected && input.loss) applyCorrectionToLine(input.loss, ctx);
	}

	// Destination correction: apply whenever the destination stage is in
	// GRAIN_PRESENT_STAGES (e.g. mash → fermenter, fermenter → still during
	// stripping charge). For "charge into still" the still briefly holds the
	// grain too — correction keeps PG balanced with the (corrected) source.
	for (const d of input.destinations) {
		const destStage = d.stage || input.toStage;
		if (!destStage || !GRAIN_PRESENT_STAGES.has(destStage)) continue;
		applyCorrectionToLine(d, ctx);
	}

	return input;
}
