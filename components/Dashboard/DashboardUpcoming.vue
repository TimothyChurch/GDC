<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const items = computed(() => {
	return [
		vesselStore.mashTuns.map((vessel) => {
			return {
				label: vessel.name,
				_id: vessel._id,
			};
		}),
	];
});

const onStartBrewing = async (batchId, vesselId) => {
	await batchStore.startBrewing(batchId, vesselId);
};
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Upcoming Batches</h1>
		<div v-if="batchStore.upcomingBatches.length === 0" class="text-sm text-neutral-500 py-4">
			No upcoming batches
		</div>
		<div v-else class="flex gap-3">
			<div v-for="batch in batchStore.upcomingBatches" :key="batch._id">
				<div class="flex flex-col items-center gap-2">
					<DashboardBatchCard :batchId="batch._id" />
					<UDropdown :items="items">
						<UButton>Start Brewing</UButton>
						<template #item="{ item }">
							<div @click="onStartBrewing(batch._id, item._id)">
								{{ item.label }}
							</div>
						</template>
					</UDropdown>
				</div>
			</div>
		</div>
	</div>
</template>
