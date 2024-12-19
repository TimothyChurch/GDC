<script setup>
const route = useRoute();

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const batch = computed(() => {
	batchStore.batch = batchStore.batches.find((b) => b._id === route.params._id);
	return batchStore.batch;
});
const recipe = computed(() => recipeStore.getRecipeById(batch.value?.recipe));
if (recipe.value) {
	recipeStore.recipe = recipe.value;
}
</script>

<template>
	<div class="flex gap-3">
		<BatchDetails
			:batch="batch"
			:recipe="recipe" />
		<BatchFermenting
			v-if="batch?.status != 'Upcoming'"
			:batch="batch" />
	</div>
</template>
