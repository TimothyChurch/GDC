import { toWineGallons } from '~/server/utils/unitConverter';
import {
	STAGE_TO_TTB_ACCOUNT,
	type TtbAccount,
} from '~/composables/transferDefinitions';
import type { TransferInput, TransferSource, TransferDestination } from '~/types/interfaces/Transfer';
import {
	calcGrainDisplacement,
	getEffectiveLiquidVolume,
	type ExtractType,
} from '~/utils/grainBill';

/** Shape returned by `ModalDistillingCharge.vue` (kept loose to avoid a circular import). */
export interface ChargeModalResult {
	stillId: string;
	chargeVolume: number;
	chargeVolumeUnit: string;
	chargeAbv: number;
	chargeSourceVessel: string;
	chargeSourceVessels: string[];
	chargePerVessel?: { vesselId: string; volume: number; volumeUnit: string }[];
	runType: 'stripping' | 'spirit';
	additions: ChargeAddition[];
}

export interface ChargeSource {
	vesselId: string;
	volume: number;
	volumeUnit: string;
}

export interface ChargeAddition {
	label?: string;
	sourceVessel?: string;
	volume?: number;
	volumeUnit?: string;
	abv?: number;
}

export interface ChargeBuildInput {
	batchId: string;
	stage: string;
	stillId: string;
	chargeSources: ChargeSource[];
	chargeAbv: number;
	additions?: ChargeAddition[];
	/**
	 * Grain-in context for the source batch. When provided AND the stage is a
	 * pre-distillation stage where the source vessel(s) actually carry grain
	 * (Mashing / Fermenting / Stripping Run for fermenters being drained into
	 * a still), the engine receives `effectiveVolume` on each source/dest line
	 * so PG is computed from the corrected liquid volume. When omitted, the
	 * server-side `applyGrainInCorrection` helper will derive it; supplying
	 * it client-side saves a Mongo round-trip and keeps the UI hint in sync.
	 */
	grainIn?: {
		/** Total grain displacement (gal) for the recipe. */
		totalDisplacementGal: number;
		/** Total bulk (gal) of this batch across all source vessels, used to
		 *  pro-rate displacement per partial draw. */
		totalBulkGal: number;
	};
}

/**
 * Build a `TransferInput` for charging a still — used by BatchStrippingRun,
 * BatchSpiritRun, BatchDistilling. Replaces the legacy
 * `vesselStore.transferBatchContents` / `transferBatch` calls that left
 * `fromStage`/`toStage`/`ttbAccount` empty.
 *
 * Type is `vessel_move` because the batch is moving between vessels within
 * the same stage (the stage transition itself happens earlier via
 * `batchStore.advanceToStage`).
 *
 * Pure function — does not touch stores. Test in isolation.
 */
/**
 * Pre-distillation stages where the source fermenter still carries grain.
 * The Stripping Run charge transfer's source-fermenter is grain-in; once the
 * still has distilled, downstream stages are pure liquid.
 */
const STILL_CHARGE_GRAIN_PRESENT_STAGES = new Set(['Mashing', 'Fermenting', 'Stripping Run']);

