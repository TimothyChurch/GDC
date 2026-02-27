import { ITEM_CATEGORIES } from "~/types";

/**
 * Returns item category strings from the settings store if loaded,
 * falling back to the hardcoded ITEM_CATEGORIES constant.
 *
 * Extracts the `category` field from each InventoryCategoryDef object.
 */
export function useItemCategories() {
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
    // Store not available (e.g. server-side)
    return computed(() => fallback);
  }
}
