import type { Item, Recipe } from '~/types';
import type { ObjectId } from 'mongoose';

export const latestPrice = (item: Item | string): number => {
	// Initialize stores and set up ref
	const itemStore = useItemStore();
	const purchaseOrderStore = usePurchaseOrderStore();
	const selectedItem = ref();
	// Ensure that it is the full item object vs string
	if (typeof item == 'string') {
		selectedItem.value = itemStore.getItemById(item);
	} else {
		selectedItem.value = item;
	}
	// Sort Purchase orders by date
	const sortedPurchaseOrders = purchaseOrderStore.purchaseOrders.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	// Find the last purchase where the item was purchased and return the price per size unit. Return undefined if not found.
	for (let i in sortedPurchaseOrders) {
		const flag = sortedPurchaseOrders[i].items.some(
			(i) => i.item == selectedItem.value._id
		);
		if (flag) {
			const lastPurchase = sortedPurchaseOrders[i].items.filter(
				(i) => i.item == selectedItem.value._id
			)[0];
			// Price per unit
			const pricePerUnit = ref(lastPurchase.price / lastPurchase.size);
			if (lastPurchase.sizeUnit != selectedItem.value.inventoryUnit) {
				pricePerUnit.value =
					pricePerUnit.value /
					convertUnitRatio(
						lastPurchase.sizeUnit as
							| 'fl oz'
							| 'cup'
							| 'gallon'
							| 'oz'
							| 'lb'
							| 'g'
							| 'kg'
							| 'mL'
							| 'L'
							| 'bottle'
							| 'each'
							| 'count',
						selectedItem.value.inventoryUnit
					);
			}
			return pricePerUnit.value;
		}
	}
	return 0;
};

export const currentStock = (item: Item) => {
	const inventoryStore = useInventoryStore();

	const sortedInventory = inventoryStore.inventories.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	for (let i in sortedInventory) {
		if (sortedInventory[i].items[item._id.toString()])
			return sortedInventory[i].items[item._id.toString()];
	}
};

export const recipePrice = (recipe: Recipe | string | ObjectId) => {
	const itemStore = useItemStore();
	const recipeStore = useRecipeStore();
	const selectedRecipe = ref();
	const total = ref(0);
	if (typeof recipe == 'string') {
		selectedRecipe.value = recipeStore.getRecipeById(recipe);
	} else {
		selectedRecipe.value = recipe;
	}
	if (!selectedRecipe.value) return 0;
	if (selectedRecipe.value.items.length == 0) return 0;
	selectedRecipe.value.items.forEach(
		(ingredient: {
			_id: string;
			amount: number;
			unit:
				| 'fl oz'
				| 'cup'
				| 'gallon'
				| 'oz'
				| 'lb'
				| 'g'
				| 'kg'
				| 'mL'
				| 'L'
				| 'bottle'
				| 'each'
				| 'count';
		}) => {
			if (
				ingredient.unit != itemStore.getItemById(ingredient._id)?.inventoryUnit
			) {
				total.value +=
					latestPrice(ingredient?._id) *
					ingredient.amount *
					convertUnitRatio(
						ingredient.unit,
						itemStore.getItemById(ingredient._id)?.inventoryUnit as
							| 'fl oz'
							| 'cup'
							| 'gallon'
							| 'oz'
							| 'lb'
							| 'g'
							| 'kg'
							| 'mL'
							| 'L'
							| 'bottle'
							| 'each'
							| 'count'
					);
			} else {
				total.value += latestPrice(ingredient?._id) * ingredient.amount;
			}
		}
	);
	return total.value;
};

export const getInventoryNameById = (id: string) => {
	const itemStore = useItemStore();
	const bottleStore = useBottleStore();

	return itemStore.getItemById(id)?.name || bottleStore.getBottleById(id)?.name;
};
