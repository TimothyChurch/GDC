import { defineStore } from "pinia";
import { ref } from "vue";
import type { Cocktail } from "~/types";

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
    visible: true,
  });

  const itemStore = useItemStore();

  // CRUD actions
  const getCocktails = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/cocktail");
      cocktails.value = response as Cocktail[];
    } catch (e) {
    } finally {
      loading.value = false;
    }
    sortCocktails();
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      await getCocktails();
      loaded.value = true;
    }
  };

  const setCocktail = (id: string) => {
    const foundCocktail = cocktails.value.find((c) => c._id === id);
    if (foundCocktail) {
      cocktail.value = foundCocktail;
    }
  };

  const updateCocktail = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !cocktail.value._id;
      if (isNew) {
        const response = await $fetch("/api/cocktail/create", {
          method: "POST",
          body: JSON.stringify(cocktail.value),
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
    const selectedCocktail = ref();
    if (typeof cocktail === "string") {
      selectedCocktail.value = cocktails.value.find(
        (c) => c._id === cocktail
      );
    } else {
      selectedCocktail.value = cocktail;
    }
    return selectedCocktail.value.ingredients.reduce(
      (total: number, ingredient: { item: string; amount: number }) => {
        let cost = itemStore.getPriceById(ingredient.item) || 0;
        return total + ingredient.amount * cost;
      },
      0
    );
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
