<script setup lang="ts">
import { Line } from 'vue-chartjs';

const batchStore = useBatchStore();
const vesselStore = useVesselStore();
// Chart data setup
const sortedReadings = computed(() => {
	const readings = batchStore.batch?.fermenting.readings;
	return readings?.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);
});

const chartData = computed(() => {
	return {
		labels: sortedReadings.value?.map((reading: { date: Date }) =>
			new Date(reading.date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
			})
		),
		datasets: [
			{
				label: 'Gravity',
				data: sortedReadings.value?.map(
					(reading: { gravity: number }) => reading.gravity
				),
			},
		],
	};
});
const chartOptions = ref({
	responsive: true,
	maintainAspectRatio: false,
});
// Add Readings Modal
const isOpen = ref(false);
const newReading = ref({
	date: new Date(),
	temperature: undefined as unknown as number,
	temperatureUnit: 'C',
	gravity: undefined as unknown as number,
});

// Add Reading Modal Action
const addReading = () => {
	batchStore.batch?.fermenting.readings.push(newReading.value);
	batchStore.updateBatch();
	isOpen.value = false;
};
</script>

<template>
	<div>
		<UCard>
			<template #header>
				<div class="flex justify-between">
					<h3>
						{{
							vesselStore.getVesselById(
								batchStore.batch?.fermenting?.vessel as unknown as string
							)?.name
						}}
					</h3>
					<h1 v-if="sortedReadings?.length > 0">
						{{
							(
								(sortedReadings[0]?.gravity -
									sortedReadings[sortedReadings.length - 1]?.gravity) *
								131.25
							).toFixed(2)
						}}%
					</h1>
					<UButton
						variant="ghost"
						icon="i-heroicons-plus"
						color="gray"
						@click="isOpen = true"
						>Add Reading</UButton
					>
				</div>
			</template>
			<!-- Additional content goes here -->
			<div>
				<Line
					:data="chartData"
					:options="chartOptions" />
			</div>
		</UCard>
		<UModal
			v-model="isOpen"
			:ui="{ width: 'sm:max-w-full w-auto' }">
			<UFormGroup
				label="New Reading"
				class="p-3">
				<div class="flex gap-3 p-3 w-full">
					<SiteDatePicker v-model="newReading.date" />
					<UInput
						v-model="newReading.gravity"
						type="number"
						placeholder="Enter gravity reading" />
					<UInput
						v-model="newReading.temperature"
						type="number"
						placeholder="Enter temperature reading" />
					<USelect
						v-model="newReading.temperatureUnit"
						:options="['C', 'F']"
						placeholder="Select temperature unit" />
					<UButton @click="addReading">Add</UButton>
				</div>
			</UFormGroup>
		</UModal>
	</div>
</template>
