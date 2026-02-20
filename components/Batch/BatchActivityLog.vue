<script setup lang="ts">
import type { Batch, BatchLogEntry } from '~/types'

const props = defineProps<{
  batch: Batch
}>()

const batchStore = useBatchStore()

// Sort entries most recent first
const entries = computed(() => {
  if (!props.batch.log) return []
  return [...props.batch.log].reverse()
})

// Show only recent entries by default
const showAll = ref(false)
const INITIAL_COUNT = 10
const visibleEntries = computed(() =>
  showAll.value ? entries.value : entries.value.slice(0, INITIAL_COUNT)
)
const hasMore = computed(() => entries.value.length > INITIAL_COUNT)

// Manual note entry
const noteText = ref('')
const savingNote = ref(false)

const submitNote = async () => {
  const text = noteText.value.trim()
  if (!text) return
  savingNote.value = true
  try {
    await batchStore.addNote(props.batch._id, text)
    noteText.value = ''
  } finally {
    savingNote.value = false
  }
}

// Action type → icon + color
function getActionMeta(action: string): { icon: string; color: string } {
  if (action.startsWith('Advanced to')) return { icon: 'i-lucide-arrow-right-circle', color: 'text-green-400' }
  if (action.startsWith('Started')) return { icon: 'i-lucide-play-circle', color: 'text-blue-400' }
  if (action === 'Batch created') return { icon: 'i-lucide-plus-circle', color: 'text-emerald-400' }
  if (action.includes('reading')) return { icon: 'i-lucide-thermometer', color: 'text-yellow-400' }
  if (action.startsWith('Updated')) return { icon: 'i-lucide-pencil', color: 'text-amber-400' }
  if (action === 'Note added') return { icon: 'i-lucide-message-square', color: 'text-copper' }
  return { icon: 'i-lucide-info', color: 'text-parchment/60' }
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-scroll-text" class="text-lg text-parchment/60" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Activity Log</h3>
      <span v-if="entries.length > 0" class="text-xs text-parchment/40 ml-auto">
        {{ entries.length }} {{ entries.length === 1 ? 'entry' : 'entries' }}
      </span>
    </div>

    <!-- Add note form (active batches only) -->
    <div v-if="batch.status === 'active'" class="mb-5">
      <div class="flex gap-2">
        <UTextarea
          v-model="noteText"
          placeholder="Add a note or observation..."
          :rows="1"
          autoresize
          class="flex-1"
          @keydown.meta.enter="submitNote"
          @keydown.ctrl.enter="submitNote"
        />
        <UButton
          size="sm"
          :loading="savingNote"
          :disabled="!noteText.trim()"
          class="self-end"
          @click="submitNote"
        >
          Add Note
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="entries.length === 0" class="text-center py-6">
      <UIcon name="i-lucide-scroll-text" class="text-3xl text-parchment/15 mx-auto mb-2" />
      <p class="text-sm text-parchment/50">No activity recorded yet</p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[11px] top-3 bottom-3 w-px bg-brown/20" />

      <div
        v-for="(entry, i) in visibleEntries"
        :key="i"
        class="relative flex gap-3 pb-4 last:pb-0"
      >
        <!-- Icon dot -->
        <div class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-charcoal border border-brown/30">
          <UIcon
            :name="getActionMeta(entry.action).icon"
            :class="['text-xs', getActionMeta(entry.action).color]"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-sm text-parchment">{{ entry.action }}</span>
            <span class="text-[10px] text-parchment/40">{{ formatDate(entry.date) }}</span>
            <span v-if="entry.user" class="text-[10px] text-parchment/50">
              by {{ entry.user }}
            </span>
          </div>
          <div v-if="entry.details" class="text-xs text-parchment/50 mt-0.5">
            {{ entry.details }}
          </div>
        </div>
      </div>

      <!-- Show more -->
      <div v-if="hasMore && !showAll" class="relative z-10 pl-9 pt-1">
        <button
          class="text-xs text-gold hover:text-copper transition-colors"
          @click="showAll = true"
        >
          Show {{ entries.length - INITIAL_COUNT }} more entries
        </button>
      </div>
    </div>
  </div>
</template>
