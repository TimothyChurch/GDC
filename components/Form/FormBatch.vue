<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const price = computed(() => {
	if (batchStore.batch.recipe) {
		return Dollar.format(recipePrice(batchStore.batch.recipe));
	} else {
		return Dollar.format(0);
	}
});

const recipe = computed(() => {
	return recipeStore.getRecipeById(batchStore.batch.recipe);
});

const scaling = computed(() => {
	if (recipe.value?.volumeUnit && batchStore.batch.batchSizeUnit) {
		return convertUnitRatio(
			recipe.value.volumeUnit,
			batchStore.batch.batchSizeUnit
		);
	}
});
const scaledPrice = computed(() => {
	return (
		(recipePrice(recipe.value) *
			(batchStore.batch.batchSize / recipe.value?.volume)) /
			scaling.value || 0
	);
});
const saveBatch = async () => {
	if (!batchStore.batch.recipeCost)
		batchStore.batch.recipeCost = recipePrice(batchStore.batch.recipe);
	batchStore.batch.batchCost = scaledPrice.value;
	batchStore.updateBatch();
	toggleFormModal();
};
</script>

<template>
	<div>
		<div>
			<div class="grid grid-flow-col auto-cols-auto gap-3">
				<UFormGroup label="Recipe">
					<USelect
						v-model="batchStore.batch.recipe"
						:options="recipeStore.recipes"
						option-attribute="name"
						value-attribute="_id" />
				</UFormGroup>
				<UFormGroup label="Recipe Cost"> {{ price }} </UFormGroup>
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
				<UFormGroup label="Batch Cost">{{
					Dollar.format(scaledPrice)
				}}</UFormGroup>
				<UButton @click="saveBatch()"> Save </UButton>
			</div>
		</div>
	</div>
</template>
