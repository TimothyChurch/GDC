<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const categories = useInventoryCategories()
const itemStore = useItemStore()
const inventoryStore = useInventoryStore()

const showOutOfStock = ref(false)

function getLatestQuantity(itemId: string): number {
  const records = inventoryStore.getInventoriesByItem(itemId)
  if (records.length === 0) return 0
  const sorted = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted[0].quantity
}

const categorizedItems = computed(() =>
  categories.value.map((cat) => {
    const allItems = itemStore.getItemsByCategory(cat.category)
    const items = showOutOfStock.value
      ? allItems
      : allItems.filter(item => getLatestQuantity(item._id) > 0)
    return { ...cat, items }
  }).filter((cat) => cat.items.length > 0)
)

const outOfStockTotal = computed(() => {
  let count = 0
  for (const cat of categories.value) {
    const items = itemStore.getItemsByCategory(cat.category)
    count += items.filter(item => getLatestQuantity(item._id) <= 0).length
  }
  return count
})

const printSheet = () => window.print()
</script>

<template>
  <div>
    <div class="print:hidden">
      <AdminPageHeader
        title="Printable Inventory Sheet"
        subtitle="Print a blank count sheet for manual inventory"
        icon="i-lucide-printer"
      >
        <template #actions>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <USwitch v-model="showOutOfStock" />
            <span class="text-xs text-parchment/60">
              Include out-of-stock
              <span v-if="outOfStockTotal > 0" class="text-red-400/70">({{ outOfStockTotal }})</span>
            </span>
          </label>
          <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
            Back
          </UButton>
          <UButton @click="printSheet" icon="i-lucide-printer">Print</UButton>
        </template>
      </AdminPageHeader>
    </div>

    <!-- Print-Only Inventory Count Sheet -->
    <div id="inventory-sheet" class="hidden print:block">
      <div class="text-center mb-4">
        <h1 class="text-xl font-bold">Galveston Distilling Co</h1>
        <h2 class="text-lg">Raw Materials Inventory Count Sheet</h2>
        <p class="text-sm mt-1">Date: {{ new Date().toLocaleDateString() }}</p>
      </div>
      <div class="mb-6 text-sm">
        Counted by: ________________________________________
      </div>

      <div v-for="cat in categorizedItems" :key="cat.key" class="mb-6">
        <h3 class="text-base font-bold mb-2">{{ cat.label }}</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Item Name</th>
              <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Unit</th>
              <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-24">Count</th>
              <th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold w-40">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cat.items" :key="item._id">
              <td class="border border-gray-400 px-3 py-3 text-sm">{{ item.name }}</td>
              <td class="border border-gray-400 px-3 py-3 text-sm text-center">{{ item.inventoryUnit || '' }}</td>
              <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
              <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- On-screen preview -->
    <div class="print:hidden">
      <div class="bg-charcoal rounded-xl border border-brown/30 p-6">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-parchment font-[Cormorant_Garamond]">Galveston Distilling Co</h2>
          <p class="text-sm text-parchment/60">Raw Materials Inventory Count Sheet</p>
          <p class="text-xs text-parchment/50 mt-1">Date: {{ new Date().toLocaleDateString() }}</p>
        </div>

        <div v-for="cat in categorizedItems" :key="cat.key" class="mb-6">
          <h3 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-2 flex items-center gap-2">
            <UIcon :name="cat.icon" class="text-gold" />
            {{ cat.label }}
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-brown/30">
                  <th class="text-left px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider">Item Name</th>
                  <th class="text-center px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-20">Unit</th>
                  <th class="text-center px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-24">Count</th>
                  <th class="text-left px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-40">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cat.items" :key="item._id" class="border-b border-brown/15 last:border-0">
                  <td class="px-3 py-2 text-parchment">{{ item.name }}</td>
                  <td class="px-3 py-2 text-center text-parchment/60">{{ item.inventoryUnit || '' }}</td>
                  <td class="px-3 py-2 text-center text-parchment/30">___</td>
                  <td class="px-3 py-2 text-parchment/30">___</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  #inventory-sheet {
    color: black;
    background: white;
    page-break-inside: auto;
  }
  #inventory-sheet tr {
    page-break-inside: avoid;
  }
  #inventory-sheet h3 {
    page-break-after: avoid;
  }
}
</style>
