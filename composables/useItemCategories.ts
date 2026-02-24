import { ITEM_CATEGORIES } from "~/types";

/**
 * Returns item categories from the settings store if loaded,
 * falling back to the hardcoded ITEM_CATEGORIES constant.
 *
 * Use this in components/forms instead of importing ITEM_CATEGORIES directly
 * to pick up admin-configured categories.
 */
export function useItemCategories() {
  const fallback = [...ITEM_CATEGORIES];

  try {
    const settingsStore = useSettingsStore();
    return computed(() => {
      if (settingsStore.loaded && settingsStore.itemCategories.length > 0) {
        return settingsStore.itemCategories;
      }
      return fallback;
    });
  } catch {
    // Store not available (e.g. server-side)
    return computed(() => fallback);
  }
}
