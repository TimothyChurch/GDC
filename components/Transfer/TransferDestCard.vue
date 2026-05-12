<script setup lang="ts">
import type { TransferDestination } from '~/types/interfaces/Transfer';
import { STAGE_VESSEL_TYPE } from '~/composables/batchPipeline';
import { convertVolume } from '~/server/utils/unitConverter';

const props = withDefaults(defineProps<{
	dest: TransferDestination;
	index: number;
	defaultStage?: string | null;
	allowRemove?: boolean;
	excludeVesselId?: string;
	/** When true the card shows a required-vessel error state. Set by the parent
	 *  for transfer types where the destination must reference a real vessel
	 *  (everything except destruction/withdrawal/sample/tib_out). */
	vesselRequired?: boolean;
}>(), { vesselRequired: false });

const emit = defineEmits<{
	update: [Partial<TransferDestination>];
	remove: [];
}>();

const vesselStore = useVesselStore();
const u = useDisplayUnits();

const allowedTypes = computed<string[] | undefined>(() => {
	const stage = props.dest.stage || props.defaultStage;
	if (!stage) return undefined;
	const t = STAGE_VESSEL_TYPE[stage];
	return t ? [t] : undefined;
});

const selectedVessel = computed(() => {
	if (!props.dest.vessel) return null;
	return vesselStore.items.find(v => v._id === props.dest.vessel) || null;
});

const capacityHint = computed(() => {
	if (!selectedVessel.value) return null;
	const statsUnit = selectedVessel.value.stats?.volumeUnit || 'gallon';
	const currentUnit = selectedVessel.value.current?.volumeUnit || statsUnit;
	const cap = convertVolume(selectedVessel.value.stats?.volume || 0, statsUnit, 'gallon');
	const cur = convertVolume(selectedVessel.value.current?.volume || 0, currentUnit, 'gallon');
	const remaining = Math.max(0, cap - cur);
	const incoming = Number(props.dest.volume) || 0;  // already in gallons (canonical)
	const wouldExceed = incoming > remaining;
	return { capacityGal: cap, remainingGal: remaining, wouldExceed };
});

const destAbv = computed({
	get: () => (props.dest.proof || 0) / 2,
	set: (abv: number | null) => emit('update', { proof: (abv ?? 0) * 2 }),
});

const destVolume = computed({
	get: () => props.dest.volume,
	set: (v: number | null) => emit('update', { volume: v ?? 0 }),
});

const vesselMissing = computed(() => props.vesselRequired && !props.dest.vessel);
</script>

<template>
	<UCard variant="subtle" class="border" :class="vesselMissing ? 'border-error/60' : capacityHint?.wouldExceed ? 'border-warning/60' : 'border-default/40'">
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
			<UFormField
				label="Vessel"
				:name="`destinations.${index}.vessel`"
				:error="vesselMissing ? 'Destination vessel is required' : undefined"
				:required="vesselRequired"
			>
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
					Free:
					<span class="font-mono">
						{{ u.formatVolume(capacityHint.remainingGal) }} / {{ u.formatVolume(capacityHint.capacityGal) }}
					</span>
				</span>
				<UBadge v-if="capacityHint.wouldExceed" color="warning" variant="subtle" size="xs">
					Exceeds capacity
				</UBadge>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<UFormField label="Volume" :name="`destinations.${index}.volume`">
					<FormVolumeInput v-model="destVolume" placeholder="0.00" />
				</UFormField>
				<UFormField label="Strength" :name="`destinations.${index}.proof`">
					<FormStrengthInput v-model="destAbv" placeholder="0" />
				</UFormField>
			</div>
		</div>
	</UCard>
</template>
