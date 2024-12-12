<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const batches = (id) => {
	return batchStore.fermentingBatches.find(
		(batch) => batch.fermenting.vessel == id
	);
};
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Fermenters</h1>
		<div class="grid grid-flow-col auto-cols-auto gap-3">
			<div v-for="fermenter in vesselStore.fermenters">
				<UCard>
					<template #header>
						<h2>{{ fermenter.name }}</h2>
					</template>
					<DashboardBatchCard
						v-if="batches(fermenter._id)"
						:batchId="batches(fermenter._id)?._id" />
					<div v-else>Empty</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
