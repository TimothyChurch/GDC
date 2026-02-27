import type { Recipe } from "~/types";

export const useRecipeStore = defineStore("recipes", () => {
  const crud = useCrudStore<Recipe>({
    name: "Recipe",
    apiPath: "/api/recipe",
    defaultItem: () => ({
      _id: '',
      name: "",
      class: "",
      type: "",
      volume: 0,
      volumeUnit: "",
      items: [],
      directions: "",
      pipeline: ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
    }),
  });

  return {
    ...crud,
    // Domain aliases for backward compatibility
    recipes: crud.items,
    recipe: crud.item,
    getRecipes: crud.getAll,
    updateRecipe: crud.saveItem,
    deleteRecipe: crud.deleteItem,
    resetRecipe: crud.resetItem,
    setRecipe: crud.setItem,
    getRecipeById: crud.getById,
  };
});
