import { convertUnitRatio } from '~/utils/conversions'

/**
 * Composable for unit conversions and price-per-unit calculations.
 * Used by items/recipes to convert between purchase units and inventory units.
 */
export const useUnitConversion = () => {
  /**
   * Convert a quantity from one unit to another.
   * Returns the equivalent amount in the target unit.
   */
  const convertQuantity = (amount: number, fromUnit: string, toUnit: string): number => {
    return amount * convertUnitRatio(fromUnit, toUnit)
  }

  /**
   * Compute the price per single inventory unit from purchase details.
   *
   * Example: Bought 50 lb for $45, inventory unit is oz
   *   → 50 lb = 800 oz → $45 / 800 = $0.05625/oz
   */
  const computePricePerUnit = (
    purchasePrice: number,
    purchaseSize: number,
    purchaseSizeUnit: string,
    inventoryUnit: string
  ): number => {
    if (!purchasePrice || !purchaseSize) return 0
    const totalInventoryUnits = convertQuantity(purchaseSize, purchaseSizeUnit, inventoryUnit)
    if (totalInventoryUnits === 0) return 0
    return purchasePrice / totalInventoryUnits
  }

  /**
   * Compute the cost of a recipe ingredient given its amount/unit
   * and the item's price per inventory unit.
   */
  const ingredientCost = (
    pricePerInventoryUnit: number,
    amount: number,
    ingredientUnit: string,
    inventoryUnit: string
  ): number => {
    const converted = convertQuantity(amount, ingredientUnit, inventoryUnit)
    return pricePerInventoryUnit * converted
  }

  return {
    convertQuantity,
    computePricePerUnit,
    ingredientCost,
  }
}
