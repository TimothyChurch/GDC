<script setup lang="ts">
import * as yup from 'yup';
import type { IngredientSourceType } from '~/types';

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const { getIngredientName, totalIngredientCost } = useIngredientResolver();
const { cocktailModalOpen } = useCocktailModal();

const schema = yup.object({
	name: yup.string().required('Cocktail name is required'),
	price: yup.number().min(0, 'Price cannot be negative'),
});

const cost = computed(() => totalIngredientCost(cocktailStore.cocktail.ingredients));

const newItem = (item: string) => {
	itemStore.item.name = item;
	itemStore.updateItem();
};

const ingredientOptions = computed(() => {
	const items = itemStore.itemNameId.map((i) => ({
		id: `item:${i.id}`,
		label: `${i.label} (Item)`,
	}));
	const bottles = bottleStore.bottleNameId.map((b) => ({
		id: `bottle:${b.id}`,
		label: `${b.label} (Bottle)`,
	}));
	return [...items, ...bottles].sort((a, b) => a.label.localeCompare(b.label));
});

const selectedIngredient = ref('');
const newIngredientAmount = ref(0);
const newIngredientUnit = ref('');

const glasswareOptions = [
	"Highball",
	"Lowball",
	"Martini",
	"Mug",
	"Shot glass",
	"Glencairn",
];
const menuOptions = ["main", "seasonal", "shots", "off menu"];

const units = ["oz", "ml", "dash", "barspoon", "each"];

const addIngredient = () => {
	if (!selectedIngredient.value) return;
	const [sourceType, ...idParts] = selectedIngredient.value.split(':');
	const id = idParts.join(':');
	cocktailStore.cocktail.ingredients.push({
		item: id,
		amount: newIngredientAmount.value,
		unit: newIngredientUnit.value,
		sourceType: sourceType as IngredientSourceType,
	});
	selectedIngredient.value = '';
	newIngredientAmount.value = 0;
	newIngredientUnit.value = '';
	let newItemElement = document.getElementById("newItem");
	if (newItemElement) {
		newItemElement.focus();
	}
};

const handleCreateItem = (itemName: string) => {
	// create-item always creates an Item, not a Bottle
	newItem(itemName);
};

const removeIngredient = (index: number) => {
	cocktailStore.cocktail.ingredients.splice(index, 1);
};

const saveCocktail = async () => {
	await cocktailStore.updateCocktail();
	cocktailModalOpen.value = false;
};
</script>

<template>
	<UContainer class="flex justify-around p-5">
		<UCard>
			<UForm
				:schema="schema"
				:state="cocktailStore.cocktail"
				@submit="saveCocktail"
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
				<UFormField label="Name" name="name" class="md:col-span-2">
					<UInput v-model="cocktailStore.cocktail.name" class="w-full" />
				</UFormField>

				<UFormField label="Glassware" name="glassware" class="md:col-span-2">
					<USelect
						v-model="cocktailStore.cocktail.glassware"
						:items="glasswareOptions"
						class="w-full" />
				</UFormField>
				<UFormField label="Menu" name="menu" class="md:col-span-2">
					<USelect
						v-model="cocktailStore.cocktail.menu"
						:items="menuOptions"
						class="w-full" />
				</UFormField>
				<UFormField label="Recipe" name="ingredients" class="col-span-full">
					<div class="col-span-6 grid grid-cols-6">
						<h1 class="col-span-3 font-bold text-xl">Ingredient</h1>
						<h1 class="font-bold text-xl">Amount</h1>
						<h1 class="font-bold text-xl">Unit</h1>
						<span></span>
					</div>
					<div
						v-for="(ingredient, index) in cocktailStore.cocktail.ingredients"
						:key="index"
						class="grid grid-cols-6 items-center space-x-2 mb-2">
						<span class="col-span-3">
							{{ getIngredientName(ingredient) }}
						<span v-if="ingredient.sourceType === 'bottle'" class="text-xs text-copper/70 ml-1">(Bottle)</span>
						</span>
						<span> {{ ingredient.amount }}</span>
						<span>{{ ingredient.unit }} </span>
						<UButton
							color="error"
							@click="removeIngredient(index)"
							icon="i-heroicons-trash-20-solid"
							class="w-fit" />
					</div>
					<div class="grid grid-cols-6 space-x-2">
						<USelectMenu
							id="newItem"
							v-model="selectedIngredient"
							value-key="id"
							:items="ingredientOptions"
							class="flex flex-grow col-span-3"
							create-item
							@create="handleCreateItem" />
						<UInput
							v-model.number="newIngredientAmount"
							type="number"
							class="flex flex-shrink max-w-20" />
						<USelect
							v-model="newIngredientUnit"
							:items="units"
							class="max-w-20" />
						<UButton
							@click="addIngredient"
							icon="i-heroicons-plus"
							class="w-fit" />
					</div>
				</UFormField>

				<UFormField label="Cost" name="cost">
					{{ Dollar.format(cost) }}
				</UFormField>

				<UFormField label="Price Estimate" name="priceRange" class="md:col-span-2">
					{{ Dollar.format(estimateCocktailPrice(cost)) }}
				</UFormField>
				<UFormField label="Price" name="price" class="md:col-span-3">
					<UInput
						v-model.number="cocktailStore.cocktail.price"
						type="number"
						step="0.01"
						icon="i-lucide-dollar-sign" />
				</UFormField>

				<div class="col-span-full">
					<FormImageUpload
						v-model="cocktailStore.cocktail.img"
						folder="cocktails"
						label="Cocktail Photo"
					/>
				</div>

				<UFormField label="Description" name="description" class="sm:col-span-1 md:col-span-3">
					<UTextarea v-model="cocktailStore.cocktail.description" />
				</UFormField>

				<UFormField label="Directions" name="directions" class="sm:col-span-1 md:col-span-3">
					<UTextarea v-model="cocktailStore.cocktail.directions" />
				</UFormField>

				<div class="flex justify-center space-x-2 mt-4 col-span-full">
					<UButton type="submit" color="primary" :loading="cocktailStore.saving">
						{{ cocktailStore.cocktail._id ? "Update" : "Create" }} Cocktail
					</UButton>
				</div>
			</UForm>
		</UCard>
	</UContainer>
</template>
