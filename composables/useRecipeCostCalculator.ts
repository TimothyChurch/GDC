import type { Recipe, RecipeBulkSpirit } from '~/types';

export interface RecipeIngredientRow {
	id: string;
	name: string;
	amount: number;
	unit: string;
	pricePerUnit: number;
	cost: number;
}

export interface RecipeBulkSpiritRow {
	id: string;
	name: string;
	volume: number;
	volumeUnit: string;
	abv: number;
	costPerPG: number;
	cost: number;
}

type RecipeIngredient = Recipe['items'][number];

export interface RecipeCostInput {
	/** Source of dry ingredients (e.g. an editable buffer or `recipe.items`). */
	ingredients: Ref<RecipeIngredient[] | undefined>;
	/** Source of bulk-spirit ingredients (typically `recipe.bulkSpirits`). */
	bulkSpirits: Ref<RecipeBulkSpirit[] | undefined>;
}

/**
 * Build display-ready cost rows for a recipe's ingredients and bulk spirits,
 * plus a total. Wraps the auto-imported `latestPrice`, `ingredientCost`, and
 * `bulkSpiritIngredientCost` helpers so consumers don't have to look up items
 * and bulk-spirits manually.
 *
 * Lifted out of `pages/admin/recipes/[_id].vue` (#39 / #49) so the cost
 * pipeline can be reused (and tested) independently of the page layout.
 */
export function useRecipeCostCalculator(input: RecipeCostInput) {
	const itemStore = useItemStore();
	const bulkSpiritStore = useBulkSpiritStore();
	const { ingredientCost } = useUnitConversion();

	const ingredients = computed<RecipeIngredientRow[]>(() => {
		const list = input.ingredients.value;
		if (!list?.length) return [];
		return list.map((ing) => {
			const item = itemStore.getItemById(ing._id);
			const pricePerUnit = latestPrice(ing._id);
			const cost = ingredientCost(
				pricePerUnit,
				ing.amount,
				ing.unit,
				item?.inventoryUnit || ing.unit,
			);
			return {
				id: ing._id,
				name: item?.name || 'Unknown',
				amount: ing.amount,
				unit: ing.unit,
				pricePerUnit,
				cost,
			};
		});
	});

	const bulkSpiritIngredients = computed<RecipeBulkSpiritRow[]>(() => {
		const list = input.bulkSpirits.value;
		if (!list?.length) return [];
		return list.map((bs) => {
			const spirit = bulkSpiritStore.getBulkSpiritById(bs.bulkSpirit);
			const cost = spirit && spirit.costPerProofGallon > 0
				? bulkSpiritIngredientCost(bs.volume, bs.volumeUnit, spirit)
				: 0;
			return {
				id: bs.bulkSpirit,
				name: spirit?.name || 'Unknown Spirit',
				volume: bs.volume,
				volumeUnit: bs.volumeUnit,
				abv: spirit?.abv ?? 0,
				costPerPG: spirit?.costPerProofGallon ?? 0,
				cost,
			};
		});
	});

	const totalIngredientsCost = computed(() =>
		ingredients.value.reduce((sum, r) => sum + (r.cost || 0), 0),
	);
	const totalBulkSpiritsCost = computed(() =>
		bulkSpiritIngredients.value.reduce((sum, r) => sum + (r.cost || 0), 0),
	);
	const totalCost = computed(
		() => totalIngredientsCost.value + totalBulkSpiritsCost.value,
	);

	return {
		ingredients,
		bulkSpiritIngredients,
		totalIngredientsCost,
		totalBulkSpiritsCost,
		totalCost,
	};
}
