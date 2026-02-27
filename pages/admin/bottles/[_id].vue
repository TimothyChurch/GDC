<script setup lang="ts">
definePageMeta({ layout: "admin" });

import { Line } from "vue-chartjs";

const route = useRoute();
const router = useRouter();

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();
const inventoryStore = useInventoryStore();
const productionStore = useProductionStore();
const batchStore = useBatchStore();
const vesselStore = useVesselStore();
const { getStockStatus } = useBottleStock();

const bottle = computed(() =>
  bottleStore.getBottleById(route.params._id as string),
);
const recipe = computed(() =>
  bottle.value?.recipe
    ? recipeStore.getRecipeById(bottle.value.recipe)
    : undefined,
);
const inventory = computed(() =>
  inventoryStore.getInventoriesByItem(route.params._id as string),
);

// Production history for this bottle (sorted most recent first)
const bottleProductions = computed(() =>
  productionStore.getProductionsByBottle(route.params._id as string),
);

// Most recent production's cost per bottle
const latestBottleCost = computed(() => {
  if (bottleProductions.value.length === 0) return null;
  return bottleProductions.value[0].bottleCost;
});

// Total bottles ever produced
const totalProduced = computed(() =>
  bottleProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0),
);

// Reverse-lookup: find the batch linked to a production record
const getBatchForProduction = (productionId: string) => {
  return batchStore.batches.find(
    (b) => b.stages?.bottled?.productionRecord === productionId,
  );
};

// Resolve vessel names for a production
const getVesselNames = (vesselIds: string[]) => {
  return vesselIds
    .map((id) => vesselStore.getVesselById(id)?.name)
    .filter(Boolean)
    .join(", ");
};

// Panel slide-overs
import { LazyPanelBottle, LazyPanelInventory } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelBottle);
const inventoryPanel = overlay.create(LazyPanelInventory);
const { confirm } = useDeleteConfirm();

const editBottle = () => {
  if (!bottle.value) return;
  bottleStore.setBottle(bottle.value._id);
  panel.open();
};

// Inventory records
const addInventory = ref(false);
const showRecords = ref(false);

