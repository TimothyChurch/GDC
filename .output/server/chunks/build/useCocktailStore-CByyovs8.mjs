import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';

const useIngredientResolver = () => {
  const itemStore = useItemStore();
  const bottleStore = useBottleStore();
  const getIngredientName = (ingredient) => {
    const id = ingredient.item?.toString();
    if (!id) return "Unknown";
    if (ingredient.sourceType === "bottle") {
      return bottleStore.getBottleById(id)?.name || "Unknown Bottle";
    }
    return itemStore.getItemById(id)?.name || "Unknown Item";
  };
  const getIngredientCostPerUnit = (ingredient) => {
    const id = ingredient.item?.toString();
    if (!id) return 0;
    if (ingredient.sourceType === "bottle") {
      const bottle = bottleStore.getBottleById(id);
      if (!bottle?.price) return 0;
      const standardBottleOz = 750 * convertUnitRatio("mL", "fl oz");
      return bottle.price / standardBottleOz;
    }
    return itemStore.latestPrice(id);
  };
  const getIngredientLink = (ingredient) => {
    const id = ingredient.item?.toString();
    if (ingredient.sourceType === "bottle") {
      return `/admin/bottles/${id}`;
    }
    return `/admin/items/${id}`;
  };
  const resolveIngredient = (ingredient) => {
    const pricePerUnit = getIngredientCostPerUnit(ingredient);
    return {
      id: ingredient.item?.toString() || "",
      sourceType: ingredient.sourceType || "item",
      name: getIngredientName(ingredient),
      amount: ingredient.amount,
      unit: ingredient.unit,
      pricePerUnit,
      cost: pricePerUnit * ingredient.amount,
      link: getIngredientLink(ingredient)
    };
  };
  const resolveAllIngredients = (ingredients) => {
    return ingredients.map(resolveIngredient);
  };
  const totalIngredientCost = (ingredients) => {
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
    totalIngredientCost
  };
};
const sortByName = (items) => {
  items.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
};
const useCocktailStore = defineStore("cocktails", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Cocktail",
    apiPath: "/api/cocktail",
    defaultItem: () => ({
      _id: "",
      name: "",
      glassware: "",
      ingredients: [],
      cost: 0,
      price: 0,
      menu: "",
      description: "",
      directions: "",
      preparation: "",
      visible: true
    }),
    sort: sortByName
  });
  const search = (searchTerm) => {
    return crud.items.value.filter(
      (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase()) || c.menu?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const toggleVisibility = async (id) => {
    const target = crud.items.value.find((c) => c._id === id);
    if (!target) return;
    const previousValue = target.visible;
    target.visible = !target.visible;
    try {
      await $fetch(`/api/cocktail/${id}`, {
        method: "PUT",
        body: target
      });
      toast.add({ title: `Cocktail ${target.visible ? "shown" : "hidden"}`, color: "success", icon: "i-lucide-check-circle" });
    } catch (error) {
      target.visible = previousValue;
      toast.add({ title: "Failed to update visibility", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
    }
  };
  const cocktailCost = (cocktail) => {
    const { totalIngredientCost } = useIngredientResolver();
    let selectedCocktail;
    if (typeof cocktail === "string") {
      selectedCocktail = crud.items.value.find((c) => c._id === cocktail);
    } else {
      selectedCocktail = cocktail;
    }
    if (!selectedCocktail) return 0;
    return totalIngredientCost(selectedCocktail.ingredients);
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    cocktails: crud.items,
    cocktail: crud.item,
    getCocktails: crud.getAll,
    updateCocktail: crud.saveItem,
    deleteCocktail: crud.deleteItem,
    resetCocktail: crud.resetItem,
    setCocktail: crud.setItem,
    getCocktailById: crud.getById,
    // Domain-specific
    search,
    cocktailCost,
    toggleVisibility
  };
});

export { useIngredientResolver as a, useCocktailStore as u };
//# sourceMappingURL=useCocktailStore-CByyovs8.mjs.map
