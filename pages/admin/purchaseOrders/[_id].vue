<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const purchaseOrderStore = usePurchaseOrderStore()
const contactStore = useContactStore()
const itemStore = useItemStore()

const po = computed(() => purchaseOrderStore.getPurchaseOrderById(route.params._id as string))

const vendorName = computed(() => {
  if (!po.value?.vendor) return 'Unknown'
  const contact = contactStore.getContactById(po.value.vendor)
  return contact?.businessName || `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim() || 'Unknown'
})

const formattedDate = computed(() => {
  if (!po.value?.date) return ''
  return new Date(po.value.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const resolvedItems = computed(() => {
  if (!po.value?.items) return []
  return po.value.items.map(entry => {
    const item = itemStore.getItemById(entry.item)
    return {
      ...entry,
      name: item?.name || 'Unknown',
      itemId: entry.item,
      lineTotal: entry.price * entry.quantity,
    }
  })
})

const grandTotal = computed(() =>
  resolvedItems.value.reduce((sum, i) => sum + i.lineTotal, 0)
)

// Panel slide-over for editing
import { LazyPanelPurchaseOrder } from '#components'
const overlay = useOverlay()
const panel = overlay.create(LazyPanelPurchaseOrder)

const editPO = () => {
  if (!po.value) return
  purchaseOrderStore.purchaseOrder = structuredClone(toRaw(po.value))
  panel.open()
}

/** Whether this PO can be marked as received (not already Delivered or Cancelled) */
const canReceive = computed(() => {
  if (!po.value) return false
  return po.value.status !== 'Delivered' && po.value.status !== 'Cancelled'
})

const receiving = ref(false)

/** Quick action: Mark PO as Delivered and auto-update inventory */
const markAsReceived = async () => {
  if (!po.value) return
  receiving.value = true
  try {
    // Update PO status to Delivered
    purchaseOrderStore.purchaseOrder = structuredClone(toRaw(po.value))
    purchaseOrderStore.purchaseOrder.status = 'Delivered'
    const result = await purchaseOrderStore.updatePurchaseOrder()

    // Update item purchase histories
    result.items.forEach((item) => {
      const foundItem = itemStore.items.find((i) => i._id === item.item)
      if (foundItem && !foundItem.purchaseHistory?.includes(result._id)) {
        itemStore.item = foundItem
        itemStore.item.purchaseHistory?.push(result._id)
        itemStore.updateItem()
      }
    })

    // Auto-update inventory
    await purchaseOrderStore.receivePurchaseOrder(result._id)
  } finally {
    receiving.value = false
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
    case 'Confirmed': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'Shipped': return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    case 'Received':
    case 'Delivered': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'Cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
}
</script>

<template>
  <div v-if="!purchaseOrderStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="po" class="space-y-6">
    <AdminPageHeader
      :title="vendorName"
      :subtitle="formattedDate"
      icon="i-lucide-clipboard-list"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/purchaseOrders')"
        >
          Back
        </UButton>
        <UButton
          v-if="canReceive"
          icon="i-lucide-package-check"
          color="success"
          size="sm"
          :loading="receiving"
          @click="markAsReceived"
        >
          Mark as Received
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editPO"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- PO Summary -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Order Summary</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div>
          <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColor(po.status)]">
            {{ po.status }}
          </span>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vendor</div>
          <NuxtLink
            :to="`/admin/contacts/${po.vendor}`"
            class="text-sm text-copper hover:text-gold transition-colors"
          >
            {{ vendorName }}
          </NuxtLink>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
          <div class="text-sm text-parchment">{{ formattedDate }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(po.total) }}</div>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Order Items</h3>
      <div v-if="resolvedItems.length > 0">
        <div class="divide-y divide-brown/20">
          <div class="grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid">
            <span>Item</span>
            <span>Quantity</span>
            <span>Size</span>
            <span>Price</span>
            <span class="text-right">Line Total</span>
          </div>
          <div
            v-for="(item, i) in resolvedItems"
            :key="i"
            class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-2 text-sm"
          >
            <NuxtLink
              :to="`/admin/items/${item.itemId}`"
              class="text-copper hover:text-gold transition-colors"
            >
              {{ item.name }}
            </NuxtLink>
            <span class="text-parchment/60">{{ item.quantity }}</span>
            <span class="text-parchment/60 hidden sm:block">{{ item.size }} {{ item.sizeUnit }}</span>
            <span class="text-parchment/60 hidden sm:block">{{ Dollar.format(item.price) }}</span>
            <span class="text-parchment text-right font-medium">{{ Dollar.format(item.lineTotal) }}</span>
          </div>
          <!-- Grand total footer -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 py-3 text-sm font-semibold border-t border-brown/30">
            <span class="text-parchment sm:col-span-4">Grand Total</span>
            <span class="text-parchment text-right">{{ Dollar.format(grandTotal) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-package-open" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No items in this order</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Purchase order not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/purchaseOrders')"
    >
      Back to Purchase Orders
    </UButton>
  </div>
</template>
