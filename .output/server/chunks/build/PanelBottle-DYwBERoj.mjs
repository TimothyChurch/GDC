import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { defineAsyncComponent, computed } from 'vue';

const LOW_STOCK_THRESHOLD_MONTHS = 1;
function computeStockStatus(records) {
  if (records.length === 0) {
    return { currentStock: 0, avgMonthlyUsage: 0, monthsRemaining: Infinity, isLowStock: false };
  }
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const currentStock = sorted[sorted.length - 1].quantity;
  let totalUsage = 0;
  let totalActiveDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevQty = sorted[i - 1].quantity;
    const currQty = sorted[i].quantity;
    if (prevQty === 0) continue;
    if (currQty < prevQty) {
      const days = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1e3 * 60 * 60 * 24);
      totalUsage += prevQty - currQty;
      totalActiveDays += days;
    }
  }
  const avgMonthlyUsage = totalActiveDays > 0 ? totalUsage / (totalActiveDays / 30.44) : 0;
  const monthsRemaining = avgMonthlyUsage > 0 ? currentStock / avgMonthlyUsage : Infinity;
  const isLowStock = currentStock > 0 && monthsRemaining < LOW_STOCK_THRESHOLD_MONTHS;
  return { currentStock, avgMonthlyUsage, monthsRemaining, isLowStock };
}
function useBottleStock() {
  const bottleStore = useBottleStore();
  const inventoryStore = useInventoryStore();
  const stockMap = computed(() => {
    const map = /* @__PURE__ */ new Map();
    for (const bottle of bottleStore.bottles) {
      const records = inventoryStore.getInventoriesByItem(bottle._id);
      if (records.length === 0) continue;
      map.set(bottle._id, computeStockStatus(records));
    }
    return map;
  });
  const getStockStatus = (bottleId) => stockMap.value.get(bottleId);
  const isLowStock = (bottleId) => stockMap.value.get(bottleId)?.isLowStock ?? false;
  return { stockMap, getStockStatus, isLowStock };
}
const LazyPanelBottle = defineAsyncComponent(() => import('./PanelBottle-C4_stpw5.mjs').then((r) => r["default"] || r.default || r));

export { LazyPanelBottle as L, useBottleStock as u };
//# sourceMappingURL=PanelBottle-DYwBERoj.mjs.map
