<script setup lang="ts">
import { getStockStatus, getStockStatusColor } from '~/composables/useInventoryCategories'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const itemStore = useItemStore()
const contactStore = useContactStore()
const purchaseOrderStore = usePurchaseOrderStore()
const inventoryStore = useInventoryStore()

const item = computed(() => itemStore.getItemById(route.params._id as string))

// Panel slide-over for editing
import { LazyPanelItem } from '#components'
const overlay = useOverlay()
const panel = overlay.create(LazyPanelItem)

const editItem = () => {
  if (!item.value) return
  itemStore.setItem(item.value._id)
  panel.open()
}

const latestVendorId = computed(() => {
  if (!item.value) return null
  return itemStore.getVendorId(item.value._id)
})

const latestVendorName = computed(() => {
  if (!item.value) return 'N/A'
  return itemStore.getVendorName(item.value._id) || 'N/A'
})

const latestPricePerUnit = computed(() => {
  if (!item.value) return 0
  return itemStore.latestPrice(item.value._id)
})

const purchaseOrders = computed(() =>
  purchaseOrderStore.getPurchaseOrdersByItemId(route.params._id as string)
)

const getItemInPO = (po: any) => {
  return po.items.find((i: any) => i.item === route.params._id)
}

const inventoryRecords = computed(() =>
  inventoryStore.getInventoriesByItem(route.params._id as string)
)

const currentStock = computed(() => {
  if (inventoryRecords.value.length === 0) return 0
  const sorted = [...inventoryRecords.value].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted[0].quantity
})

const stockStatus = computed(() =>
  getStockStatus(currentStock.value, item.value?.reorderPoint || 0)
)

const stockStatusColor = computed(() =>
  getStockStatusColor(stockStatus.value)
)
</script>

<template>
  <div v-if="!itemStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="item" class="space-y-6">
    <AdminPageHeader
      :title="item.name"
      icon="i-lucide-package"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/items')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editItem"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Item Details -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Item Details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <div class="text-sm text-parchment">{{ item.name }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div>
          <div class="text-sm text-parchment">{{ item.type || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vendor</div>
          <NuxtLink
            v-if="latestVendorId"
            :to="`/admin/contacts/${latestVendorId}`"
            class="text-sm text-gold hover:text-copper transition-colors"
          >
            {{ latestVendorName }}
          </NuxtLink>
          <div v-else class="text-sm text-parchment">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Inventory Unit</div>
          <div class="text-sm text-parchment">{{ item.inventoryUnit || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Latest Price/Unit</div>
          <div class="text-sm text-parchment font-semibold">
            {{ latestPricePerUnit > 0 ? `${Dollar.format(latestPricePerUnit)} / ${item.inventoryUnit || ''}` : 'N/A' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Category</div>
          <div class="text-sm text-parchment">{{ item.category || 'Other' }}</div>
        </div>
        <template v-if="item.trackInventory !== false">
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Stock Status</div>
            <UBadge :color="stockStatusColor" variant="subtle" size="sm">{{ stockStatus }}</UBadge>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Current Stock</div>
            <div class="text-sm text-parchment font-semibold">{{ currentStock }} {{ item.inventoryUnit || '' }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Reorder Point</div>
            <div class="text-sm text-parchment">{{ item.reorderPoint || 0 }} {{ item.inventoryUnit || '' }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Use / Month</div>
            <div class="text-sm text-parchment">{{ item.usePerMonth ? `${item.usePerMonth} ${item.inventoryUnit || ''}` : 'N/A' }}</div>
          </div>
        </template>
        <div v-else>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Inventory Tracking</div>
          <UBadge color="neutral" variant="subtle" size="sm">Disabled</UBadge>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="item.notes" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-3">Notes</h3>
      <p class="text-sm text-parchment/80 whitespace-pre-wrap">{{ item.notes }}</p>
    </div>

    <!-- Purchase History -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Purchase History</h3>
      <div v-if="purchaseOrders.length > 0" class="divide-y divide-brown/20">
        <div class="grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid">
          <span>Date</span>
          <span>Vendor</span>
          <span>Status</span>
          <span>Qty / Size</span>
          <span class="text-right">Price</span>
        </div>
        <div
          v-for="po in purchaseOrders"
          :key="po._id"
          class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-2 text-sm"
        >
          <span class="text-parchment">{{ new Date(po.date).toLocaleDateString() }}</span>
          <span class="text-parchment/60">{{ contactStore.getContactById(po.vendor)?.businessName || 'Unknown' }}</span>
          <span class="text-parchment/60 hidden sm:block">{{ po.status }}</span>
          <span class="text-parchment/60 hidden sm:block">
            {{ getItemInPO(po)?.quantity || 0 }} x {{ getItemInPO(po)?.size || 0 }} {{ getItemInPO(po)?.sizeUnit }}
          </span>
          <span class="text-parchment text-right">{{ Dollar.format(getItemInPO(po)?.price || 0) }}</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-receipt" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No purchase history</p>
      </div>
    </div>

    <!-- Inventory History -->
    <div v-if="item.trackInventory !== false" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Inventory History</h3>
      <div v-if="inventoryRecords.length > 0" class="divide-y divide-brown/20">
        <div class="grid grid-cols-2 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider">
          <span>Date</span>
          <span class="text-right">Quantity</span>
        </div>
        <div
          v-for="inv in inventoryRecords"
          :key="inv._id"
          class="grid grid-cols-2 gap-4 py-2 text-sm"
        >
          <span class="text-parchment">{{ new Date(inv.date).toLocaleDateString() }}</span>
          <span class="text-parchment text-right">{{ inv.quantity }}</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-archive" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No inventory records</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Item not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/items')"
    >
      Back to Items
    </UButton>
  </div>
</template>