export function buildChargeTransferInput(input: ChargeBuildInput): TransferInput {
	const sources: TransferSource[] = [];

	const sourceProof = (input.chargeAbv || 0) * 2;
	// Grain-in correction applies only when the stage is pre-distillation AND
	// the caller supplied grain-in context (recipe is grain-in with non-zero
	// fermentable displacement). Additions (feints from a feints tank) are
	// already pure liquid; we never correct them.
	const correctGrainIn = !!input.grainIn
		&& input.grainIn.totalDisplacementGal > 0
		&& STILL_CHARGE_GRAIN_PRESENT_STAGES.has(input.stage);

	for (const c of input.chargeSources) {
		if (!c.vesselId || c.volume <= 0) continue;
		const volWG = toWineGallons(c.volume, c.volumeUnit);
		const src: TransferSource = {
			vessel: c.vesselId,
			volume: volWG,
			proof: sourceProof,
		};
		if (correctGrainIn) {
			const totalBulk = input.grainIn!.totalBulkGal > 0
				? input.grainIn!.totalBulkGal
				: volWG;
			const share = Math.min(1, volWG / totalBulk);
			const lineDisplacement = input.grainIn!.totalDisplacementGal * share;
			src.effectiveVolume = +getEffectiveLiquidVolume(volWG, lineDisplacement, true).toFixed(4);
		}
		sources.push(src);
	}

	// Additions with a sourceVessel are recorded as transfer sources (e.g. feints).
	// Additions without a sourceVessel (water from city supply) are NOT TTB-tracked
	// liquid movement and are skipped here. Volume change is captured when the
	// run output is recorded.
	for (const a of input.additions || []) {
		if (!a.sourceVessel) continue;
		const v = a.volume || 0;
		if (v <= 0) continue;
		sources.push({
			vessel: a.sourceVessel,
			volume: toWineGallons(v, a.volumeUnit || 'gallon'),
			proof: (a.abv || 0) * 2,
		});
	}

	// Destination volume + proof are the volume- and PG-weighted total of the sources.
	// PG must be computed from effectiveVolume when set (otherwise grain-in
	// over-states the still's incoming PG and we'd hit a balance mismatch).
	const totalVolWG = sources.reduce((s, x) => s + x.volume, 0);
	const totalPG = sources.reduce((s, x) => {
		const ev = typeof x.effectiveVolume === 'number' ? x.effectiveVolume : x.volume;
		return s + (ev * x.proof) / 100;
	}, 0);
	// Destination effectiveVolume: when ANY source has correction, the dest
	// (still) holds the same alcohol in a smaller liquid volume. Sum
	// effectiveVolume across sources for the destination's effective.
	const totalEffectiveVolWG = correctGrainIn
		? sources.reduce((s, x) => s + (typeof x.effectiveVolume === 'number' ? x.effectiveVolume : x.volume), 0)
		: totalVolWG;
	// Dest proof: PG / effective_volume × 100 keeps PG balance.
	const destProof = totalEffectiveVolWG > 0 ? (totalPG * 100) / totalEffectiveVolWG : 0;

	const stageAccount: TtbAccount | null = STAGE_TO_TTB_ACCOUNT[input.stage] ?? null;

	const destination: TransferDestination = {
		vessel: input.stillId,
		stage: input.stage,
		volume: totalVolWG,
		proof: destProof,
	};
	if (correctGrainIn && totalEffectiveVolWG < totalVolWG) {
		destination.effectiveVolume = +totalEffectiveVolWG.toFixed(4);
	}

	return {
		type: 'vessel_move',
		batch: input.batchId,
		fromStage: input.stage,
		toStage: input.stage,
		sources,
		destinations: [destination],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		ttbAccount: { from: stageAccount, to: stageAccount },
	};
}

export interface ApplyChargeResultOptions {
	batchId: string;
	stage: string;
	result: ChargeModalResult;
	/** The stage's currently-assigned vessel — used to skip the stage-vessel
	 *  update when the user picked the same still as already configured. */
	currentStageVessel?: string;
}

/**
 * Look up the grain-in context for a batch via the client-side stores.
 * Returns null when the batch isn't grain-in, has no fermentable items, or
 * no displacement is configured. Used by `applyChargeResult` to give the
 * Transfer engine a corrected `effectiveVolume` per source/dest line.
 *
 * Mirrors `server/utils/grainInCorrection.ts loadBatchGrainContext`. Both
 * derivations must agree — supplying it client-side is a UX optimization
 * (and lets the run record store `chargeEffectiveVolume` without an extra
 * await), but the server re-derives if missing.
 */
function getClientGrainInContext(batchId: string): ChargeBuildInput['grainIn'] | undefined {
	const batchStore = useBatchStore();
	const recipeStore = useRecipeStore();
	const itemStore = useItemStore();
	const vesselStore = useVesselStore();

	const batch = batchStore.items.find((b) => b._id === batchId);
	if (!batch) return undefined;

	const batchOverride = batch.stages?.mashing?.grainIn;
	const recipe = recipeStore.getRecipeById(batch.recipe as any);
	const grainIn = typeof batchOverride === 'boolean' ? batchOverride : !!recipe?.grainIn;
	if (!grainIn) return undefined;
	if (!recipe?.items?.length) return undefined;

	const lookup = new Map<string, {
		displacement?: number;
		extractType?: ExtractType;
		fermentable?: boolean;
	}>();
	for (const it of itemStore.items as any[]) {
		lookup.set(String(it._id), {
			displacement: it.displacement,
			extractType: it.extractType as ExtractType | undefined,
			fermentable: it.fermentable,
		});
	}
	const normalized = recipe.items.map((i: any) => ({
		_id: String(i._id),
		amount: Number(i.amount) || 0,
		unit: String(i.unit || ''),
	}));
	const totalDisplacementGal = calcGrainDisplacement(normalized, lookup);
	if (totalDisplacementGal <= 0) return undefined;

	// Sum bulk gal of this batch across every vessel.
	let totalBulkGal = 0;
	for (const v of vesselStore.items as any[]) {
		for (const c of (v.contents || [])) {
			if (String(c.batch) === String(batchId)) {
				totalBulkGal += Number(c.volume) || 0;
			}
		}
	}

	return { totalDisplacementGal, totalBulkGal };
}

