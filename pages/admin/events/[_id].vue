<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const eventStore = useEventStore()
const contactStore = useContactStore()
const { confirm } = useDeleteConfirm()
const toast = useToast()

const event = computed(() => eventStore.getEventById(route.params._id as string))

const linkedContact = computed(() => {
  if (!event.value) return undefined
  const c = event.value.contact as any
  if (typeof c === 'object' && c?._id) return contactStore.getContactById(c._id)
  if (typeof c === 'string' && c) return contactStore.getContactById(c)
  return undefined
})

const contactName = computed(() => {
  if (!linkedContact.value) {
    // Fallback to populated contact object on the event
    const c = event.value?.contact as any
    if (typeof c === 'object' && c) {
      return c.businessName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'
    }
    return '—'
  }
  return linkedContact.value.businessName || `${linkedContact.value.firstName || ''} ${linkedContact.value.lastName || ''}`.trim()
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Panel slide-over
import { LazyPanelEvent } from '#components'
const overlay = useOverlay()
const eventPanel = overlay.create(LazyPanelEvent)

const editEvent = () => {
  if (!event.value) return
  eventStore.event = {
    ...structuredClone(toRaw(event.value)),
    contact: typeof event.value.contact === 'object' ? (event.value.contact as any)._id : event.value.contact,
  }
  eventPanel.open()
}

const deleteEvent = async () => {
  if (!event.value) return
  const name = `${event.value.type} on ${formatDate(event.value.date)}`
  const confirmed = await confirm('Event', name)
  if (!confirmed) return
  await eventStore.deleteEvent(event.value._id)
  toast.add({ title: 'Event deleted', color: 'success', icon: 'i-lucide-trash-2' })
  router.push('/admin/events')
}
</script>

<template>
  <div v-if="!eventStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/50" />
  </div>

  <div v-else-if="event" class="space-y-6">
    <AdminPageHeader
      :title="event.type"
      :subtitle="`Event — ${formatDate(event.date)}`"
      icon="i-lucide-calendar"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/events')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editEvent"
        >
          Edit
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          size="sm"
          @click="deleteEvent"
        >
          Delete
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Booking Summary (for classes with capacity) -->
    <div v-if="event.capacity" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Booking Summary</h3>
      <div class="grid grid-cols-3 gap-6 text-center">
        <div>
          <div class="text-3xl font-bold text-gold">{{ event.groupSize || 0 }}</div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Booked (Paid)</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-parchment">{{ event.capacity }}</div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Total Capacity</div>
        </div>
        <div>
          <div :class="['text-3xl font-bold', (event.capacity - (event.groupSize || 0)) > 0 ? 'text-green-400' : 'text-red-400']">
            {{ event.capacity - (event.groupSize || 0) }}
          </div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Remaining</div>
        </div>
      </div>
      <div class="mt-4">
        <div class="h-2 bg-brown/20 rounded-full overflow-hidden">
          <div
            class="h-full bg-gold rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(100, ((event.groupSize || 0) / event.capacity) * 100)}%` }"
          />
        </div>
        <div class="text-xs text-parchment/50 mt-1 text-right">
          {{ Math.round(((event.groupSize || 0) / event.capacity) * 100) }}% filled
        </div>
      </div>
    </div>

    <!-- Event Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Event Details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
          <div class="text-sm text-parchment">{{ formatDate(event.date) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div>
          <div class="text-sm text-parchment">{{ event.type }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div>
          <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColor(event.status)]">
            {{ event.status }}
          </span>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Visibility</div>
          <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', event.isPublic ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-brown/15 text-parchment/50 border-brown/25']">
            {{ event.isPublic ? 'Public' : 'Private' }}
          </span>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Booked</div>
          <div class="text-sm text-parchment">
            {{ event.groupSize }}{{ event.capacity ? ` / ${event.capacity}` : '' }}
          </div>
        </div>
        <div v-if="event.createdAt">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Created</div>
          <div class="text-sm text-parchment/70">{{ formatDate(event.createdAt) }}</div>
        </div>
        <div v-if="event.updatedAt">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Updated</div>
          <div class="text-sm text-parchment/70">{{ formatDate(event.updatedAt) }}</div>
        </div>
        <div v-if="event.notes" class="col-span-2 sm:col-span-3 lg:col-span-4">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
          <div class="text-sm text-parchment whitespace-pre-wrap">{{ event.notes }}</div>
        </div>
      </div>
    </div>

    <!-- Linked Customer -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Customer</h3>
      <div v-if="linkedContact" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <NuxtLink
            :to="`/admin/customers/${linkedContact._id}`"
            class="text-sm text-copper hover:text-gold transition-colors"
          >
            {{ contactName }}
          </NuxtLink>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>
          <a v-if="linkedContact.email" :href="`mailto:${linkedContact.email}`" class="text-sm text-copper hover:text-gold transition-colors">
            {{ linkedContact.email }}
          </a>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>
          <a v-if="linkedContact.phone" :href="`tel:${linkedContact.phone}`" class="text-sm text-copper hover:text-gold transition-colors">
            {{ linkedContact.phone }}
          </a>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
      </div>
      <div v-else-if="contactName !== '—'" class="text-sm text-parchment/70">
        {{ contactName }}
      </div>
      <div v-else class="text-center py-4">
        <UIcon name="i-lucide-user-x" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No customer linked to this event</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Event not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/events')"
    >
      Back to Events
    </UButton>
  </div>
</template>
