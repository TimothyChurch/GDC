<script setup lang="ts">
const productionStore = useProductionStore();
const bottleStore = useBottleStore();

// Calculate estimated revenue from production records and bottle prices
const estimatedRevenue = computed(() => {
  return productionStore.productions.reduce((total, prod) => {
    const bottle = bottleStore.getBottleById(prod.bottle);
    const price = bottle?.price || 0;
    return total + (price * prod.quantity);
  }, 0);
});

const estimatedCosts = computed(() => {
  return productionStore.productions.reduce((total, prod) => {
    return total + (prod.productionCost || 0) + (prod.bottleCost || 0);
  }, 0);
});

const totalBottlesProduced = computed(() => {
  return productionStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
});

// PLACEHOLDER: Replace with real monthly data when available
const monthlyMetrics = [
  { label: 'This Month', revenue: '$12,450', orders: '34' },
  { label: 'Last Month', revenue: '$10,890', orders: '29' },
  { label: 'Avg Monthly', revenue: '$11,200', orders: '31' },
];
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Financial Overview</h2>
      <!-- PLACEHOLDER: Replace with real time period selector -->
      <span class="text-[10px] uppercase tracking-wider text-parchment/30 bg-brown/20 px-2 py-1 rounded">
        All Time
      </span>
    </div>

    <!-- Key metrics -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-brown/15 rounded-lg p-3 border border-brown/20">
        <div class="text-xs text-parchment/40 mb-1">Est. Revenue</div>
        <div class="text-lg font-bold text-gold font-[Cormorant_Garamond]">
          {{ Dollar.format(estimatedRevenue) }}
        </div>
      </div>
      <div class="bg-brown/15 rounded-lg p-3 border border-brown/20">
        <div class="text-xs text-parchment/40 mb-1">Total Costs</div>
        <div class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
          {{ Dollar.format(estimatedCosts) }}
        </div>
      </div>
      <div class="bg-brown/15 rounded-lg p-3 border border-brown/20">
        <div class="text-xs text-parchment/40 mb-1">Est. Margin</div>
        <div class="text-lg font-bold font-[Cormorant_Garamond]" :class="estimatedRevenue - estimatedCosts > 0 ? 'text-green-400' : 'text-red-400'">
          {{ Dollar.format(estimatedRevenue - estimatedCosts) }}
        </div>
      </div>
    </div>

    <!-- PLACEHOLDER: Monthly breakdown - replace with real data -->
    <div class="border-t border-brown/20 pt-3">
      <div class="text-[10px] uppercase tracking-wider text-parchment/30 mb-2">
        Monthly Summary
        <span class="text-amber/50 ml-1">(placeholder)</span>
      </div>
      <div class="flex flex-col divide-y divide-brown/15">
        <div
          v-for="metric in monthlyMetrics"
          :key="metric.label"
          class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
        >
          <span class="text-xs text-parchment/50">{{ metric.label }}</span>
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-parchment">{{ metric.revenue }}</span>
            <span class="text-xs text-parchment/30">{{ metric.orders }} orders</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
