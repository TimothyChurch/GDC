import type { Recipe } from "~/types";

export const useRecipeStore = defineStore("recipes", () => {
  const toast = useToast();

  // State
  const recipes = ref<Recipe[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const recipe = ref<Recipe>({
    _id: '',
    name: "",
    class: "",
    type: "",
    volume: 0,
    volumeUnit: "",
    items: [],
    directions: "",
  });

  // CRUD actions
  const getRecipes = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/recipe");
      recipes.value = response as Recipe[];
    } catch (e) {
      console.error("Error fetching recipes:", e);
    } finally {
      loading.value = false;
    }
  };
  getRecipes();

  const updateRecipe = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !recipe.value._id;
      if (isNew) {
        await $fetch("/api/recipe/create", {
          method: "POST",
          body: JSON.stringify(recipe.value),
        });
      } else {
        await $fetch(`/api/recipe/${recipe.value._id}`, {
          method: "PUT",
          body: JSON.stringify(recipe.value),
        });
      }
      toast.add({ title: `Recipe ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
      await getRecipes();
      resetRecipe();
    } catch (error: any) {
      toast.add({ title: 'Failed to save recipe', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const resetRecipe = (): void => {
    recipe.value = {
      _id: '',
      name: "",
      class: "",
      type: "",
      volume: 0,
      volumeUnit: "",
      items: [],
      directions: "",
    };
  };

  const deleteRecipe = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/recipe/${id}`, {
        method: "DELETE",
      });
      toast.add({ title: 'Recipe deleted', color: 'success', icon: 'i-lucide-check-circle' });
      await getRecipes();
    } catch (error: any) {
      toast.add({ title: 'Failed to delete recipe', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const setRecipe = (id: string) => {
    recipe.value = getRecipeById(id) as Recipe;
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.value.find((rec) => rec._id === id);
  };

  return {
    recipes,
    recipe,
    loading,
    saving,
    getRecipes,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    resetRecipe,
    setRecipe,
  };
});
