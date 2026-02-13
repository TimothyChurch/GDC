<script setup>
const vesselStore = useVesselStore();
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Distilling</h1>
		<div v-if="vesselStore.stills.length === 0" class="text-sm text-neutral-500 py-4">
			No stills configured
		</div>
		<div v-else class="flex gap-3">
			<div v-for="still in vesselStore.stills" :key="still._id">
				<UCard>
					<template #header>
						<h2>{{ still.name }}</h2>
					</template>
					<div v-if="!still.contents || still.contents.length === 0" class="text-sm text-neutral-500">
						Empty
					</div>
					<div v-for="content in still.contents" :key="content.batch">
						<DashboardBatchCard :batchId="content.batch" />
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
