<script setup>
const vesselStore = useVesselStore();
const batchStore = useBatchStore();

const destinationVessel = ref(null);
const transferVolume = ref(0);
const transferUnit = ref('gallon');

const availableDestinations = computed(() =>
	vesselStore.vessels.filter((v) => v._id !== vesselStore.vessel._id)
);

const onFullTransfer = async () => {
	if (!vesselStore.vessel._id || !destinationVessel.value?._id) return;
	await vesselStore.fullTransfer(vesselStore.vessel._id, destinationVessel.value._id);
	destinationVessel.value = null;
};

const onPartialTransfer = async () => {
	if (!vesselStore.vessel._id || !destinationVessel.value?._id || !transferVolume.value) return;
	await vesselStore.transferBatch(vesselStore.vessel._id, destinationVessel.value._id, {
		volume: transferVolume.value,
		volumeUnit: transferUnit.value,
		abv: 0,
		value: 0,
	});
	transferVolume.value = 0;
	destinationVessel.value = null;
};
</script>

<template>
	<div class="flex-grow">
		<div class="grid grid-cols-2 gap-3">
			<UCard>
				<template #header> Origin </template>
				<div v-if="vesselStore.vessel.name">
					Vessel: {{ vesselStore.vessel.name }}
					<UButton
						@click="vesselStore.resetVessel()"
						color="neutral"
						icon="i-lucide-x"
						variant="ghost"
						class="p-0.5 m-0 align-bottom" />
				</div>
				<div
					v-else
					class="flex gap-3">
					<span> Vessel: </span>
					<USelectMenu
						v-model="vesselStore.vessel"
						:options="vesselStore.vessels"
						option-attribute="name"
						class="flex-grow" />
				</div>
				<div v-for="content in vesselStore.vessel.contents" :key="content.batch">
					<div>
						Batch: {{ batchStore.getRecipeNameByBatchId(content.batch) }}
					</div>
					<div>Quantity: {{ content.volume }} {{ content.volumeUnit }}</div>
					<div>ABV: {{ content.abv }}</div>
					<div>Value: {{ Dollar.format(content.value) }}</div>
				</div>
			</UCard>
			<UCard>
				<template #header> Destination </template>
				<div class="flex flex-col gap-3">
					<USelectMenu
						v-model="destinationVessel"
						:options="availableDestinations"
						option-attribute="name"
						placeholder="Select destination vessel"
						searchable />
					<template v-if="destinationVessel">
						<UButton @click="onFullTransfer" class="w-full">
							Full Transfer
						</UButton>
						<UDivider label="or" />
						<div class="flex gap-2">
							<UInput
								v-model="transferVolume"
								type="number"
								placeholder="Volume"
								class="flex-grow" />
							<USelect
								v-model="transferUnit"
								:options="volumeUnits"
								class="w-24" />
						</div>
						<UButton @click="onPartialTransfer" variant="outline" class="w-full">
							Partial Transfer
						</UButton>
					</template>
				</div>
			</UCard>
		</div>
	</div>
</template>
