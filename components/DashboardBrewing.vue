<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Brewing</h1>
		<div class="flex">
			<div v-for="mashTun in vesselStore.mashTuns">
				<UCard>
					<template #header>
						{{ mashTun.name }}
					</template>
					<DashboardBatchCard
						:batchId="
							batchStore.brewingBatches.find(
								(batch) => batch.brewing.vessel == mashTun._id
							)?._id
						" />
				</UCard>
			</div>
		</div>
	</div>
</template>
