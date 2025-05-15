<script setup>
const route = useRoute();

const recipeStore = useRecipeStore();

recipeStore.recipe = recipeStore.getRecipeById(route.params._id);
</script>

<template>
	<div>
		{{ recipeStore.recipe }}
	</div>
</template>
