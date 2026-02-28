<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import type { Message } from '~/types'

definePageMeta({ layout: 'admin' })

const messageStore = useMessageStore()
const { confirm } = useDeleteConfirm()
const toast = useToast()

// Filters
const activeTopic = ref('All')
const showUnreadOnly = ref(false)
const expandedId = ref<string | null>(null)

const topics = [
  'All',
  'General Inquiry',
  'Private Events',
  'Private Class Request',
  'Distillery Tours',
  'Wholesale / Distribution',
  'Other',
]

const topicColors: Record<string, string> = {
  'General Inquiry': 'info',
  'Private Events': 'warning',
  'Private Class Request': 'primary',
  'Distillery Tours': 'success',
  'Wholesale / Distribution': 'secondary',
  'Other': 'neutral',
}

// Filtered messages
const filteredMessages = computed(() => {
  let msgs = messageStore.messages
  if (activeTopic.value !== 'All') {
    msgs = msgs.filter((m: Message) => m.topic === activeTopic.value)
  }
  if (showUnreadOnly.value) {
    msgs = msgs.filter((m: Message) => !m.read)
  }
  return msgs
})

// Stats
const totalCount = computed(() => messageStore.messages.length)
const unreadCount = computed(() => messageStore.unreadCount)

// Actions
function toggleExpand(msg: Message) {
  if (expandedId.value === msg._id) {
    expandedId.value = null
  } else {
    expandedId.value = msg._id
    // Auto-mark as read when expanding
    if (!msg.read) {
      messageStore.markAsRead(msg._id)
    }
  }
}

async function toggleReadStatus(msg: Message) {
  if (msg.read) {
    await messageStore.markAsUnread(msg._id)
  } else {
    await messageStore.markAsRead(msg._id)
  }
}

async function deleteMessage(msg: Message) {
  const confirmed = await confirm('message', `${msg.firstName} ${msg.lastName}`)
  if (!confirmed) return
  await messageStore.deleteMessage(msg._id)
  if (expandedId.value === msg._id) {
    expandedId.value = null
  }
  toast.add({
    title: 'Message deleted',
    color: 'success',
    icon: 'i-lucide-trash-2',
  })
}

async function markAllAsRead() {
  const unread = messageStore.getUnreadMessages()
  for (const msg of unread) {
    await messageStore.markAsRead(msg._id)
  }
  toast.add({
    title: `Marked ${unread.length} messages as read`,
    color: 'success',
    icon: 'i-lucide-check-check',
  })
}

