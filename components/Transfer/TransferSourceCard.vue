<script setup lang="ts">
import type { TransferSource } from '~/types/interfaces/Transfer';
import { convertVolume } from '~/server/utils/unitConverter';

const props = withDefaults(defineProps<{
	source: TransferSource;
	batchId: string;
	index: number;
	allowRemove?: boolean;
	allowedTypes?: string[];   // restrict picker to these vessel types
}>(), {});

const emit = defineEmits<{
	update: [Partial<TransferSource>];
	remove: [];
}>();

const vesselStore = useVesselStore();
const u = useDisplayUnits();

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
		</div>
	</UCard>
</template>
