<script setup>
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const items = computed(() => {
	return [
		vesselStore.fermenters.map((fermenter) => {
			return {
				label: fermenter.name,
				value: fermenter._id,
			};
		}),
	];
});

const mashTunsWithContents = computed(() =>
	vesselStore.mashTuns.filter((mt) => mt.contents && mt.contents.length > 0)
);

const moveToFermenter = async (mashTunId, fermenterId) => {
	// Get batch IDs from mash tun contents before transfer
	const mashTun = vesselStore.getVesselById(mashTunId);
	const batchIds = mashTun?.contents?.map((c) => c.batch) || [];

	await vesselStore.fullTransfer(mashTunId, fermenterId);

	// Advance each batch to Fermenting
	for (const batchId of batchIds) {
		await batchStore.advanceBatchStatus(batchId, 'Fermenting', {
			vessel: fermenterId,
			date: new Date(),
		});
	}
};
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Brewing</h1>
		<div v-if="vesselStore.mashTuns.length === 0" class="text-sm text-neutral-500 py-4">
			No mash tuns configured
		</div>
		<div v-else class="flex gap-3">
			<div v-for="mashTun in vesselStore.mashTuns" :key="mashTun._id">
				<UCard>
					<template #header>
						{{ mashTun.name }}
					</template>
					<div v-if="!mashTun.contents || mashTun.contents.length === 0" class="text-sm text-neutral-500">
						Empty
					</div>
					<div v-for="content in mashTun.contents" :key="content.batch">
						<div class="flex flex-col gap-3 items-center">
							<DashboardBatchCard :batchId="content.batch" />
							<UDropdown :items="items">
								<UButton
									color="neutral"
									variant="outline"
									>Move to Fermenter</UButton
								>
								<template #item="{ item }">
									<UButton
										color="neutral"
										variant="ghost"
										@click="moveToFermenter(mashTun._id, item.value)"
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
