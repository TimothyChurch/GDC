<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const messageStore = useMessageStore()
const contactStore = useContactStore()
const { confirm } = useDeleteConfirm()
const toast = useToast()

const message = computed(() => messageStore.getById(route.params._id as string))

// Auto-mark as read on load
watch(message, (msg) => {
  if (msg && !msg.read) {
    messageStore.markAsRead(msg._id)
  }
}, { immediate: true })

const linkedContact = computed(() => {
  if (!message.value?.contact) return undefined
  return contactStore.getContactById(message.value.contact)
})

const topicColors: Record<string, string> = {
  'General Inquiry': 'info',
  'Private Events': 'warning',
  'Private Class Request': 'primary',
  'Distillery Tours': 'success',
  'Wholesale / Distribution': 'secondary',
  'Other': 'neutral',
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRelative(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

async function toggleReadStatus() {
  if (!message.value) return
  if (message.value.read) {
    await messageStore.markAsUnread(message.value._id)
  } else {
    await messageStore.markAsRead(message.value._id)
  }
}

async function deleteMessage() {
  if (!message.value) return
  const confirmed = await confirm('message', `${message.value.firstName} ${message.value.lastName}`)
  if (!confirmed) return
  await messageStore.deleteMessage(message.value._id)
  toast.add({ title: 'Message deleted', color: 'success', icon: 'i-lucide-trash-2' })
  router.push('/admin/inbox')
}
</script>

<template>
  <div v-if="!messageStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="message" class="space-y-6">
    <AdminPageHeader
      :title="`${message.firstName} ${message.lastName}`"
      :subtitle="message.topic"
      icon="i-lucide-mail"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/inbox')"
        >
          Back
        </UButton>
        <a :href="`mailto:${message.email}?subject=Re: ${message.topic}`" class="inline-flex">
          <UButton
            icon="i-lucide-reply"
            size="sm"
          >
            Reply
          </UButton>
        </a>
        <UButton
          :icon="message.read ? 'i-lucide-mail' : 'i-lucide-mail-open'"
          variant="outline"
          color="neutral"
          size="sm"
          @click="toggleReadStatus"
        >
          {{ message.read ? 'Mark Unread' : 'Mark Read' }}
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          size="sm"
          @click="deleteMessage"
        >
          Delete
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Message Details -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
          {{ message.firstName }} {{ message.lastName }}
        </h3>
        <UBadge
          :color="(topicColors[message.topic] as any) || 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ message.topic }}
        </UBadge>
        <span v-if="message.createdAt" class="text-xs text-parchment/40 sm:ml-auto">
          {{ formatDate(message.createdAt) }}
          <span class="text-parchment/30 ml-1">({{ formatRelative(message.createdAt) }})</span>
        </span>
      </div>

      <!-- Contact info -->
      <div class="flex flex-wrap gap-4 mb-4 text-sm">
        <a :href="`mailto:${message.email}`" class="flex items-center gap-1.5 text-copper hover:text-gold transition-colors">
          <UIcon name="i-lucide-mail" class="text-base" />
          {{ message.email }}
        </a>
        <a v-if="message.phone" :href="`tel:${message.phone}`" class="flex items-center gap-1.5 text-copper hover:text-gold transition-colors">
          <UIcon name="i-lucide-phone" class="text-base" />
          {{ message.phone }}
        </a>
      </div>

      <!-- Message body -->
      <div class="border-t border-brown/20 pt-4">
        <p class="text-sm text-parchment/80 leading-relaxed whitespace-pre-wrap">{{ message.message }}</p>
      </div>
    </div>

    <!-- Linked Customer -->
    <div v-if="linkedContact" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Linked Customer</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>
          <NuxtLink
            :to="`/admin/customers/${linkedContact._id}`"
            class="text-sm text-copper hover:text-gold transition-colors"
          >
            {{ linkedContact.businessName || `${linkedContact.firstName || ''} ${linkedContact.lastName || ''}`.trim() }}
          </NuxtLink>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>
          <div class="text-sm text-parchment">{{ linkedContact.email || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>
          <div class="text-sm text-parchment">{{ linkedContact.phone || 'N/A' }}</div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Message not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/inbox')"
    >
      Back to Inbox
    </UButton>
  </div>
</template>
