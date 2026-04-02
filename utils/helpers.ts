import type { Item, Recipe, Bottle } from '~/types';
import { calculateProofGallons } from '~/utils/proofGallons';

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

	// Fallback to manual base cost fields
	if (selectedItem.baseCostPrice && selectedItem.baseCostSize && selectedItem.baseCostUnit) {
		return computePricePerUnit(
			selectedItem.baseCostPrice,
			selectedItem.baseCostSize,
			selectedItem.baseCostUnit,
			selectedItem.inventoryUnit || selectedItem.baseCostUnit
		);
	}

	return 0;
};

export const recipePrice = (recipe: Recipe | string) => {
	const itemStore = useItemStore();
	const recipeStore = useRecipeStore();
	const { ingredientCost } = useUnitConversion();

	const selectedRecipe = typeof recipe === 'string' ? recipeStore.getRecipeById(recipe) : recipe;
	if (!selectedRecipe) return 0;

	let total = 0;
	for (const ingredient of selectedRecipe.items || []) {
		const item = itemStore.getItemById(ingredient._id);
		const pricePerUnit = latestPrice(ingredient._id);
		total += ingredientCost(
			pricePerUnit,
			ingredient.amount,
			ingredient.unit,
			item?.inventoryUnit || ingredient.unit
		);
	}

	// Add bulk spirit costs
	if (selectedRecipe.bulkSpirits?.length) {
		const bulkSpiritStore = useBulkSpiritStore();
		for (const bs of selectedRecipe.bulkSpirits) {
			const spirit = bulkSpiritStore.getBulkSpiritById(bs.bulkSpirit);
			if (spirit && spirit.costPerProofGallon > 0) {
				total += bulkSpiritIngredientCost(bs.volume, bs.volumeUnit, spirit);
			}
		}
	}

	return total;
};

/** Calculate the cost of a bulk spirit ingredient based on volume and cost per proof gallon */
export const bulkSpiritIngredientCost = (volume: number, volumeUnit: string, spirit: { abv: number; costPerProofGallon: number }): number => {
	const pg = calculateProofGallons(volume, volumeUnit, spirit.abv);
	return pg * spirit.costPerProofGallon;
};

export const latestProduction = (bottle: string) => {
	const productionStore = useProductionStore();
	const sortedProductions = [...productionStore.productions].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
	const lastProduction = sortedProductions.find((p) => p.bottle == bottle);
	return lastProduction;
};

export const bottleCost = (bottle: string) => {
	return latestProduction(bottle)?.bottleCost;
};
