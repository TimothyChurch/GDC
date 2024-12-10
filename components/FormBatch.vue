<script setup lang="ts">
const recipeStore = useRecipeStore();
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const saveBatch = async () => {
	if (!batchStore.batch.cost)
		batchStore.batch.cost = recipePrice(batchStore.batch.recipe);
	batchStore.updateBatch();
	batchStore.resetBatch();
};
const price = computed((): string => {
	if (batchStore.batch.recipe) {
		return Dollar.format(recipePrice(batchStore.batch.recipe));
	} else {
		return Dollar.format(0);
	}
});
</script>

<template>
	<div>
		<div class="flex flex-col">
			<UCard
				name="sidebar"
				class="flex flex-col"
				><UFormGroup label="Recipe">
					<USelect
						v-model="batchStore.batch.recipe"
						:options="recipeStore.recipes"
						option-attribute="name"
						value-attribute="_id" />
				</UFormGroup>
				<UDivider class="my-3" />
				{{ price }}
			</UCard>

			<UCard>
				<template #header>
					<div>Brewing Details</div>
				</template>
				<UFormGroup label="Brew Date">
					<SiteDatePicker v-model="batchStore.batch.brewDate" />
				</UFormGroup>
				<UFormGroup label="Batch Size">
					<UButtonGroup>
						<UInput
							v-model="batchStore.batch.batchSize"
							type="number"
							placeholder="Volume" />
						<USelect
							v-model="batchStore.batch.batchSizeUnit"
							:options="volumeUnits"
							placeholder="unit" />
					</UButtonGroup>
				</UFormGroup>

				<UFormGroup label="Fermenter">
					<USelect
						v-model="batchStore.batch.fermenter"
						:options="vesselStore.vessels.filter((v) => v.type === 'Fermenter')"
						option-attribute="name"
						value-attribute="_id" />
				</UFormGroup>
			</UCard>
			<UCard>
				<template #header>Distilling Details</template>
				<UFormGroup label="Distill Date">
					<SiteDatePicker v-model="batchStore.batch.distillDate" />
				</UFormGroup>
				<UFormGroup label="Tails Added">
					<div class="flex flex-col gap-3">
						<UButtonGroup>
							<UInput
								v-model="batchStore.batch.prevTails.volume"
								type="number"
								placeholder="Volume" />
							<USelect
								v-model="batchStore.batch.prevTails.volumeUnit"
								:options="volumeUnits"
								placeholder="Unit" />
						</UButtonGroup>
						<UInput
							v-model="batchStore.batch.prevTails.abv"
							type="number"
							placeholder="ABV">
							<template #trailing>%</template>
						</UInput>
					</div>
				</UFormGroup>

				<UFormGroup label="Collection Data">
					<span>Collection Data form will be here</span>
				</UFormGroup>
			</UCard>
		</div>
		<UButton @click="saveBatch">Save Batch</UButton>
	</div>
</template>
