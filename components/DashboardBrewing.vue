<script setup>
const vesselStore = useVesselStore();

const selectedBatch = ref(null);

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
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Brewing</h1>
		<div class="flex">
			{{ vesselStore.mashTuns.map((m) => m._id) }}
			<div v-for="mashTun in vesselStore.mashTuns">
				<UCard>
					<template #header>
						{{ mashTun.name }}
					</template>
					<div v-for="batch in mashTun.contents">
						<div class="flex flex-col gap-3 items-center">
							<DashboardBatchCard :batchId="batch.batch" />
							<UDropdown :items="items">
								<UButton
									color="black"
									variant="outline"
									@click="selectedBatch = batch"
									>Move to Fermenter</UButton
								>
								<template #item="{ item }">
									<UButton
										color="gray"
										variant="ghost"
										@click="fullTransfer(mashTun._id, item.value)"
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
