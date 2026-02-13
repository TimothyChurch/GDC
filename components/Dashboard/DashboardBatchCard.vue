<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const props = defineProps(['batchId']);

const batch = computed(() => batchStore.getBatchById(props.batchId));
</script>

<template>
	<UCard v-if="batch">
		<template #header>
			{{ recipeStore.getRecipeById(batch?.recipe)?.name || 'Unknown Recipe' }}
		</template>
		<div class="flex flex-col gap-1 text-sm">
			<div class="flex justify-between">
				<span class="text-neutral-500">Status:</span>
				<UBadge :color="batch.status === 'Upcoming' ? 'info' : batch.status === 'Brewing' ? 'warning' : 'success'" variant="subtle">
					{{ batch.status }}
				</UBadge>
			</div>
			<div class="flex justify-between">
				<span class="text-neutral-500">Size:</span>
				<span>{{ batch.batchSize }} {{ batch.batchSizeUnit }}</span>
			</div>
			<div v-if="batch.batchCost" class="flex justify-between">
				<span class="text-neutral-500">Cost:</span>
				<span>{{ Dollar.format(batch.batchCost) }}</span>
			</div>
			<div v-if="batch.brewing?.date" class="flex justify-between">
				<span class="text-neutral-500">Brew Date:</span>
				<span>{{ new Date(batch.brewing.date).toLocaleDateString() }}</span>
			</div>
		</div>
	</UCard>
</template>
