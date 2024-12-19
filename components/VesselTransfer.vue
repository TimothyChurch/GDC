<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const destinationVessel = ref();
// TODO Add ability for transfer units to be different

const transfer = ref({
	volume: 0 as unknown as number,
	volumeUnit: undefined as unknown as string,
	abv: 0 as unknown as number,
	value: undefined as unknown as number,
});

const value: Ref<number> = computed(() => {
	const value = vesselStore.vessel.contents.reduce(
		(sum, batch) => sum + batch.value,
		0
	);
	const volume = vesselStore.vessel.contents.reduce(
		(sum, batch) => sum + batch.volume,
		0
	);
	const valueUnit = value / volume;
	const newValue = transfer.value.volume * valueUnit;
	transfer.value.value = newValue;
	return newValue;
});
</script>

<template>
	<div>
		<USelectMenu
			v-model="vesselStore.vessel"
			:options="vesselStore.vessels"
			placeholder="Select a vessel"
			option-attribute="name" />
		{{ transfer }}
		<div class="flex gap-3">
			<UCard>
				<template #header>
					<h1>Source Vessel: {{ vesselStore.vessel.name }}</h1>
				</template>
				<h1 class="font-bold text-lg">Initial Fill</h1>
				<div v-for="batch in vesselStore.vessel.contents">
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
					<UButton
						@click="fullTransfer(vesselStore.vessel._id, destinationVessel._id)"
						>Full Transfer</UButton
					>
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
					<UButton
						@click="
							transferBatch(
								vesselStore.vessel._id,
								destinationVessel._id,
								transfer
							)
						"
						>Transfer</UButton
					>
				</div>
			</UCard>
		</div>
	</div>
</template>
