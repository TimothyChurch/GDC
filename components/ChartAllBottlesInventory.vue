<script setup lang="ts">
import { Line } from 'vue-chartjs';

const route = useRoute();
const inventoryStore = useInventoryStore();
const bottleStore = useBottleStore();

const data = computed(() => {
	return bottleStore.bottles.map((bottle) => {
		return {
			label: bottle.name,
			data: inventoryStore
				.getInventoriesByItemId(bottle._id.toString())
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
				.map((i) => i.items[bottle._id.toString()]),
		};
	});
});

const chartData = computed(() => {
	return {
		labels: inventoryStore.inventories?.map((i) =>
			new Date(i.date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
			})
		),
		datasets: data.value,
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
