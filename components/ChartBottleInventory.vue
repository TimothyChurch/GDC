<script setup lang="ts">
import { Line } from 'vue-chartjs';
useChartRegistration();

const route = useRoute();
const inventoryStore = useInventoryStore();

const sortedInventory = computed(() => {
	const inventory = inventoryStore.getInventoriesByItemId(
		route.params._id as string
	);
	return inventory?.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);
});

const chartData = computed(() => {
	return {
		labels: sortedInventory.value?.map((reading: { date: Date }) =>
			new Date(reading.date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
			})
		),
		datasets: [
			{
				label: 'Inventory',
				data: sortedInventory.value?.map(
					(i) => i.items[route.params._id as string]
				),
			},
		],
	};
});
const chartOptions = ref({
	responsive: true,
	maintainAspectRatio: false,
});
</script>

<template>
	<div class="w-full h-80 md:h-96">
		<div v-if="inventoryStore.loading" class="flex items-center justify-center h-full text-neutral-500">
			Loading chart data...
		</div>
		<Line
			v-else
			:data="chartData"
			:options="chartOptions" />
	</div>
</template>
