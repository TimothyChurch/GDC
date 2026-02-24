export const ITEM_CATEGORIES = [
  "Bottling",
  "Base Ingredient",
  "Botanical",
  "Bar Supplies",
  "Other",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export interface Item {
  _id: string;
  name: string;
  type?: string;
  inventoryUnit?: string;
  purchaseHistory?: string[];
  inventoryHistory?: string[];
  category?: ItemCategory;
  trackInventory?: boolean;
  minStock?: number;
  reorderPoint?: number;
  usePerMonth?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
