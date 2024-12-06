import type { Item, Recipe } from '~/types';
import type { ObjectId } from 'mongoose';

export const latestPrice = (item: Item | string): number | undefined => {
	// Initialize stores and set up ref
	const itemStore = useItemStore();
	const purchaseOrderStore = usePurchaseOrderStore();
	const data = ref();
	// Ensure that it is the full item object vs string
	if (typeof item == 'string') {
		data.value = itemStore.getItemById(item);
	} else {
		data.value = item;
	}
	// Sort Purchase orders by date
	const sortedPurchaseOrders = purchaseOrderStore.purchaseOrders.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	// Find the last purchase where the item was purchased and return the price per size unit. Return undefined if not found.
	for (let i in sortedPurchaseOrders) {
		const flag = sortedPurchaseOrders[i].items.some(
			(i) => i.item == data.value._id
		);
		if (flag) {
			const lastPurchase = sortedPurchaseOrders[i].items.filter(
				(i) => i.item == data.value._id
			)[0];
			return lastPurchase.price / lastPurchase.size;
		}
	}
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
	const selectedRecipe = ref();
	const total = ref(0);
	if (typeof recipe == 'string') {
		const recipeStore = useRecipeStore();
		selectedRecipe.value = recipeStore.getRecipeById(recipe);
	} else {
		selectedRecipe.value = recipe;
	}
	if (!selectedRecipe.value) return 0;
	if (selectedRecipe.value.items.length == 0) return 0;
	selectedRecipe.value.items.forEach(
		(ingredient: { _id: string; amount: number }) => {
			total.value +=
				(latestPrice(ingredient?._id) as number) * ingredient.amount;
		}
	);
	return total.value;
};
