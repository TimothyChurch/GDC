export const ITEM_CATEGORIES = [
  "Bottling",
  "Base Ingredient",
  "Botanical",
  "Bar Supplies",
  "Other",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const EXTRACT_TYPES = [
  "malted_grain",
  "raw_grain",
  "flaked_grain",
  "specialty_grain",
  "sugar",
  "extract_dry",
  "extract_liquid",
  "adjunct",
] as const;
export type ExtractType = (typeof EXTRACT_TYPES)[number];

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
  baseCostPrice?: number;
  baseCostSize?: number;
  baseCostUnit?: string;
  notes?: string;
  /** Points Per Pound Per Gallon — yield potential for grain-bill projections.
   * Common values: 2-row 37, flaked corn 39, cane sugar 46, rye malt 29.
   * See utils/grainBill.ts for the full reference. */
  ppg?: number;
  /** How this item contributes fermentables. Drives the efficiency multiplier
   * (mash efficiency for grains, 100% for sugars/DME, 95% for LME). */
  extractType?: ExtractType;
  /** Filter flag for grain-bill aggregation. */
  fermentable?: boolean;
  /** Volume (gal) displaced by 1 lb of this item when fully wetted in the mash.
   * Used by grain-in PG corrections. Falls back to a default-by-extractType
   * lookup at calculation time when unset. See utils/grainBill.ts. */
  displacement?: number;
  createdAt?: string;
  updatedAt?: string;
}
