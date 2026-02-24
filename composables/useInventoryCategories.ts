import type { ItemCategory } from '~/types'

export interface InventoryCategoryDef {
  key: string
  label: string
  category: ItemCategory
  icon: string
  description: string
}

export const INVENTORY_CATEGORIES: InventoryCategoryDef[] = [
  {
    key: 'bottling',
    label: 'Bottling Supplies',
    category: 'Bottling',
    icon: 'i-lucide-wine',
    description: 'Bottles, caps, labels, shrink wraps, and packaging materials',
  },
  {
    key: 'ingredients',
    label: 'Base Ingredients',
    category: 'Base Ingredient',
    icon: 'i-lucide-wheat',
    description: 'Grains, sugars, yeast, and primary fermentation ingredients',
  },
  {
    key: 'botanicals',
    label: 'Botanicals',
    category: 'Botanical',
    icon: 'i-lucide-leaf',
    description: 'Herbs, spices, citrus peels, and botanical flavorings',
  },
  {
    key: 'other',
    label: 'Other',
    category: 'Other',
    icon: 'i-lucide-box',
    description: 'Cleaning supplies, lab supplies, and miscellaneous items',
  },
]

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export function getStockStatus(quantity: number, reorderPoint: number): StockStatus {
  if (quantity <= 0) return 'Out of Stock'
  if (quantity <= reorderPoint) return 'Low Stock'
  return 'In Stock'
}

export function getStockStatusColor(status: StockStatus): 'success' | 'warning' | 'error' {
  if (status === 'Out of Stock') return 'error'
  if (status === 'Low Stock') return 'warning'
  return 'success'
}

export function getCategoryBySlug(slug: string): InventoryCategoryDef | undefined {
  return INVENTORY_CATEGORIES.find((c) => c.key === slug)
}
