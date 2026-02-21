<script setup lang="ts">
import * as yup from 'yup';

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const schema = yup.object({
	recipe: yup.string().required('Recipe is required'),
	batchSize: yup.number().positive('Must be greater than 0').required('Batch size is required'),
	batchSizeUnit: yup.string().required('Unit is required'),
});

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
// When recipe changes, inherit its pipeline
watch(() => batchStore.batch.recipe, (newRecipeId) => {
	if (!newRecipeId || batchStore.batch._id) return;
	const r = recipeStore.getRecipeById(newRecipeId);
	if (r?.pipeline?.length) {
		batchStore.batch.pipeline = [...r.pipeline];
	}
});

const saveBatch = async () => {
	if (!batchStore.batch.recipeCost)
		batchStore.batch.recipeCost = recipePrice(batchStore.batch.recipe);
	batchStore.batch.batchCost = scaledPrice.value;
	batchStore.updateBatch();
};
</script>

<template>
	<div>
		<UForm
			:schema="schema"
			:state="batchStore.batch"
			@submit="saveBatch">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				<UFormField label="Recipe" name="recipe">
					<USelect
						v-model="batchStore.batch.recipe"
						:options="recipeStore.recipes"
						option-attribute="name"
						value-attribute="_id" />
				</UFormField>
				<UFormField label="Recipe Cost"> {{ price }} </UFormField>
				<UFormField label="Batch Size" name="batchSize">
					<UFieldGroup>
						<UInput
							v-model="batchStore.batch.batchSize"
							type="number"
							placeholder="Volume" />
						<USelect
							v-model="batchStore.batch.batchSizeUnit"
							:options="volumeUnits"
							placeholder="unit" />
					</UFieldGroup>
				</UFormField>
				<UFormField label="Batch Cost">
					{{ Dollar.format(scaledPrice) }}
				</UFormField>
				<UButton type="submit" :loading="batchStore.saving"> Save </UButton>
			</div>
		</UForm>
	</div>
</template>
