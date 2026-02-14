<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const contactStore = useContactStore()
const purchaseOrderStore = usePurchaseOrderStore()
const itemStore = useItemStore()

const contact = computed(() => contactStore.getContactById(route.params._id as string))

const displayName = computed(() => {
  if (!contact.value) return ''
  return contact.value.businessName || `${contact.value.firstName || ''} ${contact.value.lastName || ''}`.trim()
})

const relatedPOs = computed(() =>
  purchaseOrderStore.getPurchaseOrderByVendor(route.params._id as string)
)

const suppliedItems = computed(() =>
  itemStore.items.filter(i => i.vendor === route.params._id)
)

// Panel slide-over for editing
import { PanelContact } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelContact)

const editContact = () => {
  if (!contact.value) return
  contactStore.contact = contact.value
  panel.open()
}

function poStatusColor(status: string) {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
    case 'Ordered': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'Received':
    case 'Delivered': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'Cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
}
</script>

<template>
  <div v-if="contact" class="space-y-6">
    <AdminPageHeader
      :title="displayName"
      :subtitle="contact.type || undefined"
      icon="i-lucide-user"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/contacts')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editContact"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Contact Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Contact Info</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-if="contact.businessName">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Business Name</div>
          <div class="text-sm text-parchment">{{ contact.businessName }}</div>
        </div>
        <div v-if="contact.firstName || contact.lastName">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <div class="text-sm text-parchment">{{ contact.firstName }} {{ contact.lastName }}</div>
        </div>
        <div v-if="contact.type">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div>
          <div class="text-sm text-parchment">{{ contact.type }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>
          <a v-if="contact.email" :href="`mailto:${contact.email}`" class="text-sm text-copper hover:text-gold transition-colors">
            {{ contact.email }}
          </a>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>
          <a v-if="contact.phone" :href="`tel:${contact.phone}`" class="text-sm text-copper hover:text-gold transition-colors">
            {{ contact.phone }}
          </a>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Website</div>
          <a v-if="contact.website" :href="contact.website" target="_blank" class="text-sm text-copper hover:text-gold transition-colors">
            {{ contact.website }}
          </a>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div v-if="contact.address" class="col-span-2">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Address</div>
          <div class="text-sm text-parchment">{{ contact.address }}</div>
        </div>
      </div>
    </div>

    <!-- Related Purchase Orders -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Purchase Orders</h3>
      <div v-if="relatedPOs.length > 0" class="divide-y divide-brown/20">
        <div class="grid grid-cols-3 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid">
          <span>Date</span>
          <span>Status</span>
          <span class="text-right">Total</span>
        </div>
        <NuxtLink
          v-for="po in relatedPOs"
          :key="po._id"
          :to="`/admin/purchaseOrders/${po._id}`"
          class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 py-2 text-sm hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
        >
          <span class="text-parchment">{{ new Date(po.date).toLocaleDateString() }}</span>
          <span class="hidden sm:block">
            <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', poStatusColor(po.status)]">
              {{ po.status }}
            </span>
          </span>
          <span class="text-parchment text-right">{{ Dollar.format(po.total) }}</span>
        </NuxtLink>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-clipboard-list" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No purchase orders</p>
      </div>
    </div>

    <!-- Supplied Items -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Supplied Items</h3>
      <div v-if="suppliedItems.length > 0" class="divide-y divide-brown/20">
        <div class="grid grid-cols-2 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider">
          <span>Name</span>
          <span class="text-right">Price/Unit</span>
        </div>
        <NuxtLink
          v-for="item in suppliedItems"
          :key="item._id"
          :to="`/admin/items/${item._id}`"
          class="grid grid-cols-2 gap-4 py-2 text-sm hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
        >
          <span class="text-parchment">{{ item.name }}</span>
          <span class="text-parchment text-right">{{ Dollar.format(item.pricePerUnit || 0) }}</span>
        </NuxtLink>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-package" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No items supplied by this contact</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Contact not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/contacts')"
    >
      Back to Contacts
    </UButton>
  </div>
</template>
