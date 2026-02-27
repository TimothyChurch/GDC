export const ITEM_CATEGORIES = [
  "Bottling",
  "Base Ingredient",
  "Botanical",
  "Bar Supplies",
  "Other",
] as const;
export type ItemCategory = string;

export interface Item {
  _id: string;
  name: string;
  type?: string;
  inventoryUnit?: string;
  purchaseHistory?: string[];
  inventoryHistory?: string[];
  category?: ItemCategory;
  trackInventory?: boolean;
  unitSize?: number;
  unitLabel?: string;
  minStock?: number;
  reorderPoint?: number;
  usePerMonth?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
