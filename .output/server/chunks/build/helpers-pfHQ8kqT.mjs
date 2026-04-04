import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { u as useItemStore, b as usePurchaseOrderStore, a as useUnitConversion } from './useItemStore-Cpj9s1UF.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';

const latestPrice = (item) => {
  const itemStore = useItemStore();
  const purchaseOrderStore = usePurchaseOrderStore();
  const { computePricePerUnit } = useUnitConversion();
  const selectedItem = typeof item === "string" ? itemStore.getItemById(item) : item;
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
const recipePrice = (recipe) => {
  const itemStore = useItemStore();
  const recipeStore = useRecipeStore();
  const { ingredientCost } = useUnitConversion();
  const selectedRecipe = typeof recipe === "string" ? recipeStore.getRecipeById(recipe) : recipe;
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
const bulkSpiritIngredientCost = (volume, volumeUnit, spirit) => {
  const pg = calculateProofGallons(volume, volumeUnit, spirit.abv);
  return pg * spirit.costPerProofGallon;
};
const latestProduction = (bottle) => {
  const productionStore = useProductionStore();
  const sortedProductions = [...productionStore.productions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastProduction = sortedProductions.find((p) => p.bottle == bottle);
  return lastProduction;
};
const bottleCost = (bottle) => {
  return latestProduction(bottle)?.bottleCost;
};

export { bottleCost as b, latestPrice as l, recipePrice as r };
//# sourceMappingURL=helpers-pfHQ8kqT.mjs.map
