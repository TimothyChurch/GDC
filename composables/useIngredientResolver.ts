import type { CocktailIngredient } from '~/types';

export interface ResolvedIngredient {
  id: string;
  sourceType: 'item' | 'bottle';
  name: string;
  amount: number;
  unit: string;
  pricePerUnit: number;
  cost: number;
  link: string;
}

export const useIngredientResolver = () => {
  const itemStore = useItemStore();
  const bottleStore = useBottleStore();

  const getIngredientName = (ingredient: CocktailIngredient): string => {
    const id = ingredient.item?.toString();
    if (!id) return 'Unknown';

    if (ingredient.sourceType === 'bottle') {
      return bottleStore.getBottleById(id)?.name || 'Unknown Bottle';
    }
    return itemStore.getItemById(id)?.name || 'Unknown Item';
  };

  const getIngredientCostPerUnit = (ingredient: CocktailIngredient): number => {
    const id = ingredient.item?.toString();
    if (!id) return 0;

    if (ingredient.sourceType === 'bottle') {
      const bottle = bottleStore.getBottleById(id);
      if (!bottle) return 0;
      // Use production cost if available, else fall back to retail price / volume
      const prodCost = bottleCost(id);
      if (prodCost && prodCost > 0) return prodCost;
      if (bottle.price && bottle.volume && bottle.volume > 0) {
        // Convert bottle price per volume to cost per oz
        const volumeUnit = bottle.volumeUnit || 'mL';
        const volumeInOz = bottle.volume * convertUnitRatio(volumeUnit, 'fl oz');
        return bottle.price / volumeInOz;
      }
      return 0;
    }

    return itemStore.latestPrice(id);
  };

  const getIngredientLink = (ingredient: CocktailIngredient): string => {
    const id = ingredient.item?.toString();
    if (ingredient.sourceType === 'bottle') {
      return `/admin/bottles/${id}`;
    }
    return `/admin/items/${id}`;
  };

  const resolveIngredient = (ingredient: CocktailIngredient): ResolvedIngredient => {
    const pricePerUnit = getIngredientCostPerUnit(ingredient);
    return {
      id: ingredient.item?.toString() || '',
      sourceType: ingredient.sourceType || 'item',
      name: getIngredientName(ingredient),
      amount: ingredient.amount,
      unit: ingredient.unit,
      pricePerUnit,
      cost: pricePerUnit * ingredient.amount,
      link: getIngredientLink(ingredient),
    };
  };

  const resolveAllIngredients = (ingredients: CocktailIngredient[]): ResolvedIngredient[] => {
    return ingredients.map(resolveIngredient);
  };

  const totalIngredientCost = (ingredients: CocktailIngredient[]): number => {
    return ingredients.reduce((total, ing) => {
      return total + getIngredientCostPerUnit(ing) * ing.amount;
    }, 0);
  };

  return {
    getIngredientName,
    getIngredientCostPerUnit,
    getIngredientLink,
    resolveIngredient,
    resolveAllIngredients,
    totalIngredientCost,
  };
};