// Inventory sorted newest-first for the records list
const inventoryNewestFirst = computed(() =>
  [...inventory.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
);

const editRecord = (inv: typeof inventory.value[number]) => {
  inventoryStore.inventory = { ...inv };
  inventoryPanel.open();
};

const deleteRecord = async (id: string) => {
  const confirmed = await confirm('inventory record');
  if (!confirmed) return;
  await inventoryStore.deleteInventory(id);

  // Auto-sync inStock based on latest inventory level
  if (!bottle.value) return;
  const shouldBeInStock = currentStock.value > 0;
  if (bottle.value.inStock !== shouldBeInStock) {
    bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
    await bottleStore.updateBottle();
  }
};
const updateInventory = async () => {
  inventoryStore.inventory.item = route.params._id as string;
  await inventoryStore.updateInventory();
  addInventory.value = false;

  // Auto-sync inStock based on latest inventory level
  if (!bottle.value) return;
  const shouldBeInStock = currentStock.value > 0;
  if (bottle.value.inStock !== shouldBeInStock) {
    bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
    await bottleStore.updateBottle();
  }
};

// Inventory chart
const sortedInventory = computed(() =>
  [...inventory.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  ),
);

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

const currentStock = computed(() => {
  if (sortedInventory.value.length === 0) return 0;
  return sortedInventory.value[sortedInventory.value.length - 1].quantity;
});

// Stock metrics from shared composable
const stockStatus = computed(() => getStockStatus(route.params._id as string));
const avgMonthlyUsage = computed(() => stockStatus.value?.avgMonthlyUsage ?? 0);
const monthsOfStockRemaining = computed(() => stockStatus.value?.monthsRemaining ?? Infinity);
const isLowStock = computed(() => stockStatus.value?.isLowStock ?? false);
</script>

<template>
  <div v-if="!bottleStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="bottle" class="space-y-6">
    <AdminPageHeader
      :title="bottle.name"
      :subtitle="`${bottle.class || ''}${bottle.type ? ' - ' + bottle.type : ''}`"
      icon="i-lucide-wine"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/bottles')"
        >
          Back
        </UButton>
        <UButton icon="i-lucide-pencil" size="sm" @click="editBottle">
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Bottle Details -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Bottle Details
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Recipe
          </div>
          <NuxtLink
            v-if="recipe"
            :to="`/admin/recipes/${recipe._id}`"
            class="text-sm text-copper hover:text-gold transition-colors"
          >
            {{ recipe.name }}
          </NuxtLink>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            ABV
          </div>
          <div class="text-sm text-parchment">{{ bottle.abv || 0 }}%</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Price
          </div>
          <div class="text-sm text-parchment font-semibold">
            {{ Dollar.format(bottle.price || 0) }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Cost / Bottle
          </div>
          <div v-if="latestBottleCost !== null" class="text-sm text-parchment font-semibold">
            {{ Dollar.format(latestBottleCost) }}
            <span
              v-if="bottle.price && latestBottleCost > 0"
              class="text-xs font-normal text-parchment/50 ml-1"
            >
              ({{ ((1 - latestBottleCost / bottle.price) * 100).toFixed(0) }}% margin)
            </span>
          </div>
          <div v-else class="text-sm text-parchment/50">No production data</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Status
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="bottle.archived"
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
            >
              Archived
            </span>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                bottle.inStock
                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/25',
              ]"
            >
              {{ bottle.inStock ? "In Stock" : "Out of Stock" }}
            </span>
          </div>
        </div>
        <div
          v-if="bottle.description"
          class="col-span-2 sm:col-span-3 lg:col-span-6"
        >
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Description
          </div>
          <div class="text-sm text-parchment/60">{{ bottle.description }}</div>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
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
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Avg. Monthly Usage
          </div>
          <div class="text-lg font-semibold text-parchment">
            {{ avgMonthlyUsage.toFixed(1) }}
          </div>
        </div>
        <div class="rounded-lg border border-brown/20 bg-brown/5 p-3">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Months Remaining
          </div>
          <div
            :class="[
              'text-lg font-semibold',
              isLowStock ? 'text-red-400' : 'text-parchment',
            ]"
          >
            {{ monthsOfStockRemaining === Infinity ? '--' : monthsOfStockRemaining.toFixed(1) }}
          </div>
        </div>
        <div
          v-if="isLowStock"
          class="col-span-2 sm:col-span-1 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 p-3"
        >
          <UIcon name="i-lucide-triangle-alert" class="text-red-400 text-lg shrink-0" />
          <div class="text-sm text-red-400 font-medium">
            Low stock — less than 1 month remaining
          </div>
        </div>
      </div>

      <!-- Add entry form -->
      <div
        v-if="addInventory"
        class="mb-4 p-3 rounded-lg border border-brown/20 bg-brown/5"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <div class="text-xs text-parchment/60 mb-1">Date</div>
            <SiteDatePicker v-model="inventoryStore.inventory.date" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">Quantity</div>
            <UInput
              v-model="inventoryStore.inventory.quantity"
              type="number"
              placeholder="0"
            />
          </div>
          <div class="flex gap-2">
            <UButton @click="updateInventory" size="sm">Add</UButton>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              @click="addInventory = false"
              >Cancel</UButton
            >
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div v-if="sortedInventory.length > 1" class="h-48">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div v-else class="text-center py-6">
        <UIcon
          name="i-lucide-archive"
          class="text-2xl text-parchment/20 mx-auto mb-2"
        />
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
            <span class="text-sm font-semibold text-parchment">
              {{ inv.quantity }} units
            </span>
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

    <!-- Production History -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
            Production History
          </h3>
          <p v-if="bottleProductions.length > 0" class="text-xs text-parchment/60 mt-0.5">
            {{ bottleProductions.length }} production{{ bottleProductions.length !== 1 ? 's' : '' }}
            &middot; {{ totalProduced }} bottles produced
          </p>
        </div>
      </div>

      <!-- Production list -->
      <div v-if="bottleProductions.length > 0" class="space-y-3">
        <div
          v-for="prod in bottleProductions"
          :key="prod._id"
          class="rounded-lg border border-brown/20 bg-brown/5 p-4 cursor-pointer hover:border-copper/40 transition-colors"
          @click="router.push(`/admin/production/${prod._id}`)"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <!-- Date and batch info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-parchment">
                  {{ new Date(prod.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </span>
                <span
                  v-if="prod._id === bottleProductions[0]._id"
                  class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-copper/15 text-copper border border-copper/25"
                >
                  Latest
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-parchment/60">
                <span v-if="getVesselNames(prod.vessel)">
                  <UIcon name="i-lucide-container" class="inline-block mr-0.5 align-text-bottom" />
                  {{ getVesselNames(prod.vessel) }}
                </span>
                <NuxtLink
                  v-if="getBatchForProduction(prod._id)"
                  :to="`/admin/batch/${getBatchForProduction(prod._id)?._id}`"
                  class="text-copper hover:text-gold transition-colors"
                  @click.stop
                >
                  <UIcon name="i-lucide-flask-conical" class="inline-block mr-0.5 align-text-bottom" />
                  Batch #{{ getBatchForProduction(prod._id)?.batchNumber || getBatchForProduction(prod._id)?._id?.slice(-6) }}
                </NuxtLink>
              </div>
            </div>

            <!-- Metrics -->
            <div class="flex items-center gap-4 sm:gap-6 text-right">
              <div>
                <div class="text-xs text-parchment/60 uppercase tracking-wider">Qty</div>
                <div class="text-sm font-semibold text-parchment">{{ prod.quantity }}</div>
              </div>
              <div>
                <div class="text-xs text-parchment/60 uppercase tracking-wider">Cost/Bottle</div>
                <div class="text-sm font-semibold text-copper">{{ Dollar.format(prod.bottleCost || 0) }}</div>
              </div>
              <div>
                <div class="text-xs text-parchment/60 uppercase tracking-wider">Total Cost</div>
                <div class="text-sm font-semibold text-parchment/70">{{ Dollar.format(prod.productionCost || 0) }}</div>
              </div>
              <UIcon name="i-lucide-chevron-right" class="text-parchment/30 shrink-0 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-6">
        <UIcon
          name="i-lucide-factory"
          class="text-2xl text-parchment/20 mx-auto mb-2"
        />
        <p class="text-sm text-parchment/50">No production records for this bottle</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon
      name="i-lucide-search-x"
      class="text-4xl text-parchment/20 mx-auto mb-3"
    />
    <p class="text-parchment/60">Bottle not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/bottles')"
    >
      Back to Bottles
    </UButton>
  </div>
</template>
