<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const itemStore = useItemStore()
const contactStore = useContactStore()
const purchaseOrderStore = usePurchaseOrderStore()
const inventoryStore = useInventoryStore()

const item = computed(() => itemStore.getItemById(route.params._id as string))

// Panel slide-over for editing
import { PanelItem } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelItem)

const editItem = () => {
  if (!item.value) return
  itemStore.item = item.value
  panel.open()
}

const vendorName = computed(() => {
  if (!item.value?.vendor) return 'N/A'
  return contactStore.getContactById(item.value.vendor)?.businessName || 'Unknown'
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
</script>

<template>
  <div v-if="item" class="space-y-6">
    <AdminPageHeader
      :title="item.name"
      :subtitle="item.brand || undefined"
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
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <div class="text-sm text-parchment">{{ item.name }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Brand</div>
          <div class="text-sm text-parchment">{{ item.brand || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vendor</div>
          <div class="text-sm text-parchment">{{ vendorName }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Inventory Unit</div>
          <div class="text-sm text-parchment">{{ item.inventoryUnit || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Price/Unit</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(item.pricePerUnit || 0) }}</div>
        </div>
      </div>
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
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
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
