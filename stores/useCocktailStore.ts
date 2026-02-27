import { defineStore } from "pinia";
import { ref } from "vue";
import type { Cocktail, CocktailIngredient } from "~/types";

export const useCocktailStore = defineStore("cocktails", () => {
  const toast = useToast();

  // State
  const cocktails = ref<Cocktail[]>([]);
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const cocktail = ref<Cocktail>({
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
  });

  // CRUD actions
  const getCocktails = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/cocktail");
      cocktails.value = response as Cocktail[];
      sortCocktails();
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getCocktails();
        loaded.value = true;
      } catch {
        // loaded stays false — will retry on next call
      }
    }
  };

  const setCocktail = (id: string) => {
    const found = cocktails.value.find((c) => c._id === id);
    if (found) cocktail.value = JSON.parse(JSON.stringify(found));
  };

  const updateCocktail = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !cocktail.value._id;
      if (isNew) {
        const { _id, ...createData } = cocktail.value;
        const response = await $fetch("/api/cocktail/create", {
          method: "POST",
          body: JSON.stringify(createData),
        });
        cocktails.value.push(response as Cocktail);
      } else {
        const response = await $fetch(`/api/cocktail/${cocktail.value._id}`, {
          method: "PUT",
          body: JSON.stringify(cocktail.value),
        });
        const index = cocktails.value.findIndex((c) => c._id === cocktail.value._id);
        if (index !== -1) {
          cocktails.value[index] = response as Cocktail;
        }
      }
      toast.add({ title: `Cocktail ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
      sortCocktails();
      resetCocktail();
    } catch (error: any) {
      toast.add({ title: 'Failed to save cocktail', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const resetCocktail = (): void => {
    cocktail.value = {
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
    };
  };

  const deleteCocktail = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/cocktail/${id}`, {
        method: "DELETE",
      });
      cocktails.value = cocktails.value.filter((c) => c._id !== id);
      toast.add({ title: 'Cocktail deleted', color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      toast.add({ title: 'Failed to delete cocktail', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const getCocktailById = (id: string): Cocktail | undefined => {
    return cocktails.value.find((c) => c._id === id);
  };

  const search = (searchTerm: string): Cocktail[] => {
    return cocktails.value.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.menu?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const sortCocktails = () => {
    cocktails.value.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  };

  const toggleVisibility = async (id: string): Promise<void> => {
    const target = cocktails.value.find(c => c._id === id);
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
      selectedCocktail = cocktails.value.find(
        (c) => c._id === cocktail
      );
    } else {
      selectedCocktail = cocktail;
    }
    if (!selectedCocktail) return 0;
    return totalIngredientCost(selectedCocktail.ingredients);
  };

  return {
    cocktails,
    cocktail,
    loaded,
    loading,
    saving,
    ensureLoaded,
    getCocktails,
    setCocktail,
    updateCocktail,
    resetCocktail,
    deleteCocktail,
    getCocktailById,
    search,
    cocktailCost,
    toggleVisibility,
  };
});
