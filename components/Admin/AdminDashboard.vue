<script setup lang="ts">
import { LazyPanelBatch, LazyPanelProduction } from '#components'

const batchStore = useBatchStore();
const bottleStore = useBottleStore();
const productionStore = useProductionStore();
const purchaseOrderStore = usePurchaseOrderStore();
const inventoryStore = useInventoryStore();
const itemStore = useItemStore();
const overlay = useOverlay();

async function openQuickAdd(type: 'batch' | 'production') {
  if (type === 'batch') {
    batchStore.resetItem();
    const panel = overlay.create(LazyPanelBatch);
    await panel.open();
  } else {
    productionStore.resetItem();
    const panel = overlay.create(LazyPanelProduction);
    await panel.open();
  }
}

const now = ref(new Date());
onMounted(() => {
  setInterval(() => {
    now.value = new Date();
  }, 60000);
});

const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});

// KPI: Active Batches
const activeBatches = computed(() =>
  batchStore.batches.filter((b) => b.status === 'active' && b.currentStage !== 'Upcoming').length
);
const upcomingBatches = computed(() =>
  batchStore.batches.filter((b) => b.currentStage === 'Upcoming' && b.status === 'active').length
);

// KPI: Bottles in Stock
const inStockBottles = computed(() =>
  bottleStore.bottles.filter((b) => b.inStock !== false).length
);
const totalBottles = computed(() => bottleStore.bottles.length);

// KPI: Pending POs
const pendingPOs = computed(() =>
  purchaseOrderStore.purchaseOrders.filter((po) =>
    ['Pending', 'Confirmed', 'Shipped'].includes(po.status)
  )
);
const pendingPOCount = computed(() => pendingPOs.value.length);
const pendingPOTotal = computed(() =>
  Dollar.format(pendingPOs.value.reduce((sum, po) => sum + (po.total || 0), 0))
);

// KPI: Low Inventory — use each item's reorderPoint (default 0 = no alert)
const lowInventoryAlerts = computed(() => {
  let count = 0;
  for (const item of itemStore.items) {
    if (!item.reorderPoint || item.reorderPoint <= 0) continue;
    const stock = inventoryStore.getCurrentStock(item._id);
    if (stock <= item.reorderPoint) count++;
  }
  return count;
});

// KPI: This Month's Productions
const monthProductions = computed(() => {
  const currentMonth = now.value.getMonth();
  const currentYear = now.value.getFullYear();
  return productionStore.productions.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
});
const monthProductionQuantity = computed(() =>
  monthProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
);
const monthProductionRuns = computed(() => monthProductions.value.length);

// Loading state
const isLoading = computed(() =>
  batchStore.loading || bottleStore.loading || productionStore.loading
);
</script>

<template>
  <div class="space-y-6">
    <!-- Header with greeting -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-parchment font-[Cormorant_Garamond]">
          {{ greeting }}
        </h1>
        <p class="text-sm text-parchment/60 mt-1">
          Here is an overview of your distillery operations.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton size="sm" variant="soft" class="bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20" @click="openQuickAdd('batch')">
          <UIcon name="i-lucide-plus" class="mr-1" />
          New Batch
        </UButton>
        <UButton size="sm" variant="soft" class="bg-copper/10 text-copper border border-copper/20 hover:bg-copper/20" @click="openQuickAdd('production')">
          <UIcon name="i-lucide-factory" class="mr-1" />
          Record Production
        </UButton>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-parchment/60">
        <UIcon name="i-lucide-loader-2" class="text-xl animate-spin text-gold" />
        <span class="text-sm">Loading operations data...</span>
      </div>
    </div>

    <template v-else>
      <!-- KPI Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <DashboardStatCard
          title="Active Batches"
          :value="activeBatches"
          :subtitle="`${upcomingBatches} upcoming`"
          icon="i-lucide-flask-conical"
          color="gold"
          to="/admin/batch"
        />
        <DashboardStatCard
          title="Bottles in Stock"
          :value="inStockBottles"
          :subtitle="`of ${totalBottles} total`"
          icon="i-lucide-wine"
          color="copper"
          to="/admin/bottles"
        />
        <DashboardStatCard
          title="Pending POs"
          :value="pendingPOCount"
          :subtitle="pendingPOTotal"
          icon="i-lucide-receipt"
          color="amber"
          to="/admin/purchaseOrders"
        />
        <DashboardStatCard
          title="Low Inventory"
          :value="lowInventoryAlerts"
          subtitle="items need reorder"
          icon="i-lucide-alert-triangle"
          color="red"
          to="/admin/items"
        />
        <DashboardStatCard
          title="This Month"
          :value="monthProductionQuantity"
          :subtitle="`${monthProductionRuns} production runs`"
          icon="i-lucide-factory"
          color="green"
          to="/admin/production"
        />
      </div>

      <!-- Batch Pipeline -->
      <DashboardBatchPipeline />

      <!-- Main content grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Left column (2/3) -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Action Items + Recent Productions row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardActionItems />
            <DashboardRecentProductions />
          </div>

          <!-- Vessel Overview -->
          <DashboardVesselOverview />
        </div>

        <!-- Right column (1/3) -->
        <div class="space-y-6">
          <DashboardLowInventory />
          <DashboardRevenue />
          <DashboardBottleInventoryQuick />
        </div>
      </div>
    </template>
  </div>
</template>
