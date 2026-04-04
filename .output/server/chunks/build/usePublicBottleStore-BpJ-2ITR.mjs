import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const usePublicBottleStore = defineStore("publicBottles", () => {
  const bottles = ref([]);
  const loaded = ref(false);
  const loading = ref(false);
  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await fetchBottles();
        loaded.value = true;
      } catch {
      }
    }
  };
  const fetchBottles = async () => {
    loading.value = true;
    try {
      bottles.value = await $fetch("/api/bottle/public");
    } finally {
      loading.value = false;
    }
  };
  const activeBottles = computed(() => bottles.value);
  const getBottleById = (id) => {
    return bottles.value.find((b) => b._id === id);
  };
  const getName = (id) => {
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
    getName
  };
});

export { usePublicBottleStore as u };
//# sourceMappingURL=usePublicBottleStore-BpJ-2ITR.mjs.map
