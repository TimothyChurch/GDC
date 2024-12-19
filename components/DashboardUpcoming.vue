<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const selectedBatch = ref(null);

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
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Upcoming Batches</h1>
		<div class="flex gap-3">
			<div v-for="batch in batchStore.upcomingBatches">
				<div class="flex flex-col items-center gap-2">
					<DashboardBatchCard :batchId="batch._id" />
					<UDropdown :items="items">
						<UButton @click="selectedBatch = batch">Start Brewing</UButton>
						<template #item="{ item }">
							<div @click="startBrewing(batch._id, item._id)">
								{{ item.label }}
							</div>
						</template>
					</UDropdown>
				</div>
			</div>
		</div>
	</div>
</template>
