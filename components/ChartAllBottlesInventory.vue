<script setup lang="ts">
import { Line } from 'vue-chartjs';
useChartRegistration();

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
