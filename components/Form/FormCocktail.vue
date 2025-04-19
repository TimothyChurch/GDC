<script setup lang="ts">
import type { ObjectId } from 'mongodb';
const cocktailStore = useCocktailStore();
import type { Item } from '../types';

const itemStore = useItemStore();
const bottleStore = useBottleStore();

const options = [...itemStore.items, ...bottleStore.bottles];

const newOption = computed({
	get: () => newIngredient.value.item,
	set: async (newOption) => {
		if (
			itemStore.getItemById(newOption.toString()) ||
			bottleStore.getBottleById(newOption.toString())
		) {
			newIngredient.value.item = newOption;
		} else {
			itemStore.item.name = newOption.toString();
			newIngredient.value.item = (await itemStore.updateItem())
				._id as unknown as ObjectId;
		}
	},
});

const newIngredient = ref({
	item: undefined as unknown as ObjectId,
	amount: 0,
	unit: '',
});

const glasswareOptions = ['Highball', 'Lowball', 'Martini', 'Mug'];
const menuOptions = ['main', 'seasonal', 'shots', 'off menu'];

const units = ['oz', 'ml', 'dash', 'barspoon', 'each'];

const addIngredient = () => {
	cocktailStore.cocktail.ingredients.push({
		item: newIngredient.value.item as Item,
		amount: newIngredient.value.amount,
		unit: newIngredient.value.unit,
	});
	newIngredient.value = {
		item: undefined as unknown as ObjectId,
		amount: 0,
		unit: '',
	};
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
			@submit="saveCocktail"
			class="flex flex-col gap-2">
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
					<USelectMenu
						v-model="ingredient.item"
						value-attribute="_id"
						option-attribute="name"
						:options="options"
						searchable
						creatable
						class="flex flex-grow"
						><template #label>
							{{
								ingredient.item
									? itemStore.getItemById(ingredient.item?.toString())?.name ||
									  bottleStore.getBottleById(ingredient.item?.toString())?.name
									: 'Select Item'
							}}</template
						></USelectMenu
					>
					<UInput
						v-model.number="ingredient.amount"
						type="number"
						class="max-w-20" />
					<USelect
						v-model="ingredient.unit"
						:options="units"
						class="max-w-20" />
					<UButton
						color="red"
						@click="removeIngredient(index)"
						icon="i-heroicons-trash-20-solid" />
				</div>
				<div class="flex space-x-2">
					<USelectMenu
						id="newItem"
						v-model="newOption"
						value-attribute="_id"
						option-attribute="name"
						:options="options"
						searchable
						creatable
						class="flex flex-grow">
						<template #label>
							{{
								newOption
									? itemStore.getItemById(newOption?.toString())?.name ||
									  bottleStore.getBottleById(newOption?.toString())?.name
									: 'Select Item'
							}}</template
						>
					</USelectMenu>
					<UInput
						v-model.number="newIngredient.amount"
						type="number"
						class="flex flex-shrink max-w-20" />
					<USelect
						v-model="newIngredient.unit"
						:options="units"
						class="max-w-20" />
					<UButton
						@click="addIngredient"
						icon="i-heroicons-plus" />
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