/**
 * Apply a `ChargeModalResult`: run the engine transfer (if any liquid moves)
 * and update the stage vessel pointer if the user picked a different still.
 *
 * Encapsulates the workflow shared by `BatchStrippingRun`, `BatchSpiritRun`,
 * and `BatchDistilling`. Returns the charge sources used so callers can build
 * their run record without re-deriving them. Also returns
 * `chargeEffectiveVolume` (gal, sum of source effectiveVolumes) when grain-in
 * correction applied — callers persist this on the run record for audit.
 */
export async function applyChargeResult(
	opts: ApplyChargeResultOptions,
): Promise<{
	chargeSources: ChargeSource[];
	sourceVesselIds: string[];
	chargeEffectiveVolume?: number;
	chargeEffectiveVolumeUnit?: string;
}> {
	const vesselStore = useVesselStore();
	const transferStore = useTransferStore();
	const batchStore = useBatchStore();

	const { result, batchId, stage, currentStageVessel } = opts;

	// Charge sources: prefer per-vessel volumes from the modal, fall back to
	// the vessel's batch entry when only a vessel-id list is supplied.
	const sourceVesselIds = result.chargeSourceVessels
		|| (result.chargeSourceVessel ? [result.chargeSourceVessel] : []);
	const chargeSources: ChargeSource[] = [];
	if (result.chargeVolume > 0 && sourceVesselIds.length > 0) {
		for (const vesselId of sourceVesselIds) {
			const perVessel = result.chargePerVessel?.find((p) => p.vesselId === vesselId);
			if (perVessel) {
				chargeSources.push({
					vesselId,
					volume: perVessel.volume,
					volumeUnit: perVessel.volumeUnit,
				});
			} else {
				const vessel = vesselStore.getVesselById(vesselId);
				const entry = vessel?.contents?.find((c) => c.batch === batchId);
				if (!entry || entry.volume <= 0) continue;
				chargeSources.push({
					vesselId,
					volume: entry.volume,
					volumeUnit: entry.volumeUnit,
				});
			}
		}
	}

	const hasFeintsAddition = result.additions?.some(
		(a) => a.sourceVessel && (a.volume || 0) > 0,
	);

	let chargeEffectiveVolume: number | undefined;
	let chargeEffectiveVolumeUnit: string | undefined;
	if (chargeSources.length > 0 || hasFeintsAddition) {
		const grainInCtx = getClientGrainInContext(batchId);
		const input = buildChargeTransferInput({
			batchId,
			stage,
			stillId: result.stillId,
			chargeAbv: result.chargeAbv,
			chargeSources,
			additions: result.additions,
			grainIn: grainInCtx,
		});
		// Sum effective volume across charge sources (NOT additions) for the
		// run record so the BatchDistillingRun UI can display
		// "100 gal (~80 gal effective)".
		const chargeSourceVesselIdSet = new Set(chargeSources.map((c) => c.vesselId));
		let evSum = 0;
		let anyCorrected = false;
		for (const s of input.sources) {
			if (!chargeSourceVesselIdSet.has(String(s.vessel))) continue;
			if (typeof s.effectiveVolume === 'number') {
				evSum += s.effectiveVolume;
				anyCorrected = true;
			} else {
				evSum += s.volume;
			}
		}
		if (anyCorrected) {
			chargeEffectiveVolume = +evSum.toFixed(4);
			chargeEffectiveVolumeUnit = 'gallon'; // input.sources are in wine gallons
		}
		await transferStore.create(input);
	}

	if (result.stillId !== currentStageVessel) {
		await batchStore.updateStageData(batchId, stage, { vessel: result.stillId });
	}

	return { chargeSources, sourceVesselIds, chargeEffectiveVolume, chargeEffectiveVolumeUnit };
}
