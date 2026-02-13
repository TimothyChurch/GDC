<script setup>
const productionStore = useProductionStore();
const bottleStore = useBottleStore();

const recentProductions = computed(() => {
	return [...productionStore.productions]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);
});
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Recent Productions</h1>
		<div v-if="recentProductions.length === 0" class="text-sm text-neutral-500 py-4">
			No production records
		</div>
		<div v-else class="flex flex-col gap-2 mt-2">
			<UCard v-for="prod in recentProductions" :key="prod._id" class="text-sm">
				<div class="flex justify-between items-center">
					<div class="font-medium">{{ bottleStore.getName(prod.bottle) }}</div>
					<UBadge color="neutral" variant="subtle">{{ prod.quantity }} bottles</UBadge>
				</div>
				<div class="text-neutral-500 text-xs mt-1">
					{{ new Date(prod.date).toLocaleDateString() }}
				</div>
			</UCard>
		</div>
	</div>
</template>
