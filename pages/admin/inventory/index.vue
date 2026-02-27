<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const categories = useInventoryCategories()
const itemStore = useItemStore()
const inventoryStore = useInventoryStore()

function getLatestQuantity(itemId: string): number {
  const records = inventoryStore.getInventoriesByItem(itemId)
  if (records.length === 0) return 0
  const sorted = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted[0].quantity
}

function getCategoryStats(category: string) {
  const items = itemStore.getItemsByCategory(category as any)
  let lowStock = 0
  let outOfStock = 0
  for (const item of items) {
    const qty = getLatestQuantity(item._id)
    const status = getStockStatus(qty, item.reorderPoint || 0)
    if (status === 'Low Stock') lowStock++
    if (status === 'Out of Stock') outOfStock++
  }
  return { total: items.length, lowStock, outOfStock }
}

const categoryCards = computed(() =>
  categories.value.map((cat) => {
    const stats = getCategoryStats(cat.category)
    return { ...cat, stats }
  })
)
</script>

<template>
  <div>
    <AdminPageHeader
      title="Inventory"
      subtitle="Raw materials and supplies organized by category"
      icon="i-lucide-warehouse"
    >
      <template #actions>
        <UButton
          icon="i-lucide-shopping-cart"
          variant="outline"
          to="/admin/inventory/shopping-list"
        >
          Shopping List
        </UButton>
        <UButton
          icon="i-lucide-clipboard-check"
          variant="outline"
          to="/admin/inventory/input"
        >
          Count Inventory
        </UButton>
        <UButton
          icon="i-lucide-printer"
          variant="outline"
          to="/admin/inventory/print"
        >
          Print Sheet
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Category Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <NuxtLink
        v-for="card in categoryCards"
        :key="card.key"
        :to="`/admin/inventory/${card.key}`"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-5 transition-all duration-200"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors">
            <UIcon :name="card.icon" class="text-xl text-gold" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors">
              {{ card.label }}
            </h3>
            <p class="text-xs text-parchment/60 mt-0.5">{{ card.description }}</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-brown/10 rounded-lg px-3 py-2">
            <div class="text-xl font-bold text-parchment">{{ card.stats.total }}</div>
            <div class="text-[10px] text-parchment/60">Total Items</div>
          </div>
          <div class="bg-brown/10 rounded-lg px-3 py-2">
            <div class="text-xl font-bold" :class="card.stats.lowStock > 0 ? 'text-amber-400' : 'text-parchment'">
              {{ card.stats.lowStock }}
            </div>
            <div class="text-[10px] text-parchment/60">Low Stock</div>
          </div>
          <div class="bg-brown/10 rounded-lg px-3 py-2">
            <div class="text-xl font-bold" :class="card.stats.outOfStock > 0 ? 'text-red-400' : 'text-parchment'">
              {{ card.stats.outOfStock }}
            </div>
            <div class="text-[10px] text-parchment/60">Out of Stock</div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Links -->
    <h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-3">Quick Links</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <NuxtLink
        to="/admin/items"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      >
        <UIcon name="i-lucide-package" class="text-lg text-parchment/60 group-hover:text-gold" />
        <div>
          <div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors">All Items</div>
          <div class="text-xs text-parchment/50">Master item list</div>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/bottles/inventory"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      >
        <UIcon name="i-lucide-wine" class="text-lg text-parchment/60 group-hover:text-gold" />
        <div>
          <div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors">Bottle Inventory</div>
          <div class="text-xs text-parchment/50">Count finished bottles</div>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/purchaseOrders"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      >
        <UIcon name="i-lucide-receipt" class="text-lg text-parchment/60 group-hover:text-gold" />
        <div>
          <div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors">Purchase Orders</div>
          <div class="text-xs text-parchment/50">Track incoming orders</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
