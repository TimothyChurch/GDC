<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const destinationVessel = ref();

const transfer = ref({
	volume: 0 as unknown as number,
	volumeUnit: undefined as unknown as string,
	abv: 0 as unknown as number,
	value: undefined as unknown as number,
});

const value: Ref<number> = computed(() => {
	const val = vesselStore.vessel.contents?.reduce(
		(sum, batch) => sum + batch.value,
		0
	) || 0;
	const volume = vesselStore.vessel.contents?.reduce(
		(sum, batch) => sum + batch.volume,
		0
	) || 0;
	if (volume <= 0) return 0;
	const valueUnit = val / volume;
	const newValue = transfer.value.volume * valueUnit;
	transfer.value.value = newValue;
	return newValue;
});

const onFullTransfer = async () => {
	if (!vesselStore.vessel._id || !destinationVessel.value?._id) return;
	await vesselStore.fullTransfer(vesselStore.vessel._id, destinationVessel.value._id);
};

const onPartialTransfer = async () => {
	if (!vesselStore.vessel._id || !destinationVessel.value?._id) return;
	await vesselStore.transferBatch(
		vesselStore.vessel._id,
		destinationVessel.value._id,
		transfer.value
	);
};
</script>

<template>
	<div>
		<USelectMenu
			v-model="vesselStore.vessel"
			:options="vesselStore.vessels"
			placeholder="Select a vessel"
			option-attribute="name" />
		<div class="flex gap-3 mt-4">
			<UCard>
				<template #header>
					<h1>Source Vessel: {{ vesselStore.vessel.name }}</h1>
				</template>
				<h1 class="font-bold text-lg">Initial Fill</h1>
				<div v-for="batch in vesselStore.vessel.contents" :key="batch.batch">
					<div>
						Recipe:
						{{
							recipeStore.getRecipeById(
								batchStore
									.getBatchById(batch.batch.toString())
									?.recipe.toString() as string
							)?.name
						}}
					</div>
					<div>Volume: {{ batch.volume }} {{ batch.volumeUnit }}</div>
					<div>Value: {{ Dollar.format(batch.value) }}</div>
				</div>
				<h1 class="font-bold text-lg">Current Fill</h1>
				<div>
					Volume: {{ vesselStore.vessel.current?.volume }}
					{{ vesselStore.vessel.current?.volumeUnit }}
				</div>
				<div>Value: {{ Dollar.format(vesselStore.vessel.current?.value) }}</div>
			</UCard>
			<UCard>
				<template #header>
					<div class="flex gap-3 justify-between">
						<h1>Destination Vessel:</h1>
						<USelectMenu
							v-model="destinationVessel"
							:options="vesselStore.vessels"
							placeholder="Select a vessel"
							option-attribute="name"
							searchable />
					</div>
				</template>
				<div class="flex flex-col gap-3">
					<UButton @click="onFullTransfer">Full Transfer</UButton>
					<UInput
						v-model="transfer.volume"
						type="number"
						placeholder="Transfer amount" />
					<USelect
						v-model="transfer.volumeUnit"
						:options="volumeUnits"
						placeholder="Transfer unit" />
					<div>
						{{ Dollar.format(value) }}
					</div>
					<UButton @click="onPartialTransfer">Transfer</UButton>
				</div>
			</UCard>
		</div>
	</div>
</template>
