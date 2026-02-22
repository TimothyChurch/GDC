import type { Recipe } from "~/types";

export const useRecipeStore = defineStore("recipes", () => {
  const toast = useToast();

  // State
  const recipes = ref<Recipe[]>([]);
  const loaded = ref(false);
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
    pipeline: ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
  });

  // CRUD actions
  const getRecipes = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/recipe");
      recipes.value = response as Recipe[];
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getRecipes();
        loaded.value = true;
      } catch {
        // loaded stays false — will retry on next call
      }
    }
  };

  const updateRecipe = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !recipe.value._id;
      if (isNew) {
        const { _id, ...createData } = recipe.value;
        const response = await $fetch("/api/recipe/create", {
          method: "POST",
          body: JSON.stringify(createData),
        });
        recipes.value.push(response as Recipe);
      } else {
        const response = await $fetch(`/api/recipe/${recipe.value._id}`, {
          method: "PUT",
          body: JSON.stringify(recipe.value),
        });
        const index = recipes.value.findIndex((r) => r._id === recipe.value._id);
        if (index !== -1) {
          recipes.value[index] = response as Recipe;
        }
      }
      toast.add({ title: `Recipe ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
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
      pipeline: ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled'],
    };
  };

  const deleteRecipe = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/recipe/${id}`, {
        method: "DELETE",
      });
      recipes.value = recipes.value.filter((r) => r._id !== id);
      toast.add({ title: 'Recipe deleted', color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      toast.add({ title: 'Failed to delete recipe', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const setRecipe = (id: string) => {
    const found = getRecipeById(id);
    if (found) recipe.value = JSON.parse(JSON.stringify(found));
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.value.find((rec) => rec._id === id);
  };

  return {
    recipes,
    recipe,
    loaded,
    loading,
    saving,
    ensureLoaded,
    getRecipes,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    resetRecipe,
    setRecipe,
  };
});
