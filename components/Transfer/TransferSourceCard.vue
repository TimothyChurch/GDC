<script setup lang="ts">
import type { TransferSource } from '~/types/interfaces/Transfer';

const props = defineProps<{
	source: TransferSource;
	batchId: string;
	index: number;
	allowRemove?: boolean;
}>();

const emit = defineEmits<{
	update: [Partial<TransferSource>];
	remove: [];
}>();

const vesselStore = useVesselStore();

const selectedVessel = computed(() => {
	if (!props.source.vessel) return null;
	return vesselStore.crud.items.value.find(v => v._id === props.source.vessel) || null;
});

const slotInfo = computed(() => {
	if (!selectedVessel.value) return null;
	const slot = (selectedVessel.value.contents || []).find((c: any) => String(c.batch) === props.batchId);
	if (!slot) return null;
	return {
		volumeAvailable: slot.volume,
		proofInferred: (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0),
	};
});

function pickAllAvailable() {
	if (slotInfo.value) {
		emit('update', {
			volume: slotInfo.value.volumeAvailable,
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
					:model-value="source.vessel"
					@update:model-value="(v) => emit('update', { vessel: v as string })"
				/>
			</UFormField>

			<div v-if="slotInfo" class="text-xs text-muted flex items-center justify-between">
				<span>Available: <span class="font-mono">{{ slotInfo.volumeAvailable.toFixed(2) }} gal @ {{ slotInfo.proofInferred.toFixed(0) }} proof</span></span>
				<UButton size="xs" variant="link" color="primary" @click="pickAllAvailable">Use all</UButton>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<UFormField label="Volume (gal)" :name="`sources.${index}.volume`">
					<UInput
						type="number"
						inputmode="decimal"
						:model-value="source.volume"
						@update:model-value="(v) => emit('update', { volume: Number(v) || 0 })"
						step="0.01"
						min="0"
						placeholder="0.00"
					/>
				</UFormField>
				<UFormField label="Proof" :name="`sources.${index}.proof`">
					<UInput
						type="number"
						inputmode="decimal"
						:model-value="source.proof"
						@update:model-value="(v) => emit('update', { proof: Number(v) || 0 })"
						step="0.1"
						min="0"
						max="200"
						placeholder="0"
					/>
				</UFormField>
			</div>
		</div>
	</UCard>
</template>
