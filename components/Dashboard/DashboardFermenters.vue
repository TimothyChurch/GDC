<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const items = computed(() => {
	return [
		vesselStore.stills.map((still) => {
			return {
				label: still.name,
				value: still._id,
			};
		}),
	];
});

const startDistilling = async (fermenterId, stillId) => {
	const fermenter = vesselStore.getVesselById(fermenterId);
	const batchIds = fermenter?.contents?.map((c) => c.batch) || [];

	await vesselStore.fullTransfer(fermenterId, stillId);

	for (const batchId of batchIds) {
		await batchStore.advanceBatchStatus(batchId, 'Distilling', {
			vessel: stillId,
			date: new Date(),
		});
	}
};
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Fermenters</h1>
		<div v-if="vesselStore.fermenters.length === 0" class="text-sm text-neutral-500 py-4">
			No fermenters configured
		</div>
		<div v-else class="grid grid-flow-col auto-cols-auto gap-3">
			<div v-for="fermenter in vesselStore.fermenters" :key="fermenter._id">
				<UCard>
					<template #header>
						<div class="flex justify-between">
							<h1>{{ fermenter.name }}</h1>
							<h1>
								{{
									recipeStore.getRecipeById(
										batchStore.getBatchById(fermenter.contents?.[0]?.batch)
											?.recipe
									)?.name
								}}
							</h1>
						</div>
					</template>
					<div v-if="!fermenter.contents || fermenter.contents.length === 0" class="text-sm text-neutral-500">
						Empty
					</div>
					<div v-else class="flex flex-col gap-3 items-center">
						<div v-for="content in fermenter.contents" :key="content.batch" class="text-sm">
							<span>{{ content.volume }} {{ content.volumeUnit }}</span>
						</div>
						<UDropdown :items="items">
							<UButton
								color="neutral"
								variant="outline"
								>Start Distilling</UButton
							>
							<template #item="{ item }">
								<UButton
									color="neutral"
									variant="ghost"
									class="w-full"
									@click="startDistilling(fermenter._id, item.value)"
									>{{ item.label }}</UButton
								>
							</template>
						</UDropdown>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>
