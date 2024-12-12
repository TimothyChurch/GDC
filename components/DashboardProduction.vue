<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();
</script>

<template>
	<div>
		<UContainer>
			<div>
				<h1 class="font-bold text-xl">Upcoming</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div
						v-for="batch in batchStore.batches.filter(
							(batch) => batch.status?.stage === 'Upcoming'
						)">
						<DashboardBatchCard :batchId="batch._id" />
					</div>
				</div>
			</div>
			<div>
				<h1 class="font-bold text-xl">Brewing</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div
						v-for="vessel in vesselStore.vessels.filter(
							(vessel) => vessel.type.toLowerCase() === 'mash tun'
						)">
						<UCard>
							<template #header>
								<div class="text-center">
									{{ vessel.name }}
								</div>
							</template>
							<div>
								<h1>
									Current Batch: {{ batchStore.getBatchByStatus('Brewing') }}
								</h1>
							</div>
						</UCard>
					</div>
				</div>
			</div>
			<div>
				<h1 class="font-bold text-xl">Fermenting</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div v-for="fermenter in vesselStore.fermenters">
						{{ fermenter.name }}
					</div>
				</div>
			</div>
			<div>
				<h1 class="font-bold text-xl">Distilling</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div v-for="still in vesselStore.stills">
						{{ still.name }}
						{{ recipeStore }}
					</div>
				</div>
			</div>
			<div>
				<h1 class="font-bold text-xl">Storage</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div v-for="tank in vesselStore.tanks">
						{{ tank.name }}
					</div>
				</div>
			</div>
			<div>
				<h1 class="font-bold text-xl">Barreled</h1>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<div v-for="barrel in vesselStore.barrels">
						{{ barrel.name }}
					</div>
				</div>
			</div>
		</UContainer>
	</div>
</template>
