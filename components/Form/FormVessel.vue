<script setup>
const vesselStore = useVesselStore();

const vesselTypes = computed(() => {
	const vessels = ['Mash Tun', 'Fermenter', 'Still', 'Tank', 'Barrel'];
	vesselStore.vessels.forEach((vessel) => {
		if (!vessels.includes(vessel.type)) {
			vessels.push(vessel.type);
		}
	});
	return vessels.sort((a, b) => a.localeCompare(b));
});

const barrelSizes = [
	'5 Gallon',
	'10 Gallon',
	'15 Gallon',
	'30 Gallon',
	'53 Gallon',
];

const charLevels = ['Char 1', 'Char 2', 'Char 3', 'Char 4', 'Char 5'];

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
