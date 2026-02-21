import type { Item, Recipe, Bottle } from '~/types';

export const latestPrice = (item: Item | string): number => {
	const itemStore = useItemStore();
	const purchaseOrderStore = usePurchaseOrderStore();
	const { computePricePerUnit } = useUnitConversion();

	const selectedItem = typeof item === 'string' ? itemStore.getItemById(item) : item;
	if (!selectedItem) return 0;

	const sortedPurchaseOrders = [...purchaseOrderStore.purchaseOrders].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	for (const po of sortedPurchaseOrders) {
		const lineItem = po.items.find((i) => i.item === selectedItem._id);
		if (lineItem) {
			return computePricePerUnit(
				lineItem.price,
				lineItem.size,
				lineItem.sizeUnit,
				selectedItem.inventoryUnit || lineItem.sizeUnit
			);
		}
	}
	return 0;
};

export const recipePrice = (recipe: Recipe | string) => {
	const itemStore = useItemStore();
	const recipeStore = useRecipeStore();
	const { ingredientCost } = useUnitConversion();

	const selectedRecipe = typeof recipe === 'string' ? recipeStore.getRecipeById(recipe) : recipe;
	if (!selectedRecipe || selectedRecipe.items.length === 0) return 0;

	let total = 0;
	for (const ingredient of selectedRecipe.items) {
		const item = itemStore.getItemById(ingredient._id);
		const pricePerUnit = latestPrice(ingredient._id);
		total += ingredientCost(
			pricePerUnit,
			ingredient.amount,
			ingredient.unit,
			item?.inventoryUnit || ingredient.unit
		);
	}
	return total;
};

export const latestProduction = (bottle: string) => {
	const productionStore = useProductionStore();
	const sortedProductions = productionStore.productions.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	const lastProduction = sortedProductions.find((p) => p.bottle == bottle);
	return lastProduction;
};

export const bottleCost = (bottle: string) => {
	return latestProduction(bottle)?.bottleCost;
};
