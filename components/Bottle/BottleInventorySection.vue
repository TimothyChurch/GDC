<script setup lang="ts">
import { Line } from "vue-chartjs";
useChartRegistration();

const props = defineProps<{
  bottleId: string
}>()

import { LazyPanelInventory } from "#components";

const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();
const overlay = useOverlay();
const inventoryPanel = overlay.create(LazyPanelInventory);
const { confirm } = useDeleteConfirm();
const { getStockStatus } = useBottleStock();

const bottle = computed(() => bottleStore.getBottleById(props.bottleId));

const inventory = computed(() =>
  inventoryStore.getInventoriesByItem(props.bottleId),
);

const addInventory = ref(false);
const showRecords = ref(false);

const inventoryNewestFirst = computed(() =>
  [...inventory.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
);

const sortedInventory = computed(() =>
  [...inventory.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  ),
);

const currentStock = computed(() => {
  if (sortedInventory.value.length === 0) return 0;
  return sortedInventory.value[sortedInventory.value.length - 1]?.quantity ?? 0;
});

const stockStatus = computed(() => getStockStatus(props.bottleId));
const avgMonthlyUsage = computed(() => stockStatus.value?.avgMonthlyUsage ?? 0);
const monthsOfStockRemaining = computed(() => stockStatus.value?.monthsRemaining ?? Infinity);
const isLowStock = computed(() => stockStatus.value?.isLowStock ?? false);

const chartData = computed(() => ({
  labels: sortedInventory.value.map((inv) =>
    new Date(inv.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  ),
  datasets: [
    {
      label: "Stock",
      data: sortedInventory.value.map((inv) => inv.quantity),
      borderColor: "#d4a574",
      backgroundColor: "rgba(212, 165, 116, 0.1)",
      tension: 0.3,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: { color: "rgba(255,255,255,0.4)" },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    x: {
      ticks: { color: "rgba(255,255,255,0.4)" },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

const editRecord = (inv: typeof inventory.value[number]) => {
  inventoryStore.inventory = { ...inv };
  inventoryPanel.open();
};

const deleteRecord = async (id: string) => {
  const confirmed = await confirm('inventory record');
  if (!confirmed) return;
  await inventoryStore.deleteInventory(id);

  if (!bottle.value) return;
  const shouldBeInStock = currentStock.value > 0;
  if (bottle.value.inStock !== shouldBeInStock) {
    bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
    await bottleStore.updateBottle();
  }
};

const updateInventory = async () => {
  inventoryStore.inventory.item = props.bottleId;
  await inventoryStore.updateInventory();
  addInventory.value = false;

  if (!bottle.value) return;
  const shouldBeInStock = currentStock.value > 0;
  if (bottle.value.inStock !== shouldBeInStock) {
    bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
    await bottleStore.updateBottle();
  }
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
          Inventory
        </h3>
        <p class="text-xs text-parchment/60 mt-0.5">
          Current stock: {{ currentStock }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="inventory.length > 0"
          :icon="showRecords ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="showRecords = !showRecords"
        >
          {{ showRecords ? 'Hide Records' : 'View Records' }}
        </UButton>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          variant="outline"
          @click="addInventory = !addInventory"
        >
          Add Entry
        </UButton>
      </div>
    </div>

    <!-- Usage stats -->
    <div
      v-if="avgMonthlyUsage > 0"
      class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
    >
      <div class="rounded-lg border border-brown/20 bg-brown/5 p-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Avg. Monthly Usage</div>
        <div class="text-lg font-semibold text-parchment">{{ avgMonthlyUsage.toFixed(1) }}</div>
      </div>
      <div class="rounded-lg border border-brown/20 bg-brown/5 p-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Months Remaining</div>
        <div :class="['text-lg font-semibold', isLowStock ? 'text-red-400' : 'text-parchment']">
          {{ monthsOfStockRemaining === Infinity ? '--' : monthsOfStockRemaining.toFixed(1) }}
        </div>
      </div>
      <div
        v-if="isLowStock"
        class="col-span-2 sm:col-span-1 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 p-3"
      >
        <UIcon name="i-lucide-triangle-alert" class="text-red-400 text-lg shrink-0" />
        <div class="text-sm text-red-400 font-medium">Low stock — less than 1 month remaining</div>
      </div>
    </div>

    <!-- Add entry form -->
    <div v-if="addInventory" class="mb-4 p-3 rounded-lg border border-brown/20 bg-brown/5">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <div class="text-xs text-parchment/60 mb-1">Date</div>
          <SiteDatePicker v-model="inventoryStore.inventory.date" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Quantity</div>
          <UInput v-model="inventoryStore.inventory.quantity" type="number" placeholder="0" />
        </div>
        <div class="flex gap-2">
          <UButton @click="updateInventory" size="sm">Add</UButton>
          <UButton color="neutral" variant="outline" size="sm" @click="addInventory = false">Cancel</UButton>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="sortedInventory.length > 1" class="h-48">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="text-center py-6">
      <UIcon name="i-lucide-archive" class="text-2xl text-parchment/20 mx-auto mb-2" />
      <p class="text-sm text-parchment/50">No inventory records</p>
    </div>

    <!-- Inventory Records List -->
    <div v-if="showRecords && inventoryNewestFirst.length > 0" class="mt-4 space-y-2">
      <h4 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-2">
        Records ({{ inventoryNewestFirst.length }})
      </h4>
      <div
        v-for="inv in inventoryNewestFirst"
        :key="inv._id"
        class="flex items-center justify-between rounded-lg border border-brown/20 bg-brown/5 px-4 py-3"
      >
        <div class="flex items-center gap-4">
          <span class="text-sm text-parchment">
            {{ new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}
          </span>
          <span class="text-sm font-semibold text-parchment">{{ inv.quantity }} units</span>
        </div>
        <UDropdownMenu
          :items="[
            { label: 'Edit', icon: 'i-lucide-pencil', onSelect: () => editRecord(inv) },
            { label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' as const, onSelect: () => deleteRecord(inv._id) },
          ]"
        >
          <UButton icon="i-lucide-ellipsis-vertical" size="xs" variant="ghost" color="neutral" />
        </UDropdownMenu>
      </div>
    </div>
  </div>
</template>
