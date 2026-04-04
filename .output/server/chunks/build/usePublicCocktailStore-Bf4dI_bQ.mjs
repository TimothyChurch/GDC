import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const usePublicCocktailStore = defineStore("publicCocktails", () => {
  const cocktails = ref([]);
  const loaded = ref(false);
  const loading = ref(false);
  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await fetchCocktails();
        loaded.value = true;
      } catch {
      }
    }
  };
  const fetchCocktails = async () => {
    loading.value = true;
    try {
      cocktails.value = await $fetch("/api/cocktail/public");
    } finally {
      loading.value = false;
    }
  };
  const visibleCocktails = computed(() => cocktails.value);
  const getCocktailById = (id) => {
    return cocktails.value.find((c) => c._id === id);
  };
  const search = (searchTerm) => {
    const q = searchTerm.toLowerCase();
    return cocktails.value.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.menu?.toLowerCase().includes(q) || c.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
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
    search
  };
});

export { usePublicCocktailStore as u };
//# sourceMappingURL=usePublicCocktailStore-Bf4dI_bQ.mjs.map
