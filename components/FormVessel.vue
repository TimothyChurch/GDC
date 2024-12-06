<script setup>
const vesselStore = useVesselStore();
const batchStore = useBatchStore();

const vesselTypes = computed(() => {
	const vessels = ['Fermenter', 'Still', 'Tank', 'Barrel'];
	vesselStore.vessels.forEach((vessel) => {
		if (!vessels.includes(vessel.type)) {
			vessels.push(vessel.type);
		}
	});
	return vessels.sort((a, b) => a.localeCompare(b));
});

const vesselStatus = computed(() => {
	const statuses = ['Empty', 'contentsed', 'Used'];
	vesselStore.vessels.forEach((vessel) => {
		if (!statuses.includes(vessel.status)) {
			statuses.push(vessel.status);
		}
	});
	return statuses.sort((a, b) => a.localeCompare(b));
});

const barrelSizes = [
	'5 Gallon',
	'10 Gallon',
	'15 Gallon',
	'30 Gallon',
	'53 Gallon',
];

const charLevels = ['Char 1', 'Char 2', 'Char 3', 'Char 4', 'Char 5'];

const contents = ref({
	batch: null,
	volume: null,
	volumeUnit: null,
	weight: null,
	weightUnit: null,
	cost: null,
});

const addcontents = () => {
	vesselStore.vessel.contents.push(contents.value);
	contents.value = {
		batch: null,
		volume: null,
		volumeUnit: null,
		weight: null,
		weightUnit: null,
		cost: null,
	};
};

const submitForm = () => {
	vesselStore.updateVessel();
	vesselStore.resetVessel();
};
</script>

<template>
	<div>
		<UForm :state="vesselStore.vessel">
			<div class="flex flex-wrap gap-3 justify-around">
				<UFormGroup label="Name">
					<UInput v-model="vesselStore.vessel.name" />
				</UFormGroup>
				<UFormGroup label="Type">
					<USelectMenu
						v-model="vesselStore.vessel.type"
						:options="vesselTypes"
						placeholder="Type"
						creatable
						searchable />
				</UFormGroup>
				<UFormGroup label="Status">
					<USelectMenu
						v-model="vesselStore.vessel.status"
						:options="vesselStatus"
						placeholder="Status"
						creatable
						searchable />
				</UFormGroup>
				<UFormGroup label="Vessel Weight">
					<UButtonGroup>
						<UInput v-model="vesselStore.vessel.stats.weight" />
						<USelect
							v-model="vesselStore.vessel.stats.weightUnit"
							:options="weightUnits" />
					</UButtonGroup>
				</UFormGroup>
				<UFormGroup label="Vessel Capacity">
					<UButtonGroup>
						<UInput v-model="vesselStore.vessel.stats.volume" />
						<USelect
							v-model="vesselStore.vessel.stats.volumeUnit"
							:options="volumeUnits" />
					</UButtonGroup>
				</UFormGroup>
			</div>
			<div
				v-if="vesselStore.vessel.type === 'Barrel'"
				class="flex justify-around">
				<UFormGroup label="Size">
					<USelect
						v-model="vesselStore.vessel.barrel.size"
						:options="barrelSizes" />
				</UFormGroup>
				<UFormGroup label="Char Level">
					<USelect
						v-model="vesselStore.vessel.barrel.char"
						:options="charLevels" />
				</UFormGroup>
				<UFormGroup label="Cost">
					<UInput v-model="vesselStore.vessel.barrel.cost">
						<template #leading> $ </template>
					</UInput>
				</UFormGroup>
			</div>
			<UCard>
				<template #header>Contents</template>
				<UTable
					:rows="vesselStore.vessel.contents"
					v-if="vesselStore.vessel.contents.length > 0" />
				<div class="flex flex-wrap gap-3">
					<UFormGroup label="Batch">
						<USelect
							v-model="contents.batch"
							:options="batchStore.batches"
							option-attribute="_id"
							value-attribute="_id" />
					</UFormGroup>
					<UFormGroup label="Volume">
						<UButtonGroup>
							<UInput v-model="contents.volume" />
							<USelect
								v-model="contents.volumeUnit"
								:options="volumeUnits" />
						</UButtonGroup>
					</UFormGroup>
					<UFormGroup label="Weight">
						<UButtonGroup>
							<UInput v-model="contents.weight" />
							<USelect
								v-model="contents.weightUnit"
								:options="weightUnits" />
						</UButtonGroup>
					</UFormGroup>
					<UFormGroup label="Cost">
						<UInput v-model="contents.cost">
							<template #leading> $ </template>
						</UInput>
					</UFormGroup>
				</div>
				<UButton
					@click="addcontents()"
					variant="ghost"
					icon="i-heroicons-plus"
					color="gray"
					>Add contents</UButton
				>
			</UCard>
			<UButton
				@click="submitForm()"
				variant="ghost"
				icon="i-heroicons-check-circle"
				color="gray"
				>Submit</UButton
			>
		</UForm>
	</div>
</template>
