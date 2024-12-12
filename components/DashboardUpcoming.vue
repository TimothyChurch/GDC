<script setup>
const batchStore = useBatchStore();
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Upcoming Batches</h1>
		<div class="flex gap-3">
			<div v-for="batch in batchStore.upcomingBatches">
				<DashboardBatchCard :batchId="batch._id" />
			</div>
		</div>
	</div>
</template>
