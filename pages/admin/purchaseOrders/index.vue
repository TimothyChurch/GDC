<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const purchaseOrderStore = usePurchaseOrderStore()

const selectedStatus = ref('All')

const PO_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const

const statusTabs = computed(() => {
  const counts: Record<string, number> = { All: purchaseOrderStore.purchaseOrders.length }
  for (const status of PO_STATUSES) {
    counts[status] = purchaseOrderStore.purchaseOrders.filter(po => po.status === status).length
  }
  return [
    { name: 'All', count: counts.All },
    ...PO_STATUSES.map(s => ({ name: s, count: counts[s] || 0 })),
  ]
})

const filteredPOs = computed(() => {
  if (selectedStatus.value === 'All') return undefined
  return purchaseOrderStore.purchaseOrders.filter(po => po.status === selectedStatus.value)
})
</script>

<template>
  <div>
    <AdminPageHeader title="Purchase Orders" subtitle="Track vendor orders and deliveries" icon="i-lucide-clipboard-list" />

    <div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide">
      <button
        v-for="tab in statusTabs"
        :key="tab.name"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
        :class="selectedStatus === tab.name
          ? 'bg-gold/15 text-gold border-gold/20'
          : 'text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30'"
        @click="selectedStatus = tab.name"
      >
        {{ tab.name }}
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="selectedStatus === tab.name ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <TablePurchaseOrders :data="filteredPOs" />
  </div>
</template>
