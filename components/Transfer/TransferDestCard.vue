<script setup lang="ts">
import type { TransferDestination } from '~/types/interfaces/Transfer';
import { STAGE_VESSEL_TYPE } from '~/composables/batchPipeline';

const props = defineProps<{
	dest: TransferDestination;
	index: number;
	defaultStage?: string | null;
	allowRemove?: boolean;
	excludeVesselId?: string;
}>();

const emit = defineEmits<{
	update: [Partial<TransferDestination>];
	remove: [];
}>();

const vesselStore = useVesselStore();

const allowedTypes = computed<string[] | undefined>(() => {
	const stage = props.dest.stage || props.defaultStage;
	if (!stage) return undefined;
	const t = STAGE_VESSEL_TYPE[stage];
	return t ? [t] : undefined;
});

const selectedVessel = computed(() => {
	if (!props.dest.vessel) return null;
	return vesselStore.crud.items.value.find(v => v._id === props.dest.vessel) || null;
});

const capacityHint = computed(() => {
	if (!selectedVessel.value) return null;
	const cap = selectedVessel.value.stats?.volume || 0;
	const cur = selectedVessel.value.current?.volume || 0;
	const remaining = Math.max(0, cap - cur);
	const incoming = Number(props.dest.volume) || 0;
	const wouldExceed = incoming > remaining;
	return { capacity: cap, current: cur, remaining, wouldExceed };
});
</script>

<template>
	<UCard variant="subtle" class="border" :class="capacityHint?.wouldExceed ? 'border-warning/60' : 'border-default/40'">
		<template #header>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-arrow-down-right" class="text-success" />
					<span class="text-sm font-semibold">Destination #{{ index + 1 }}</span>
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
			<UFormField label="Vessel" :name="`destinations.${index}.vessel`">
				<TransferVesselPicker
					mode="destination"
					:allowed-types="allowedTypes"
					:exclude-vessel-id="excludeVesselId"
					:model-value="dest.vessel"
					@update:model-value="(v) => emit('update', { vessel: v })"
				/>
			</UFormField>

			<div v-if="capacityHint" class="text-xs text-muted flex items-center justify-between">
				<span>
					Free: <span class="font-mono">{{ capacityHint.remaining.toFixed(1) }} / {{ capacityHint.capacity }} gal</span>
				</span>
				<UBadge v-if="capacityHint.wouldExceed" color="warning" variant="subtle" size="xs">
					Exceeds capacity
				</UBadge>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<UFormField label="Volume (gal)" :name="`destinations.${index}.volume`">
					<UInput
						type="number"
						inputmode="decimal"
						:model-value="dest.volume"
						@update:model-value="(v) => emit('update', { volume: Number(v) || 0 })"
						step="0.01"
						min="0"
						placeholder="0.00"
					/>
				</UFormField>
				<UFormField label="Proof" :name="`destinations.${index}.proof`">
					<UInput
						type="number"
						inputmode="decimal"
						:model-value="dest.proof"
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
