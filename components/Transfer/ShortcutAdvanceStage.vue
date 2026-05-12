<script setup lang="ts">
import type { Batch, DistillingRun } from '~/types';
import type { Transfer, TransferInput } from '~/types/interfaces/Transfer';
import { LazyModalTransferAction, LazyPanelProduction } from '#components';
import { getNextStage, STAGE_DISPLAY, STAGE_VESSEL_TYPE } from '~/composables/batchPipeline';
import { calculateProofGallons } from '~/utils/proofGallons';

/**
 * Phase 6.1 — Advance-stage shortcut.
 *
 * Pre-fills the unified Transfer Action form for a stage_transition from the
 * batch's current (or supplied) stage to the next stage in the pipeline.
 * Sources are auto-populated from every vessel currently containing the batch
 * (multi-vessel-aware, fixes Bug 4.1).
 *
 * Stage-aware post-advance bookkeeping (parity with legacy BatchAdvanceAction):
 *   - When entering Stripping/Spirit/Distilling, append a stub DistillingRun
 *     populated from the transfer's destination (charge volume + proof → ABV).
 *   - When exiting Stripping Run → Low Wines, fill the latest open run's
 *     output so recomputeLowWines aggregates correctly.
 *
 * Replaces the per-stage advance buttons in BatchAdvanceAction.vue.
 */
const props = defineProps<{
	batch: Batch;
	sourceStage?: string;
}>();

const emit = defineEmits<{ advanced: [] }>();

const overlay = useOverlay();
const modal = overlay.create(LazyModalTransferAction);
const productionPanel = overlay.create(LazyPanelProduction);
const vesselStore = useVesselStore();
const batchStore = useBatchStore();
const productionStore = useProductionStore();
const toast = useToast();

const sourceStage = computed(() => props.sourceStage || props.batch.currentStage);

const nextStage = computed(() => {
	if (sourceStage.value === 'Upcoming') return props.batch.pipeline[0] || null;
	return getNextStage(props.batch.pipeline, sourceStage.value);
});

const stageDisplay = computed(() => nextStage.value ? STAGE_DISPLAY[nextStage.value] : null);

function findSources() {
	// Pre-populate vessel + inferred proof, leave volume = 0 so the user types
	// the amount they're actually moving (avoids the "you also have to change
	// 400 down to 100" friction in partial transfers).
	//
	// Filter to vessels matching the source stage's vessel type — e.g.,
	// advancing FROM "Stripping Run" sources only from Stills, not from the
	// Fermenter that may still hold residual wash from a prior partial draw.
	const requiredVesselType = STAGE_VESSEL_TYPE[sourceStage.value];
	const out: { vessel: string; volume: number; proof: number }[] = [];
	for (const v of vesselStore.items) {
		if (requiredVesselType && v.type !== requiredVesselType) continue;
		const slot = (v.contents || []).find((c: any) => String(c.batch) === props.batch._id);
		if (slot && slot.volume > 0) {
			const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0);
			out.push({ vessel: v._id, volume: 0, proof });
		}
	}
	return out;
}

const DISTILLATION_STAGES = ['Stripping Run', 'Spirit Run', 'Distilling'] as const;

function buildDistillingRunFromTransfer(transfer: Transfer): DistillingRun {
	const dest = transfer.destinations[0];
	const sources = transfer.sources || [];
	const runType = transfer.toStage === 'Spirit Run' ? 'spirit' : 'stripping';
	return {
		runType,
		date: new Date(),
		chargeVolume: dest?.volume,
		chargeVolumeUnit: 'gallon',
		chargeAbv: dest ? dest.proof / 2 : 0,
		chargeSourceVessel: sources[0]?.vessel || '',
		chargeSourceVessels: sources.map((s) => s.vessel).filter(Boolean) as string[],
		...(runType === 'stripping'
			? { output: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined } }
			: {
				collected: {
					foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
					tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
				},
			}),
	};
}

