<script setup>
const vesselStore = useVesselStore();
const batchStore = useBatchStore();

const batches = (id) => {
	return batchStore.distillingBatches.find(
		(batch) => batch.distilling.vessel == id
	)?._id;
};
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Distilling</h1>
		<div class="flex gap-3">
			<div v-for="still in vesselStore.stills">
				<UCard>
					<template #header>
						<h2>{{ still.name }}</h2>
					</template>
					<div v-for="content in still.contents">
						<DashboardBatchCard :batchId="content.batch" />
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
