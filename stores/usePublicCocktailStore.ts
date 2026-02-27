import type { PublicCocktail } from '~/types';

export const usePublicCocktailStore = defineStore('publicCocktails', () => {
  const cocktails = ref<PublicCocktail[]>([]);
  const loaded = ref(false);
  const loading = ref(false);

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await fetchCocktails();
        loaded.value = true;
      } catch {
        // loaded stays false -- will retry on next call
      }
    }
  };

  const fetchCocktails = async (): Promise<void> => {
    loading.value = true;
    try {
      cocktails.value = await $fetch<PublicCocktail[]>('/api/cocktail/public');
    } finally {
      loading.value = false;
    }
  };

  const visibleCocktails = computed(() => cocktails.value);

  const getCocktailById = (id: string): PublicCocktail | undefined => {
    return cocktails.value.find((c) => c._id === id);
  };

  const search = (searchTerm: string): PublicCocktail[] => {
    const q = searchTerm.toLowerCase();
    return cocktails.value.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.menu?.toLowerCase().includes(q) ||
        c.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
    );
  };

  return {
    cocktails,
    visibleCocktails,
    loaded,
    loading,
    ensureLoaded,
    fetchCocktails,
    getCocktailById,
    search,
  };
});