async function applyEnterDistillation(transfer: Transfer) {
	const target = transfer.toStage;
	if (!target || !DISTILLATION_STAGES.includes(target as typeof DISTILLATION_STAGES[number])) return;
	const run = buildDistillingRunFromTransfer(transfer);
	try {
		if (target === 'Stripping Run') await batchStore.addStrippingRun(props.batch._id, run);
		else if (target === 'Spirit Run') await batchStore.addSpiritRun(props.batch._id, run);
		else await batchStore.addDistillingRun(props.batch._id, run);
	} catch (err) {
		toast.add({
			title: 'Run record not created',
			description: `Transfer succeeded but the ${target.toLowerCase()} stub run wasn't saved. Add it manually in the stage editor. ${getErrorMessage(err)}`,
			color: 'warning',
			icon: 'i-lucide-alert-triangle',
		});
	}
}

async function applyExitStrippingToLowWines(transfer: Transfer) {
	if (transfer.fromStage !== 'Stripping Run' || transfer.toStage !== 'Low Wines') return;
	const fresh = batchStore.items.find((b) => b._id === props.batch._id);
	const runs = fresh?.stages?.strippingRun?.runs || [];
	if (runs.length === 0) return;
	let runIndex = -1;
	for (let i = runs.length - 1; i >= 0; i--) {
		if (!(runs[i]?.output?.volume || 0)) { runIndex = i; break; }
	}
	if (runIndex === -1) runIndex = runs.length - 1;

	const dest = transfer.destinations[0];
	const volume = dest?.volume || 0;
	const abv = dest ? dest.proof / 2 : 0;
	const pg = volume > 0 && abv > 0 ? calculateProofGallons(volume, 'gallon', abv) : 0;
	const destVesselId = (dest && typeof dest.vessel === 'string') ? dest.vessel : '';

	try {
		await batchStore.updateStrippingRun(props.batch._id, runIndex, {
			completed: true,
			output: { vessel: destVesselId, volume, volumeUnit: 'gallon', abv, proofGallons: pg },
			total: { volume, volumeUnit: 'gallon', abv, proofGallons: pg },
		});
	} catch (err) {
		toast.add({
			title: 'Run output not recorded',
			description: `Low Wines aggregate may be stale. Edit the stripping run manually. ${getErrorMessage(err)}`,
			color: 'warning',
			icon: 'i-lucide-alert-triangle',
		});
	}
}

async function openBottling() {
	// Phase 7 — Bottled stage uses the Production panel (PanelProduction handles
	// the engine-driven vessel drain + production-doc creation atomically).
	const allBatchVessels: string[] = [];
	for (const v of vesselStore.items) {
		const slot = (v.contents || []).find((c: any) => String(c.batch) === props.batch._id);
		if (slot && slot.volume > 0) allBatchVessels.push(v._id);
	}
	productionStore.resetProduction();
	productionStore.production.date = new Date();
	productionStore.production.vessel = allBatchVessels as any;
	const result = await productionPanel.open({
		prefill: { batchId: props.batch._id, vessels: allBatchVessels, date: new Date() },
	}).result;
	if (result && typeof result === 'string') {
		toast.add({
			title: 'Bottling recorded',
			description: 'Production logged and source vessels drained.',
			color: 'success',
			icon: 'i-lucide-check-circle',
		});
		emit('advanced');
	}
}

async function open() {
	if (!nextStage.value) return;
	if (nextStage.value === 'Bottled') return openBottling();
	const isInitialEntry = sourceStage.value === 'Upcoming';
	const prefill: Partial<TransferInput> = {
		type: 'stage_transition',
		batch: props.batch._id,
		fromStage: isInitialEntry ? 'Upcoming' : sourceStage.value,
		toStage: nextStage.value,
		sources: isInitialEntry ? [] : findSources(),
		destinations: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
	};
	const result = await modal.open({ prefill }).result;
	if (!result) return;
	const transfer = result.transfer as Transfer;
	if (transfer) {
		await applyExitStrippingToLowWines(transfer);
		await applyEnterDistillation(transfer);
	}
	emit('advanced');
}
</script>

<template>
	<UButton
		v-if="nextStage"
		:icon="stageDisplay?.icon || 'i-lucide-arrow-right'"
		color="primary"
		@click="open"
	>
		Advance to {{ nextStage }}
	</UButton>
</template>
