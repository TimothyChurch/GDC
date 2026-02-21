import type { Inventory } from "~/types";

interface BottleStockStatus {
  currentStock: number;
  avgMonthlyUsage: number;
  monthsRemaining: number;
  isLowStock: boolean;
}

const LOW_STOCK_THRESHOLD_MONTHS = 1;

/**
 * Compute stock metrics from a sorted (chronological) list of inventory records.
 * Ignores out-of-stock periods and restock intervals.
 */
function computeStockStatus(records: Inventory[]): BottleStockStatus {
  if (records.length === 0) {
    return { currentStock: 0, avgMonthlyUsage: 0, monthsRemaining: Infinity, isLowStock: false };
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const currentStock = sorted[sorted.length - 1].quantity;

  let totalUsage = 0;
  let totalActiveDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevQty = sorted[i - 1].quantity;
    const currQty = sorted[i].quantity;
    if (prevQty === 0) continue;
    if (currQty < prevQty) {
      const days =
        (new Date(sorted[i].date).getTime() -
          new Date(sorted[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24);
      totalUsage += prevQty - currQty;
      totalActiveDays += days;
    }
  }

  const avgMonthlyUsage =
    totalActiveDays > 0 ? totalUsage / (totalActiveDays / 30.44) : 0;
  const monthsRemaining =
    avgMonthlyUsage > 0 ? currentStock / avgMonthlyUsage : Infinity;
  const isLowStock =
    currentStock > 0 && monthsRemaining < LOW_STOCK_THRESHOLD_MONTHS;

  return { currentStock, avgMonthlyUsage, monthsRemaining, isLowStock };
}

/**
 * Reactive composable that provides stock status for all bottles.
 * Uses both bottle and inventory stores.
 */
export function useBottleStock() {
  const bottleStore = useBottleStore();
  const inventoryStore = useInventoryStore();

  const stockMap = computed(() => {
    const map = new Map<string, BottleStockStatus>();
    for (const bottle of bottleStore.bottles) {
      const records = inventoryStore.getInventoriesByItem(bottle._id);
      if (records.length === 0) continue;
      map.set(bottle._id, computeStockStatus(records));
    }
    return map;
  });

  const getStockStatus = (bottleId: string): BottleStockStatus | undefined =>
    stockMap.value.get(bottleId);

  const isLowStock = (bottleId: string): boolean =>
    stockMap.value.get(bottleId)?.isLowStock ?? false;

  return { stockMap, getStockStatus, isLowStock };
}
