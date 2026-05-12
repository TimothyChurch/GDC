import type { Item, Recipe, Bottle } from '~/types';
import { calculateProofGallons } from '~/utils/proofGallons';

/**
 * Auto-imported alias delegating to the cached `useItemStore.latestPrice`.
 * The store version uses a pre-indexed PO line-item map (O(1) per call); this
 * helper exists so call sites that don't already have the store handy can keep
 * the simple `latestPrice(itemId)` ergonomics.
 */
export const latestPrice = (item: Item | string): number =>
	useItemStore().latestPrice(item);

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
