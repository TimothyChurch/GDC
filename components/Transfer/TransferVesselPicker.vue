<script setup lang="ts">
import type { Vessel } from '~/types';

/**
 * Multi-vessel-aware picker with capacity awareness and batch-occupancy info.
 *
 * Modes:
 *   - mode='source' + batchId: only vessels currently containing the batch
 *   - mode='destination' + stageType: only vessels of compatible type
 *   - mode='any': all vessels
 *
 * Fixes Bugs 4.1, 4.2 — surfaces ALL vessels containing the batch
 * (no more single-vessel assumption from `getCurrentVesselId()`).
 */
const props = defineProps<{
	modelValue: string | null;
	mode: 'source' | 'destination' | 'any';
	batchId?: string;
	allowedTypes?: string[];     // e.g., ['Fermenter'] for destination = Fermenting stage
	excludeVesselId?: string;    // e.g., the source vessel when picking a destination
	placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [string | null] }>();

const vesselStore = useVesselStore();

const candidates = computed<Vessel[]>(() => {
	let list = vesselStore.crud.items.value || [];

	// Type filter
	if (props.allowedTypes?.length) {
		list = list.filter((v) => props.allowedTypes!.includes(v.type));
	}

	// Mode filters
	if (props.mode === 'source' && props.batchId) {
		list = list.filter((v) =>
			(v.contents || []).some((c: any) => String(c.batch) === props.batchId && c.volume > 0),
		);
	}

	// Exclusions
	if (props.excludeVesselId) {
		list = list.filter((v) => v._id !== props.excludeVesselId);
	}

	return list;
});

const items = computed(() =>
	candidates.value.map((v) => {
		const slot = props.batchId
			? (v.contents || []).find((c: any) => String(c.batch) === props.batchId)
			: undefined;
		const slotVolume = slot?.volume || 0;
		const slotProof = (slot as any)?.proof ?? (slot?.abv != null ? slot.abv * 2 : 0);
		const totalVolume = (v.current?.volume) || 0;
		const capacity = v.stats?.volume || 0;
		const remaining = Math.max(0, capacity - totalVolume);
		const used = capacity > 0 ? Math.min(100, (totalVolume / capacity) * 100) : 0;

		const description = props.mode === 'source'
			? `${slotVolume} gal @ ${slotProof.toFixed(0)} proof · ${v.location || ''}`
			: capacity > 0
				? `Capacity: ${totalVolume.toFixed(1)} / ${capacity} gal · ${remaining.toFixed(1)} gal free`
				: (v.location || '—');

		return {
			label: v.name,
			value: v._id,
			description,
			icon: vesselTypeIcon(v.type),
			slotVolume,
			slotProof,
			usedPct: used,
			capacity,
			remaining,
		};
	}),
);

function vesselTypeIcon(type: string) {
	switch (type) {
		case 'Fermenter': return 'i-lucide-flask-conical';
		case 'Mash Tun': return 'i-lucide-pot-of-food';
		case 'Still': return 'i-lucide-flame';
		case 'Tank': return 'i-lucide-cylinder';
		case 'Barrel': return 'i-lucide-barrel';
		default: return 'i-lucide-circle';
	}
}

const value = computed({
	get: () => props.modelValue,
	set: (v) => emit('update:modelValue', v),
});

const placeholder = computed(() => {
	if (props.placeholder) return props.placeholder;
	if (props.mode === 'source' && props.batchId && candidates.value.length === 0) {
		return 'No vessels contain this batch';
	}
	return props.mode === 'source' ? 'Select source vessel…' : 'Select destination vessel…';
});
</script>

<template>
	<USelectMenu
		v-model="value"
		:items="items"
		value-key="value"
		:placeholder="placeholder"
		searchable
		class="w-full"
	>
		<template #item="{ item }">
			<div class="flex items-center justify-between w-full gap-3">
				<div class="flex items-center gap-2 min-w-0">
					<UIcon :name="item.icon" class="text-muted shrink-0" />
					<div class="min-w-0">
						<div class="truncate font-medium">{{ item.label }}</div>
						<div class="text-xs text-muted truncate">{{ item.description }}</div>
					</div>
				</div>
				<div v-if="mode === 'destination' && item.capacity > 0" class="shrink-0 w-20">
					<UProgress :model-value="item.usedPct" size="xs" :color="item.usedPct > 90 ? 'error' : item.usedPct > 70 ? 'warning' : 'success'" />
				</div>
			</div>
		</template>
	</USelectMenu>
</template>