function truncateMessage(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '...'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="Inbox"
      subtitle="View customer inquiries and messages"
      icon="i-lucide-inbox"
    >
      <template #actions>
        <UButton
          v-if="unreadCount > 0"
          label="Mark All Read"
          icon="i-lucide-check-check"
          color="neutral"
          variant="outline"
          size="sm"
          @click="markAllAsRead"
        />
      </template>
    </AdminPageHeader>

    <!-- Stats bar -->
    <div class="flex items-center gap-4 mb-4 text-sm text-parchment/60">
      <span>{{ totalCount }} {{ totalCount === 1 ? 'message' : 'messages' }}</span>
      <span v-if="unreadCount > 0" class="text-gold font-medium">
        {{ unreadCount }} unread
      </span>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <!-- Topic tabs -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="topic in topics"
          :key="topic"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
            activeTopic === topic
              ? 'bg-gold/15 text-gold border border-gold/30'
              : 'bg-charcoal text-parchment/50 hover:text-parchment hover:bg-brown/30 border border-brown/20',
          ]"
          @click="activeTopic = topic"
        >
          {{ topic }}
        </button>
      </div>

      <!-- Unread filter toggle -->
      <div class="sm:ml-auto flex items-center gap-2">
        <button
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
            showUnreadOnly
              ? 'bg-copper/15 text-copper border border-copper/30'
              : 'bg-charcoal text-parchment/50 hover:text-parchment hover:bg-brown/30 border border-brown/20',
          ]"
          @click="showUnreadOnly = !showUnreadOnly"
        >
          <UIcon :name="showUnreadOnly ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="text-sm" />
          {{ showUnreadOnly ? 'Unread only' : 'Show all' }}
        </button>
      </div>
    </div>

    <!-- Message list -->
    <div v-if="filteredMessages.length > 0" class="flex flex-col gap-3">
      <div
        v-for="msg in filteredMessages"
        :key="msg._id"
        :class="[
          'rounded-xl border transition-all duration-200',
          !msg.read
            ? 'bg-charcoal border-gold/30 shadow-[inset_3px_0_0_0] shadow-gold'
            : 'bg-charcoal/60 border-brown/20',
        ]"
      >
        <!-- Message header / summary row -->
        <div
          class="flex items-start gap-3 p-4 cursor-pointer hover:bg-brown/10 rounded-xl transition-colors duration-150"
          @click="toggleExpand(msg)"
        >
          <!-- Unread dot -->
          <div class="pt-1.5 shrink-0">
            <div
              :class="[
                'w-2.5 h-2.5 rounded-full transition-colors duration-200',
                !msg.read ? 'bg-gold' : 'bg-brown/30',
              ]"
            />
          </div>

          <!-- Main content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
              <!-- Sender name -->
              <span
                :class="[
                  'font-medium truncate',
                  !msg.read ? 'text-parchment' : 'text-parchment/70',
                ]"
              >
                {{ msg.firstName }} {{ msg.lastName }}
              </span>

              <!-- Topic badge -->
              <UBadge
                :color="(topicColors[msg.topic] as any) || 'neutral'"
                variant="subtle"
                size="sm"
              >
                {{ msg.topic }}
              </UBadge>
            </div>

            <!-- Email -->
            <div class="text-xs text-parchment/40 mb-1.5">
              {{ msg.email }}
            </div>

            <!-- Message preview (only when not expanded) -->
            <p
              v-if="expandedId !== msg._id"
              :class="[
                'text-sm leading-relaxed',
                !msg.read ? 'text-parchment/70' : 'text-parchment/50',
              ]"
            >
              {{ truncateMessage(msg.message) }}
            </p>
          </div>

          <!-- Right side: timestamp + actions -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-[11px] text-parchment/40 whitespace-nowrap">
              {{ formatDate(msg.createdAt) }}
            </span>

            <!-- Action buttons -->
            <div class="flex items-center gap-1" @click.stop>
              <UTooltip :text="msg.read ? 'Mark unread' : 'Mark read'">
                <UButton
                  :icon="msg.read ? 'i-lucide-mail' : 'i-lucide-mail-open'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="toggleReadStatus(msg)"
                />
              </UTooltip>
              <UTooltip text="Delete">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="deleteMessage(msg)"
                />
              </UTooltip>
            </div>
          </div>
        </div>

        <!-- Expanded message body -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedId === msg._id" class="overflow-hidden">
            <div class="px-4 pb-4 pt-0 ml-[22px] border-t border-brown/15">
              <!-- Full message -->
              <p class="text-sm text-parchment/80 leading-relaxed whitespace-pre-wrap mt-3">
                {{ msg.message }}
              </p>

              <!-- Contact details footer -->
              <div class="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-brown/15 text-xs text-parchment/40">
                <a
                  :href="`mailto:${msg.email}`"
                  class="flex items-center gap-1.5 text-gold hover:text-gold/80 transition-colors"
                >
                  <UIcon name="i-lucide-mail" class="text-sm" />
                  {{ msg.email }}
                </a>
                <span v-if="msg.phone" class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-phone" class="text-sm" />
                  {{ msg.phone }}
                </span>
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-clock" class="text-sm" />
                  {{ formatDate(msg.createdAt) }}
                </span>
              </div>

              <!-- Actions -->
              <div class="mt-3 flex items-center gap-2">
                <a
                  :href="`mailto:${msg.email}?subject=Re: ${msg.topic}`"
                  class="inline-flex"
                >
                  <UButton
                    label="Reply"
                    icon="i-lucide-reply"
                    color="primary"
                    variant="soft"
                    size="sm"
                  />
                </a>
                <NuxtLink :to="`/admin/inbox/${msg._id}`">
                  <UButton
                    label="Open"
                    icon="i-lucide-external-link"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center mb-4">
        <UIcon name="i-lucide-inbox" class="text-3xl text-parchment/30" />
      </div>
      <h3 class="text-lg font-medium text-parchment/60 mb-1">
        {{ showUnreadOnly ? 'No unread messages' : activeTopic !== 'All' ? `No ${activeTopic} messages` : 'No messages yet' }}
      </h3>
      <p class="text-sm text-parchment/40">
        {{ showUnreadOnly ? 'All messages have been read.' : 'Messages from the contact form will appear here.' }}
      </p>
    </div>
  </div>
</template>
