<script setup lang="ts">
import type { TransferSource } from '~/types/interfaces/Transfer';
import type { MashingStage } from '~/types';
import { convertVolume } from '~/server/utils/unitConverter';
import { calcGrainDisplacement, getEffectiveLiquidVolume, type ExtractType } from '~/utils/grainBill';

const props = withDefaults(defineProps<{
	source: TransferSource;
	batchId: string;
	index: number;
	allowRemove?: boolean;
	allowedTypes?: string[];   // restrict picker to these vessel types
	/** When provided and matching a pre-distillation stage, the card shows a
	 *  grain-in correction hint next to the volume input. */
	fromStage?: string | null;
}>(), {});

const emit = defineEmits<{
	update: [Partial<TransferSource>];
	remove: [];
}>();

const vesselStore = useVesselStore();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const itemStore = useItemStore();
const u = useDisplayUnits();

const GRAIN_PRESENT_STAGES = new Set(['Mashing', 'Fermenting', 'Stripping Run']);
const STILL_VESSEL_TYPES = new Set(['Still']);

const sourceBatch = computed(() => batchStore.items.find(b => b._id === props.batchId) || null);
const sourceRecipe = computed(() => {
	const b = sourceBatch.value;
	if (!b?.recipe) return null;
	return recipeStore.getRecipeById(b.recipe as any) || null;
});
const effectiveGrainIn = computed<boolean>(() => {
	const override = (sourceBatch.value?.stages?.mashing as MashingStage | undefined)?.grainIn;
	if (typeof override === 'boolean') return override;
	return !!sourceRecipe.value?.grainIn;
});
const totalGrainDisplacementGal = computed(() => {
	const r = sourceRecipe.value;
	if (!r?.items?.length) return 0;
	const lookup = new Map<string, any>();
	for (const it of itemStore.items as any[]) {
		lookup.set(String(it._id), {
			extractType: it.extractType as ExtractType | undefined,
			fermentable: it.fermentable,
			displacement: it.displacement,
		});
	}
	return calcGrainDisplacement(
		r.items.map((i: any) => ({ _id: String(i._id), amount: i.amount, unit: i.unit })),
		lookup,
	);
});
const totalBatchBulkGal = computed(() => {
	let sum = 0;
	for (const v of vesselStore.items as any[]) {
		for (const c of (v.contents || [])) {
			if (String(c.batch) === String(props.batchId)) sum += Number(c.volume) || 0;
		}
	}
	return sum;
});
const showGrainInHint = computed(() => {
	if (!effectiveGrainIn.value) return false;
	if (totalGrainDisplacementGal.value <= 0) return false;
	if (!props.fromStage || !GRAIN_PRESENT_STAGES.has(props.fromStage)) return false;
	// Suppress when source vessel is a still — its contents are pure liquid.
	const sel = props.source.vessel ? vesselStore.items.find(v => v._id === props.source.vessel) : null;
	if (sel && STILL_VESSEL_TYPES.has((sel as any).type)) return false;
	return true;
});
const effectiveVolumeGal = computed(() => {
	if (!showGrainInHint.value) return null;
	const bulkGal = props.source.volume || 0;
	if (bulkGal <= 0) return null;
	const baseBulkGal = totalBatchBulkGal.value > 0 ? totalBatchBulkGal.value : bulkGal;
	const share = Math.min(1, bulkGal / baseBulkGal);
	const lineDispGal = totalGrainDisplacementGal.value * share;
	return getEffectiveLiquidVolume(bulkGal, lineDispGal, true);
});

const selectedVessel = computed(() => {
	if (!props.source.vessel) return null;
	return vesselStore.items.find(v => v._id === props.source.vessel) || null;
});

const slotInfo = computed(() => {
	if (!selectedVessel.value) return null;
	const slot = (selectedVessel.value.contents || []).find((c: any) => String(c.batch) === props.batchId);
	if (!slot) return null;
	// Slot volume is stored in `volumeUnit` (typically gallons). Normalize to
	// canonical wine gallons for the form state, then format with the user's
	// global display preference for the "Available" hint.
	const slotUnit = (slot as any).volumeUnit || 'gallon';
	const availableGallons = convertVolume(slot.volume || 0, slotUnit, 'gallon');
	return {
		volumeAvailableGal: availableGallons,
		proofInferred: (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0),
	};
});

function pickAllAvailable() {
	if (slotInfo.value) {
		emit('update', {
			volume: Number(slotInfo.value.volumeAvailableGal.toFixed(4)),
			proof: slotInfo.value.proofInferred,
		});
	}
}

watch(() => props.source.vessel, (newVesselId) => {
	if (newVesselId && slotInfo.value) {
		// Auto-fill proof from vessel contents on vessel change
		if (!props.source.proof) {
			emit('update', { proof: slotInfo.value.proofInferred });
		}
	}
});

// FormStrengthInput v-model is canonical ABV%. Transfer source state stores
// proof. Bridge with a 2× factor so the user can toggle ABV ↔ proof in the
// inline switcher without changing the underlying schema.
const sourceAbv = computed({
	get: () => (props.source.proof || 0) / 2,
	set: (abv: number | null) => emit('update', { proof: (abv ?? 0) * 2 }),
});

const sourceVolume = computed({
	get: () => props.source.volume,
	set: (v: number | null) => emit('update', { volume: v ?? 0 }),
});
</script>

<template>
	<UCard variant="subtle" class="border border-default/40">
		<template #header>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-arrow-up-right" class="text-primary" />
					<span class="text-sm font-semibold">Source #{{ index + 1 }}</span>
				</div>
				<UButton
					v-if="allowRemove"
					icon="i-lucide-x"
					variant="ghost"
					color="neutral"
					size="xs"
					@click="emit('remove')"
				/>
			</div>
		</template>

		<div class="space-y-3">
			<UFormField label="Vessel" :name="`sources.${index}.vessel`">
				<TransferVesselPicker
					mode="source"
					:batch-id="batchId"
					:allowed-types="allowedTypes"
					:model-value="source.vessel"
					@update:model-value="(v) => emit('update', { vessel: v as string })"
				/>
			</UFormField>

			<div v-if="slotInfo" class="text-xs text-muted flex items-center justify-between">
				<span>
					Available:
					<span class="font-mono">
						{{ u.formatVolume(slotInfo.volumeAvailableGal) }}
						@ {{ u.formatStrength(slotInfo.proofInferred / 2) }}
					</span>
				</span>
				<UButton size="xs" variant="link" color="primary" @click="pickAllAvailable">Use all</UButton>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<UFormField label="Volume" :name="`sources.${index}.volume`">
					<FormVolumeInput v-model="sourceVolume" placeholder="0.00" />
				</UFormField>
				<UFormField label="Strength" :name="`sources.${index}.proof`">
					<FormStrengthInput v-model="sourceAbv" placeholder="0" />
				</UFormField>
			</div>
			<div
				v-if="showGrainInHint && effectiveVolumeGal !== null"
				class="text-xs text-amber-300/80 italic flex items-start gap-1"
				:title="'Grain-in correction: PG on the Transfer record uses this effective volume'"
			>
				<UIcon name="i-lucide-info" class="mt-0.5 shrink-0" />
				<span>~{{ u.formatVolume(effectiveVolumeGal) }} effective (grain displacement subtracted)</span>
			</div>
		</div>
	</UCard>
</template>
