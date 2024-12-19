<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const batches = (id) => {
	return batchStore.fermentingBatches.find(
		(batch) => batch.fermenting.vessel == id
	);
};
const items = computed(() => {
	return [
		vesselStore.stills.map((stills) => {
			return {
				label: stills.name,
				value: stills._id,
			};
		}),
	];
});
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
					<div v-for="content in fermenter.contents">
						<div class="flex flex-col gap-3 items-center">
							<DashboardBatchCard :batchId="content.batch" />
							<UDropdown :items="items">
								<UButton
									color="black"
									variant="outline"
									>Start Distilling</UButton
								>
								<template #item="{ item }">
									<UButton
										color="black"
										variant="ghost"
										class="w-full"
										@click="fullTransfer(fermenter._id, item.value)"
										>{{ item.label }}</UButton
									>
								</template>
							</UDropdown>
						</div>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
