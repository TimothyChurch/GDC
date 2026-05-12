import { toWineGallons } from '~/server/utils/unitConverter';
import {
	STAGE_TO_TTB_ACCOUNT,
	type TtbAccount,
} from '~/composables/transferDefinitions';
import type { TransferInput, TransferSource } from '~/types/interfaces/Transfer';

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
export function buildChargeTransferInput(input: ChargeBuildInput): TransferInput {
	const sources: TransferSource[] = [];

	const sourceProof = (input.chargeAbv || 0) * 2;
	for (const c of input.chargeSources) {
		if (!c.vesselId || c.volume <= 0) continue;
		sources.push({
			vessel: c.vesselId,
			volume: toWineGallons(c.volume, c.volumeUnit),
			proof: sourceProof,
		});
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
	const totalVolWG = sources.reduce((s, x) => s + x.volume, 0);
	const totalPG = sources.reduce((s, x) => s + (x.volume * x.proof) / 100, 0);
	const destProof = totalVolWG > 0 ? (totalPG * 100) / totalVolWG : 0;

	const stageAccount: TtbAccount | null = STAGE_TO_TTB_ACCOUNT[input.stage] ?? null;

	return {
		type: 'vessel_move',
		batch: input.batchId,
		fromStage: input.stage,
		toStage: input.stage,
		sources,
		destinations: [
			{
				vessel: input.stillId,
				stage: input.stage,
				volume: totalVolWG,
				proof: destProof,
			},
		],
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
 * Apply a `ChargeModalResult`: run the engine transfer (if any liquid moves)
 * and update the stage vessel pointer if the user picked a different still.
 *
 * Encapsulates the workflow shared by `BatchStrippingRun`, `BatchSpiritRun`,
 * and `BatchDistilling`. Returns the charge sources used so callers can build
 * their run record without re-deriving them.
 */
export async function applyChargeResult(
	opts: ApplyChargeResultOptions,
): Promise<{ chargeSources: ChargeSource[]; sourceVesselIds: string[] }> {
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
	if (chargeSources.length > 0 || hasFeintsAddition) {
		const input = buildChargeTransferInput({
			batchId,
			stage,
			stillId: result.stillId,
			chargeAbv: result.chargeAbv,
			chargeSources,
			additions: result.additions,
		});
		await transferStore.create(input);
	}

	if (result.stillId !== currentStageVessel) {
		await batchStore.updateStageData(batchId, stage, { vessel: result.stillId });
	}

	return { chargeSources, sourceVesselIds };
}
