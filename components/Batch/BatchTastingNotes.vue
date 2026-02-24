<script setup lang="ts">
import type { Batch, TastingNote } from '~/types'

const props = defineProps<{
  batch: Batch
}>()

const batchStore = useBatchStore()

// Sort notes newest-first, preserving original index for deletion
const sortedNotes = computed(() => {
  if (!props.batch.tastingNotes?.length) return []
  return props.batch.tastingNotes
    .map((note, originalIndex) => ({ ...note, originalIndex }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Inline add form state
const today = new Date().toISOString().slice(0, 10)
const newNote = reactive({
  date: today,
  abv: undefined as number | undefined,
  notes: '',
})
const saving = ref(false)

const canSubmit = computed(() => newNote.notes.trim().length > 0)

const submitNote = async () => {
  if (!canSubmit.value) return
  saving.value = true
  try {
    await batchStore.addTastingNote(props.batch._id, {
      date: newNote.date,
      abv: newNote.abv || undefined,
      notes: newNote.notes.trim(),
    })
    // Reset form
    newNote.date = new Date().toISOString().slice(0, 10)
    newNote.abv = undefined
    newNote.notes = ''
  } finally {
    saving.value = false
  }
}

// Delete with confirmation
const deletingIndex = ref<number | null>(null)

const deleteNote = async (originalIndex: number) => {
  deletingIndex.value = originalIndex
  try {
    await batchStore.deleteTastingNote(props.batch._id, originalIndex)
  } finally {
    deletingIndex.value = null
  }
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-wine" class="text-lg text-amber-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Tasting Notes</h3>
      <span v-if="sortedNotes.length > 0" class="text-xs text-parchment/40 ml-auto">
        {{ sortedNotes.length }} {{ sortedNotes.length === 1 ? 'note' : 'notes' }}
      </span>
    </div>

    <!-- Add note form -->
    <div v-if="batch.status === 'active'" class="mb-5 bg-charcoal-light/30 rounded-lg border border-brown/20 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">
        <UFormField label="Date" name="date">
          <UInput
            v-model="newNote.date"
            type="date"
            size="sm"
          />
        </UFormField>
        <UFormField label="Sample ABV %" name="abv">
          <UInput
            v-model.number="newNote.abv"
            type="number"
            placeholder="e.g. 62.5"
            step="0.1"
            min="0"
            max="100"
            size="sm"
          />
        </UFormField>
      </div>
      <div class="flex gap-2">
        <UTextarea
          v-model="newNote.notes"
          placeholder="Describe the aroma, flavor, mouthfeel, finish..."
          :rows="2"
          autoresize
          class="flex-1"
          @keydown.meta.enter="submitNote"
          @keydown.ctrl.enter="submitNote"
        />
        <UButton
          size="sm"
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canSubmit"
          class="self-end"
          @click="submitNote"
        >
          Add
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="sortedNotes.length === 0" class="text-center py-6">
      <UIcon name="i-lucide-wine" class="text-3xl text-parchment/15 mx-auto mb-2" />
      <p class="text-sm text-parchment/50">No tasting notes recorded yet</p>
    </div>

    <!-- Notes list -->
    <div v-else class="space-y-3">
      <div
        v-for="note in sortedNotes"
        :key="note.originalIndex"
        class="group relative rounded-lg border border-brown/20 bg-charcoal-light/20 p-4"
      >
        <!-- Header row: date, ABV badge, delete -->
        <div class="flex items-center gap-3 mb-2">
          <span class="text-sm font-medium text-parchment/80">
            {{ formatDate(note.date) }}
          </span>
          <span
            v-if="note.abv"
            class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400"
          >
            <UIcon name="i-lucide-flask-conical" class="text-[10px]" />
            {{ note.abv }}% ABV
          </span>
          <span
            v-if="note.addedBy"
            class="text-[11px] text-parchment/40 ml-auto hidden sm:inline"
          >
            by {{ note.addedBy }}
          </span>
          <UButton
            v-if="batch.status === 'active'"
            icon="i-lucide-trash-2"
            size="xs"
            variant="ghost"
            color="error"
            class="opacity-0 group-hover:opacity-100 transition-opacity sm:ml-0 ml-auto"
            :loading="deletingIndex === note.originalIndex"
            @click="deleteNote(note.originalIndex)"
          />
        </div>
        <!-- Notes text -->
        <p class="text-sm text-parchment/70 whitespace-pre-line leading-relaxed">{{ note.notes }}</p>
      </div>
    </div>
  </div>
</template>
