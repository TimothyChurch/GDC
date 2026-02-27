import type { PublicBottle } from '~/types';

export const usePublicBottleStore = defineStore('publicBottles', () => {
  const bottles = ref<PublicBottle[]>([]);
  const loaded = ref(false);
  const loading = ref(false);

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await fetchBottles();
        loaded.value = true;
      } catch {
        // loaded stays false -- will retry on next call
      }
    }
  };

  const fetchBottles = async (): Promise<void> => {
    loading.value = true;
    try {
      bottles.value = await $fetch<PublicBottle[]>('/api/bottle/public');
    } finally {
      loading.value = false;
    }
  };

  const activeBottles = computed(() => bottles.value);

  const getBottleById = (id: string): PublicBottle | undefined => {
    return bottles.value.find((b) => b._id === id);
  };

  const getName = (id: string): string | undefined => {
    return getBottleById(id)?.name;
  };

  return {
    bottles,
    activeBottles,
    loaded,
    loading,
    ensureLoaded,
    fetchBottles,
    getBottleById,
    getName,
  };
});
