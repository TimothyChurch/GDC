import type { InventoryCategoryDef } from "~/types";

export type { InventoryCategoryDef };

const DEFAULT_INVENTORY_CATEGORIES: InventoryCategoryDef[] = [
  {
    key: "bottling",
    label: "Bottling Supplies",
    category: "Bottling",
    icon: "i-lucide-wine",
    description: "Bottles, caps, labels, shrink wraps, and packaging materials",
  },
  {
    key: "ingredients",
    label: "Base Ingredients",
    category: "Base Ingredient",
    icon: "i-lucide-wheat",
    description: "Grains, sugars, yeast, and primary fermentation ingredients",
  },
  {
    key: "botanicals",
    label: "Botanicals",
    category: "Botanical",
    icon: "i-lucide-leaf",
    description: "Herbs, spices, citrus peels, and botanical flavorings",
  },
  {
    key: "bar-supplies",
    label: "Bar Supplies",
    category: "Bar Supplies",
    icon: "i-lucide-cup-soda",
    description: "Mixers, garnishes, glassware, and bar tools",
  },
  {
    key: "other",
    label: "Other",
    category: "Other",
    icon: "i-lucide-box",
    description: "Cleaning supplies, lab supplies, and miscellaneous items",
  },
];

/**
 * Returns the inventory categories from the settings store (dynamic),
 * falling back to hardcoded defaults if the store isn't loaded yet.
 */
export function useInventoryCategories(): ComputedRef<InventoryCategoryDef[]> {
  try {
    const settingsStore = useSettingsStore();
    return computed(() => {
      if (settingsStore.loaded && settingsStore.itemCategories.length > 0) {
        return settingsStore.itemCategories;
      }
      return DEFAULT_INVENTORY_CATEGORIES;
    });
  } catch {
    return computed(() => DEFAULT_INVENTORY_CATEGORIES);
  }
}

/** Keep the static export for backward compat in non-reactive contexts */
export const INVENTORY_CATEGORIES = DEFAULT_INVENTORY_CATEGORIES;

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function getStockStatus(
  quantity: number,
  reorderPoint: number,
): StockStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderPoint) return "Low Stock";
  return "In Stock";
}

export function getStockStatusColor(
  status: StockStatus,
): "success" | "warning" | "error" {
  if (status === "Out of Stock") return "error";
  if (status === "Low Stock") return "warning";
  return "success";
}

export function getCategoryBySlug(
  slug: string,
  categories?: InventoryCategoryDef[],
): InventoryCategoryDef | undefined {
  const list = categories ?? DEFAULT_INVENTORY_CATEGORIES;
  return list.find((c) => c.key === slug);
}
