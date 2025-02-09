<script setup lang="ts">
import { ref, computed } from 'vue';

const cocktailStore = useCocktailStore();

const newIngredient = ref({
	item: '',
	amount: 0,
	unit: '',
});

const glasswareOptions = ['Highball', 'Lowball', 'Martini', 'Mug'];
const menuOptions = ['main', 'seasonal', 'shots', 'off menu'];

const units = ['oz', 'ml', 'dash', 'barspoon', 'each'];

const addIngredient = () => {
	cocktailStore.cocktail.ingredients.push({ ...newIngredient.value });
	newIngredient.value = { item: '', amount: 0, unit: '' };
	let newItemElement = document.getElementById('newItem');
	if (newItemElement) {
		newItemElement.focus();
	}
};

const removeIngredient = (index: number) => {
	cocktailStore.cocktail.ingredients.splice(index, 1);
};

const saveCocktail = async () => {
	await cocktailStore.updateCocktail();
};
</script>

<template>
	<UCard>
		<UForm
			:state="cocktailStore.cocktail"
			@submit="saveCocktail">
			<UFormGroup
				label="Name"
				name="name">
				<UInput v-model="cocktailStore.cocktail.name" />
			</UFormGroup>

			<UFormGroup
				label="Glassware"
				name="glassware">
				<USelect
					v-model="cocktailStore.cocktail.glassware"
					:options="glasswareOptions" />
			</UFormGroup>

			<UFormGroup
				label="Ingredients"
				name="ingredings">
				<div
					v-for="(ingredient, index) in cocktailStore.cocktail.ingredients"
					:key="index"
					class="flex items-center space-x-2 mb-2">
					<UInput
						id="item"
						v-model="ingredient.item" />
					<UInput
						v-model.number="ingredient.amount"
						type="number" />
					<USelect
						v-model="ingredient.unit"
						:options="units" />
					<UButton
						color="red"
						@click="removeIngredient(index)"
						>Remove</UButton
					>
				</div>
				<div class="flex items-center space-x-2">
					<UInput
						id="newItem"
						v-model="newIngredient.item" />
					<UInput
						v-model.number="newIngredient.amount"
						type="number" />
					<USelect
						v-model="newIngredient.unit"
						:options="units" />
					<UButton @click="addIngredient">Add Ingredient</UButton>
				</div>
			</UFormGroup>

			<UFormGroup
				label="Cost"
				name="cost">
				<UInput
					v-model.number="cocktailStore.cocktail.cost"
					type="number"
					step="0.01" />
			</UFormGroup>

			<UFormGroup
				label="Price"
				name="price">
				<UInput
					v-model.number="cocktailStore.cocktail.price"
					type="number"
					step="0.01" />
			</UFormGroup>

			<UFormGroup
				label="Menu"
				name="menu">
				<USelect
					v-model="cocktailStore.cocktail.menu"
					:options="menuOptions" />
			</UFormGroup>

			<UFormGroup
				label="Description"
				name="description">
				<UTextarea v-model="cocktailStore.cocktail.description" />
			</UFormGroup>

			<UFormGroup
				label="Directions"
				name="directions">
				<UTextarea v-model="cocktailStore.cocktail.directions" />
			</UFormGroup>

			<div class="flex justify-end space-x-2 mt-4">
				<UButton color="gray">Cancel</UButton>
				<UButton
					type="submit"
					color="primary"
					>{{
						cocktailStore.cocktail._id ? 'Update' : 'Create'
					}}
					Cocktail</UButton
				>
			</div>
		</UForm>
	</UCard>
</template>
