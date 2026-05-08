import type { Inventory } from "~/types";

interface BottleStockStatus {
  currentStock: number;
  avgMonthlyUsage: number;
  monthsRemaining: number;
  isLowStock: boolean;
}

const LOW_STOCK_THRESHOLD_MONTHS = 1;
const TRAILING_MONTHS = 12;
const DAYS_PER_MONTH = 30.44;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Compute stock metrics from a list of inventory records.
 * - Uses only the trailing 12 months of usage data.
 * - Skips intervals where prior stock was 0 (out-of-stock periods).
 * - Skips intervals that increase (restocks).
 * - Clips intervals that straddle the 12-month window so usage and active
 *   days are prorated to the windowed portion only.
 */
function computeStockStatus(records: Inventory[]): BottleStockStatus {
  if (records.length === 0) {
    return { currentStock: 0, avgMonthlyUsage: 0, monthsRemaining: Infinity, isLowStock: false };
  }

  const sorted = sortByDateAsc(records);
  const currentStock = sorted[sorted.length - 1]!.quantity;
  const cutoffMs = Date.now() - TRAILING_MONTHS * DAYS_PER_MONTH * MS_PER_DAY;

  let totalUsage = 0;
  let totalActiveDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const curr = sorted[i]!;
    const prevMs = new Date(prev.date).getTime();
    const currMs = new Date(curr.date).getTime();

    if (currMs <= cutoffMs) continue;
    if (prev.quantity === 0) continue;
    if (curr.quantity >= prev.quantity) continue;

    const intervalMs = currMs - prevMs;
    if (intervalMs <= 0) continue;

    const startMs = Math.max(prevMs, cutoffMs);
    const overlapMs = currMs - startMs;
    if (overlapMs <= 0) continue;

    const ratio = overlapMs / intervalMs;
    totalUsage += (prev.quantity - curr.quantity) * ratio;
    totalActiveDays += overlapMs / MS_PER_DAY;
  }

  const avgMonthlyUsage =
    totalActiveDays > 0 ? totalUsage / (totalActiveDays / DAYS_PER_MONTH) : 0;
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
