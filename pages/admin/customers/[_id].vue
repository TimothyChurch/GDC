<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const contactStore = useContactStore()
const eventStore = useEventStore()

const contact = computed(() => contactStore.getContactById(route.params._id as string))

const displayName = computed(() => {
  if (!contact.value) return ''
  return contact.value.businessName || `${contact.value.firstName || ''} ${contact.value.lastName || ''}`.trim()
})

const customerEvents = computed(() => {
  const evts = eventStore.getEventsByContact(route.params._id as string)
  return [...evts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

function statusColor(status: string) {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
    case 'Confirmed': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'Completed': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'Cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
}

function formatDate(val: string) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Panel slide-overs
import { LazyPanelContact, LazyPanelEvent } from '#components'
const overlay = useOverlay()
const contactPanel = overlay.create(LazyPanelContact)
const eventPanel = overlay.create(LazyPanelEvent)

const editContact = () => {
  if (!contact.value) return
  contactStore.contact = JSON.parse(JSON.stringify(contact.value))
  contactPanel.open()
}

const editEvent = (evt: any) => {
  eventStore.event = {
    ...evt,
    contact: typeof evt.contact === 'object' ? evt.contact._id : evt.contact,
  }
  eventPanel.open()
}
</script>

<template>
  <div v-if="contact" class="space-y-6">
    <AdminPageHeader
      :title="displayName"
      subtitle="Customer"
      icon="i-lucide-heart-handshake"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/customers')"
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

    <!-- Customer Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Customer Info</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-if="contact.firstName || contact.lastName">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <div class="text-sm text-parchment">{{ contact.firstName }} {{ contact.lastName }}</div>
        </div>
        <div v-if="contact.businessName">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Business</div>
          <div class="text-sm text-parchment">{{ contact.businessName }}</div>
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
        <div v-if="contact.address" class="col-span-2">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Address</div>
          <div class="text-sm text-parchment">{{ contact.address }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Newsletter</div>
          <UBadge v-if="contact.newsletter" color="success" variant="subtle" size="sm">Subscribed</UBadge>
          <span v-else class="text-sm text-parchment/60">No</span>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Customer Since</div>
          <div class="text-sm text-parchment">{{ contact.createdAt ? formatDate(contact.createdAt) : 'N/A' }}</div>
        </div>
        <div v-if="contact.notes" class="col-span-2 sm:col-span-3 lg:col-span-4">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
          <div class="text-sm text-parchment">{{ contact.notes }}</div>
        </div>
      </div>
    </div>

    <!-- Events -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Events</h3>
      <div v-if="customerEvents.length > 0" class="divide-y divide-brown/20">
        <div class="grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid">
          <span>Date</span>
          <span>Type</span>
          <span>Status</span>
          <span>Group Size</span>
          <span class="text-right">Actions</span>
        </div>
        <div v-for="evt in customerEvents" :key="evt._id" class="py-2">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-sm items-center">
            <span class="text-parchment">{{ formatDate(evt.date) }}</span>
            <span class="text-parchment/80 hidden sm:block">{{ evt.type }}</span>
            <span>
              <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColor(evt.status)]">
                {{ evt.status }}
              </span>
            </span>
            <span class="text-parchment/80 hidden sm:block">{{ evt.groupSize }}</span>
            <span class="text-right">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="editEvent(evt)"
              />
            </span>
          </div>
          <div class="sm:hidden text-xs text-parchment/60 mt-1 pl-1">
            {{ evt.type }} &middot; Group of {{ evt.groupSize }}
            <span v-if="evt.notes"> &middot; {{ evt.notes }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-calendar" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No events for this customer</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Customer not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/customers')"
    >
      Back to Customers
    </UButton>
  </div>
</template>
