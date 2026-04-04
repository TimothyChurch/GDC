import { u as useSettingsStore } from './useSettingsStore-CJPFEN69.mjs';
import { computed } from 'vue';

const ITEM_CATEGORIES = [
  "Bottling",
  "Base Ingredient",
  "Botanical",
  "Bar Supplies",
  "Other"
];
function useItemCategories() {
  const fallback = [...ITEM_CATEGORIES];
  try {
    const settingsStore = useSettingsStore();
    return computed(() => {
      if (settingsStore.loaded && settingsStore.itemCategories.length > 0) {
        return settingsStore.itemCategories.map((c) => c.category);
      }
      return fallback;
    });
  } catch {
    return computed(() => fallback);
  }
}

export { useItemCategories as u };
//# sourceMappingURL=useItemCategories-BhScY4G-.mjs.map
