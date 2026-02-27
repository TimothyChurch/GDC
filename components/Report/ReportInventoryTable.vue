<script setup lang="ts">
import { Bar } from 'vue-chartjs'

const itemStore = useItemStore()
const bottleStore = useBottleStore()
const inventoryStore = useInventoryStore()
const productionStore = useProductionStore()

// Reports need full history for accurate delta and value calculations
onMounted(() => inventoryStore.loadAllHistory())

// Toggle: show out-of-stock items (default off)
const showOutOfStock = ref(false)

// All item inventory (with trackInventory filter applied)
const allItemInventory = computed(() => {
  return itemStore.items.filter(item => item.trackInventory !== false).map(item => {
    const records = inventoryStore.inventories
      .filter(inv => inv.item === item._id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestQty = records.length > 0 ? records[0].quantity : 0
    const previousQty = records.length > 1 ? records[1].quantity : null
    const unitPrice = latestPrice(item._id) || 0
    return {
      _id: item._id,
      name: item.name,
      type: item.type || 'Other',
      unit: item.inventoryUnit || '',
      currentStock: latestQty,
      previousStock: previousQty,
      delta: previousQty !== null ? latestQty - previousQty : null,
      lastCounted: records.length > 0 ? new Date(records[0].date) : null,
      unitPrice,
      totalValue: latestQty * unitPrice,
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})

// Filtered item inventory (respects showOutOfStock toggle)
const itemInventory = computed(() => {
  if (showOutOfStock.value) return allItemInventory.value
  return allItemInventory.value.filter(i => i.currentStock > 0)
})

// All bottle inventory
const allBottleInventory = computed(() => {
  return bottleStore.activeBottles.map(bottle => {
    const records = inventoryStore.inventories
      .filter(inv => inv.item === bottle._id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestQty = records.length > 0 ? records[0].quantity : 0
    const totalProduced = productionStore.productions
      .filter(p => p.bottle === bottle._id)
      .reduce((sum, p) => sum + (p.quantity || 0), 0)
    return {
      _id: bottle._id,
      name: bottle.name,
      class: bottle.class || '',
      currentStock: latestQty,
      totalProduced,
      price: bottle.price || 0,
      retailValue: latestQty * (bottle.price || 0),
      inStock: bottle.inStock,
      lastCounted: records.length > 0 ? new Date(records[0].date) : null,
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})

// Filtered bottle inventory (respects showOutOfStock toggle)
const bottleInventory = computed(() => {
  if (showOutOfStock.value) return allBottleInventory.value
  return allBottleInventory.value.filter(b => b.currentStock > 0)
})

// Summary stats (always computed from ALL items for accurate totals)
const totalItemValue = computed(() =>
  allItemInventory.value.reduce((sum, i) => sum + i.totalValue, 0)
)
const totalBottleRetailValue = computed(() =>
  allBottleInventory.value.reduce((sum, b) => sum + b.retailValue, 0)
)
const outOfStockItemCount = computed(() =>
  allItemInventory.value.filter(i => i.currentStock <= 0).length
)
const totalBottlesOnHand = computed(() =>
  allBottleInventory.value.reduce((sum, b) => sum + b.currentStock, 0)
)

// Inventory by type chart (always uses full inventory for accurate picture)
const inventoryByType = computed(() => {
  const typeMap = new Map<string, number>()
  allItemInventory.value.forEach(item => {
    const type = item.type || 'Other'
    typeMap.set(type, (typeMap.get(type) || 0) + item.totalValue)
  })
  const sorted = Array.from(typeMap.entries()).sort(([, a], [, b]) => b - a)
  return {
    labels: sorted.map(([k]) => k),
    datasets: [{
      label: 'Value by Type',
      data: sorted.map(([, v]) => v),
      backgroundColor: 'rgba(184, 115, 51, 0.6)',
      borderColor: 'rgba(184, 115, 51, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  scales: {
    x: { ticks: { color: 'rgba(245, 245, 220, 0.5)', callback: (v: any) => '$' + v }, grid: { color: 'rgba(139, 69, 19, 0.15)' } },
    y: { ticks: { color: 'rgba(245, 245, 220, 0.5)' }, grid: { display: false } },
  },
  plugins: {
    legend: { display: false },
  },
}

const activeTab = ref<'items' | 'bottles'>('items')
</script>

<template>
  <div class="space-y-6">
    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-copper">{{ Dollar.format(totalItemValue) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Raw Material Value</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-gold">{{ Dollar.format(totalBottleRetailValue) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Bottle Retail Value</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment">{{ totalBottlesOnHand }}</div>
        <div class="text-xs text-parchment/60 mt-1">Bottles On Hand</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold" :class="outOfStockItemCount > 0 ? 'text-red-400' : 'text-green-400'">
          {{ outOfStockItemCount }}
        </div>
        <div class="text-xs text-parchment/60 mt-1">Out of Stock Items</div>
      </div>
    </div>

    <!-- Value by type chart -->
    <div v-if="inventoryByType.labels.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Inventory Value by Type</h3>
      <div class="h-48">
        <Bar :data="inventoryByType" :options="barOptions" />
      </div>
    </div>

    <!-- Filter controls -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <!-- Tab toggle -->
      <div class="flex items-center gap-1.5 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit">
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          :class="activeTab === 'items' ? 'bg-gold/15 text-gold border border-gold/20' : 'text-parchment/50 hover:text-parchment/70 border border-transparent'"
          @click="activeTab = 'items'"
        >
          Raw Materials ({{ itemInventory.length }})
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          :class="activeTab === 'bottles' ? 'bg-gold/15 text-gold border border-gold/20' : 'text-parchment/50 hover:text-parchment/70 border border-transparent'"
          @click="activeTab = 'bottles'"
        >
          Finished Goods ({{ bottleInventory.length }})
        </button>
      </div>

      <!-- Show out-of-stock toggle -->
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <USwitch v-model="showOutOfStock" />
        <span class="text-xs text-parchment/60">
          Show out-of-stock items
          <span v-if="outOfStockItemCount > 0 && !showOutOfStock" class="text-red-400/70">({{ outOfStockItemCount }} hidden)</span>
        </span>
      </label>
    </div>

    <!-- Items table -->
    <div v-if="activeTab === 'items'" class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Raw Material Stock</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Item</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Type</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Stock</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Delta</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Unit Price</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Value</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Last Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in itemInventory"
              :key="item._id"
              class="border-b border-brown/10 hover:bg-brown/10"
            >
              <td class="py-2 px-3 text-parchment">{{ item.name }}</td>
              <td class="py-2 px-3 text-parchment/60">{{ item.type }}</td>
              <td class="py-2 px-3 text-right text-parchment">
                {{ item.currentStock }} {{ item.unit }}
              </td>
              <td class="py-2 px-3 text-right">
                <span v-if="item.delta !== null" :class="item.delta > 0 ? 'text-green-400' : item.delta < 0 ? 'text-red-400' : 'text-parchment/60'">
                  {{ item.delta > 0 ? '+' : '' }}{{ item.delta }}
                </span>
                <span v-else class="text-parchment/20">--</span>
              </td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ Dollar.format(item.unitPrice) }}</td>
              <td class="py-2 px-3 text-right text-copper">{{ Dollar.format(item.totalValue) }}</td>
              <td class="py-2 px-3 text-right text-parchment/50">
                {{ item.lastCounted ? item.lastCounted.toLocaleDateString() : '--' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="itemInventory.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          <template v-if="!showOutOfStock && allItemInventory.length > 0">
            All {{ allItemInventory.length }} items are out of stock. Toggle "Show out-of-stock items" to view them.
          </template>
          <template v-else>
            No inventory items
          </template>
        </div>
      </div>
    </div>

    <!-- Bottles table -->
    <div v-if="activeTab === 'bottles'" class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Finished Goods Stock</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Class</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">On Hand</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Total Produced</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Price</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Retail Value</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium">Status</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Last Count</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bottle in bottleInventory"
              :key="bottle._id"
              class="border-b border-brown/10 hover:bg-brown/10"
            >
              <td class="py-2 px-3 text-parchment">{{ bottle.name }}</td>
              <td class="py-2 px-3 text-parchment/60">{{ bottle.class }}</td>
              <td class="py-2 px-3 text-right text-parchment font-semibold">{{ bottle.currentStock }}</td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ bottle.totalProduced }}</td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ Dollar.format(bottle.price) }}</td>
              <td class="py-2 px-3 text-right text-gold">{{ Dollar.format(bottle.retailValue) }}</td>
              <td class="py-2 px-3 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="bottle.currentStock > 0
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'"
                >
                  {{ bottle.currentStock > 0 ? 'In Stock' : 'Out' }}
                </span>
              </td>
              <td class="py-2 px-3 text-right text-parchment/50">
                {{ bottle.lastCounted ? bottle.lastCounted.toLocaleDateString() : '--' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="bottleInventory.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          <template v-if="!showOutOfStock && allBottleInventory.length > 0">
            All {{ allBottleInventory.length }} products are out of stock. Toggle "Show out-of-stock items" to view them.
          </template>
          <template v-else>
            No bottle products
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
