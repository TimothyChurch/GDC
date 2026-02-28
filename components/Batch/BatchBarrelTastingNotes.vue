<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
}>()

const batchStore = useBatchStore()

const sortedTastingNotes = computed(() => {
  if (!props.batch.tastingNotes?.length) return []
  return props.batch.tastingNotes
    .map((note, originalIndex) => ({ ...note, originalIndex }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const newTastingNote = ref({
  date: new Date().toISOString().slice(0, 10),
  abv: undefined as number | undefined,
  notes: '',
})
const savingTastingNote = ref(false)

const submitTastingNote = async () => {
  if (!newTastingNote.value.notes.trim()) return
  savingTastingNote.value = true
  try {
    await batchStore.addTastingNote(props.batch._id, {
      date: newTastingNote.value.date,
      abv: newTastingNote.value.abv || undefined,
      notes: newTastingNote.value.notes.trim(),
    })
    newTastingNote.value = { date: new Date().toISOString().slice(0, 10), abv: undefined, notes: '' }
  } finally {
    savingTastingNote.value = false
  }
}
</script>

<template>
  <div class="mb-5">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-wine" class="text-sm text-amber-400" />
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Tasting Notes</div>
      </div>
      <span v-if="sortedTastingNotes.length > 0" class="text-xs text-parchment/40">
        {{ sortedTastingNotes.length }} {{ sortedTastingNotes.length === 1 ? 'note' : 'notes' }}
      </span>
    </div>

    <!-- Inline add form -->
    <div v-if="batch.status === 'active'" class="mb-3 p-3 rounded-lg border border-amber/20 bg-amber-500/5">
      <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-2">
        <div>
          <div class="text-xs text-parchment/60 mb-1">Date</div>
          <UInput v-model="newTastingNote.date" type="date" size="sm" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Sample ABV %</div>
          <UInput v-model.number="newTastingNote.abv" type="number" placeholder="e.g. 62.5" step="0.1" size="sm" />
        </div>
      </div>
      <div class="flex gap-2">
        <UTextarea
          v-model="newTastingNote.notes"
          placeholder="Aroma, flavor, mouthfeel, finish..."
          :rows="2"
          autoresize
          class="flex-1"
        />
        <UButton
          size="sm"
          icon="i-lucide-plus"
          :loading="savingTastingNote"
          :disabled="!newTastingNote.notes.trim()"
          class="self-end"
          @click="submitTastingNote"
        >
          Add
        </UButton>
      </div>
    </div>

    <!-- Notes list (newest first) -->
    <div v-if="sortedTastingNotes.length > 0" class="space-y-2">
      <div
        v-for="note in sortedTastingNotes"
        :key="note.originalIndex"
        class="group relative rounded-lg border border-brown/15 bg-charcoal-light/20 p-3"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-medium text-parchment/70">
            {{ new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </span>
          <span
            v-if="note.abv"
            class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400"
          >
            {{ note.abv }}% ABV
          </span>
          <UButton
            v-if="batch.status === 'active'"
            icon="i-lucide-trash-2"
            size="xs"
            variant="ghost"
            color="error"
            class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            @click="batchStore.deleteTastingNote(batch._id, note.originalIndex)"
          />
        </div>
        <p class="text-sm text-parchment/60 whitespace-pre-line">{{ note.notes }}</p>
      </div>
    </div>
    <div v-else class="text-center py-3">
      <p class="text-sm text-parchment/50">No tasting notes yet</p>
    </div>
  </div>
</template>
