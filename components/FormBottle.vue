<script setup lang="ts">
const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const save = () => {
	bottleStore.bottle.type = 'Bottle';
	bottleStore.updateBottle();
	toggleFormModal();
};
</script>

<template>
	<div class="flex flex-col gap-3">
		<UFormGroup
			label="Name"
			name="name">
			<UInput v-model="bottleStore.bottle.name" />
		</UFormGroup>
		<UFormGroup
			label="ABV"
			name="abv">
			<UInput v-model="bottleStore.bottle.abv" />
		</UFormGroup>

		<UFormGroup
			label="Recipe"
			name="recipe">
			<USelectMenu
				:options="recipeStore.recipes"
				searchable
				option-attribute="name"
				value-attribute="_id"
				v-model="bottleStore.bottle.recipe" />
		</UFormGroup>

		<UButton @click="save"> Submit </UButton>
	</div>
</template>
