import type { Cocktail } from "~/types";

const sortByName = (items: Cocktail[]) => {
  items.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
};

export const useCocktailStore = defineStore("cocktails", () => {
  const toast = useToast();

  const crud = useCrudStore<Cocktail>({
    name: "Cocktail",
    apiPath: "/api/cocktail",
    defaultItem: () => ({
      _id: '',
      name: "",
      glassware: "",
      ingredients: [],
      cost: 0,
      price: 0,
      menu: "",
      description: "",
      directions: "",
      preparation: "",
      visible: true,
    }),
    sort: sortByName,
  });

  // Domain-specific actions
  const search = (searchTerm: string): Cocktail[] => {
    return crud.items.value.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.menu?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const toggleVisibility = async (id: string): Promise<void> => {
    const target = crud.items.value.find((c) => c._id === id);
    if (!target) return;

    const previousValue = target.visible;
    target.visible = !target.visible;

    try {
      await $fetch(`/api/cocktail/${id}`, {
        method: 'PUT',
        body: JSON.stringify(target),
      });
      toast.add({ title: `Cocktail ${target.visible ? 'shown' : 'hidden'}`, color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      target.visible = previousValue;
      toast.add({ title: 'Failed to update visibility', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    }
  };

  const cocktailCost = (cocktail: Cocktail | string): number => {
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
    toggleVisibility,
  };
});
