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

const barrelSizes = BARREL_SIZES;
const charLevels = CHAR_LEVELS;

const submitForm = () => {
	vesselStore.updateVessel();
	vesselStore.resetVessel();
};
</script>

<template>
	<div>
		<UForm :state="vesselStore.vessel">
			<div class="flex flex-wrap gap-3 justify-around">
				<UFormField label="Name">
					<UInput v-model="vesselStore.vessel.name" />
				</UFormField>
				<UFormField label="Type">
					<USelectMenu
						v-model="vesselStore.vessel.type"
						:items="vesselTypes"
						placeholder="Type"
						creatable
						searchable />
				</UFormField>
				<UFormField label="Vessel Weight">
					<BaseQuantityInput
						v-model:value="vesselStore.vessel.stats.weight"
						v-model:unit="vesselStore.vessel.stats.weightUnit"
						:unit-options="weightUnits" />
				</UFormField>
				<UFormField label="Vessel Capacity">
					<BaseQuantityInput
						v-model:value="vesselStore.vessel.stats.volume"
						v-model:unit="vesselStore.vessel.stats.volumeUnit"
						:unit-options="volumeUnits" />
				</UFormField>
			</div>
			<div
				v-if="vesselStore.vessel.type === 'Barrel'"
				class="flex justify-around">
				<UFormField label="Size">
					<USelect
						v-model="vesselStore.vessel.barrel.size"
						:items="barrelSizes" />
				</UFormField>
				<UFormField label="Char Level">
					<USelect
						v-model="vesselStore.vessel.barrel.char"
						:items="charLevels" />
				</UFormField>
				<UFormField label="Cost">
					<UInput v-model="vesselStore.vessel.barrel.cost">
						<template #leading> $ </template>
					</UInput>
				</UFormField>
				<UFormField label="Used Barrel">
					<div class="flex items-center gap-2">
						<USwitch v-model="vesselStore.vessel.isUsed" />
						<span class="text-xs text-parchment/50">Mark as previously used</span>
					</div>
				</UFormField>
				<UFormField v-if="vesselStore.vessel.isUsed" label="Previous Contents">
					<UInput v-model="vesselStore.vessel.previousContents" placeholder="e.g. Bourbon, Rum, Wine" />
				</UFormField>
			</div>
			<UButton
				@click="submitForm()"
				variant="ghost"
				icon="i-heroicons-check-circle"
				color="neutral"
				:loading="vesselStore.saving"
				>Submit</UButton
			>
		</UForm>
	</div>
</template>
