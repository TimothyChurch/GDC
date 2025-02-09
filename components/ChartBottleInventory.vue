<script setup lang="ts">
import { Line } from 'vue-chartjs';

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
	maintainAspectRatio: true,
});
</script>

<template>
	<div>
		<h1>Chart page</h1>
		<Line
			:data="chartData"
			:options="chartOptions" />
	</div>
</template>
