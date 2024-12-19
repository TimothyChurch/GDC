<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const selectedBatch = ref(null);

const items = computed(() => {
	return [
		vesselStore.mashTuns.map((vessel) => {
			return {
				label: vessel.name,
				id: vessel._id,
			};
		}),
	];
});

const startBrewing = (id) => {
	console.log(id);
	vesselStore.vessel = vesselStore.vessels.find((vessel) => vessel._id == id);
	vesselStore.vessel.contents.push({
		batch: selectedBatch.value._id,
		volume: selectedBatch.value.batchSize,
		volumeUnit: selectedBatch.value.batchSizeUnit,
		abv: undefined,
		value: selectedBatch.value.batchCost,
	});
	batchStore.batch = batchStore.getBatchById(selectedBatch.value._id);
	batchStore.batch.status = 'Brewing';
	batchStore.updateBatch();
	vesselStore.updateVessel();
};
</script>

<template>
	<div>
		{{ vesselStore.vessel }}
		<h1 class="font-bold text-xl">Upcoming Batches</h1>
		<div class="flex gap-3">
			<div v-for="batch in batchStore.upcomingBatches">
				<DashboardBatchCard :batchId="batch._id" />
				<UDropdown :items="items">
					<UButton @click="selectedBatch = batch">Start Brewing</UButton>
					<template #item="{ item }">
						<div @click="startBrewing(item.id)">{{ item.label }} test</div>
					</template>
				</UDropdown>
			</div>
		</div>
	</div>
</template>
