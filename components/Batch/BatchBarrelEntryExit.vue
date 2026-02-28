<script setup lang="ts">
import type { Batch, BarrelAgingStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
  /** 'entry' or 'exit' */
  type: 'entry' | 'exit'
  /** Local editing state (full edit mode) */
  localEntryExit: {
    date: Date | undefined
    volume: number | undefined
    volumeUnit: string
    abv: number | undefined
    proofGallons: number | undefined
  }
}>()

const batchStore = useBatchStore()
const toast = useToast()

const stage = computed(() => props.batch.stages?.barrelAging as BarrelAgingStage | undefined)
const stageData = computed(() => stage.value?.[props.type])

const volumeUnits = ['gallon', 'L', 'mL']

const formatDate = (d?: Date | string) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const toDateInputValue = (d?: Date | string): string => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

// --- Inline editing ---
const inlineEditing = ref(false)
const inlineData = ref({
  date: '',
  abv: undefined as number | undefined,
})

const startInlineEdit = () => {
  inlineData.value.date = toDateInputValue(stageData.value?.date)
  inlineData.value.abv = stageData.value?.abv
  inlineEditing.value = true
}

const cancelInlineEdit = () => {
  inlineEditing.value = false
}

const inlineDateError = computed(() => {
  if (!inlineData.value.date) return props.type === 'entry' ? 'Date is required' : ''
  const d = new Date(inlineData.value.date)
  if (isNaN(d.getTime())) return 'Invalid date'
  return ''
})

const inlineAbvError = computed(() => {
  const abv = inlineData.value.abv
  if (abv === undefined || abv === null) return ''
  if (abv < 0) return 'ABV cannot be negative'
  if (abv > 100) return 'ABV cannot exceed 100'
  return ''
})

const inlineValid = computed(() => {
  return !inlineDateError.value && !inlineAbvError.value
})

const inlinePG = computed(() => {
  const volume = stageData.value?.volume
  const abv = inlineData.value.abv
  const unit = stageData.value?.volumeUnit || 'gallon'
  if (volume && abv) return calculateProofGallons(volume, unit, abv)
  return null
})

const displayPG = computed(() => {
  const d = stageData.value
  if (d?.proofGallons) return d.proofGallons
  if (d?.volume && d?.abv) return calculateProofGallons(d.volume, d.volumeUnit || 'gallon', d.abv)
  return null
})

// Auto-calculate proof gallons for full edit mode
const calculatedPG = computed(() => {
  const e = props.localEntryExit
  if (e.volume && e.abv) return calculateProofGallons(e.volume, e.volumeUnit, e.abv)
  return null
})

watch([() => props.localEntryExit.volume, () => props.localEntryExit.abv, () => props.localEntryExit.volumeUnit], () => {
  if (calculatedPG.value !== null) props.localEntryExit.proofGallons = calculatedPG.value
})

const savingInline = ref(false)
const saveInline = async () => {
  if (!inlineValid.value) return
  savingInline.value = true
  try {
    const updated = {
      ...stageData.value,
      ...(inlineData.value.date ? { date: new Date(inlineData.value.date + 'T12:00:00') } : {}),
      abv: inlineData.value.abv,
      proofGallons: inlinePG.value ?? stageData.value?.proofGallons,
    }
    await batchStore.updateStageData(props.batch._id, 'Barrel Aging', {
      [props.type]: updated,
    }, `Updated barrel ${props.type} date/proof`)
    inlineEditing.value = false
    toast.add({ title: `Barrel ${props.type} updated`, color: 'success', icon: 'i-lucide-check-circle' })
  } catch {
    toast.add({ title: `Failed to update barrel ${props.type}`, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    savingInline.value = false
  }
}
</script>

<template>
  <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
    <div class="flex items-center justify-between mb-3">
      <div class="text-xs font-semibold text-parchment/60 uppercase">{{ type === 'entry' ? 'Entry' : 'Exit' }}</div>
      <UButton
        v-if="!editing && !inlineEditing"
        size="xs"
        variant="ghost"
        color="neutral"
        icon="i-lucide-pencil"
        @click="startInlineEdit"
      >
        Edit
      </UButton>
    </div>

    <!-- Full edit mode -->
    <div v-if="editing" class="space-y-3">
      <UFormField label="Date"><SiteDatePicker v-model="localEntryExit.date" /></UFormField>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Volume"><UInput v-model.number="localEntryExit.volume" type="number" placeholder="0" /></UFormField>
        <UFormField label="Unit"><USelect v-model="localEntryExit.volumeUnit" :items="volumeUnits" /></UFormField>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="ABV %"><UInput v-model.number="localEntryExit.abv" type="number" placeholder="0" min="0" max="100" /></UFormField>
        <UFormField label="Proof Gallons"><UInput v-model.number="localEntryExit.proofGallons" type="number" step="0.01" :placeholder="calculatedPG?.toString() || '0'" /></UFormField>
      </div>
    </div>

    <!-- Inline edit mode (date + ABV only, available anytime) -->
    <div v-else-if="inlineEditing" class="space-y-3">
      <UFormField label="Date" :error="inlineDateError || undefined">
        <UInput v-model="inlineData.date" type="date" />
      </UFormField>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="ABV %" :error="inlineAbvError || undefined">
          <UInput v-model.number="inlineData.abv" type="number" min="0" max="100" step="0.1" placeholder="0" />
        </UFormField>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Proof Gallons</div>
          <div class="text-sm text-amber-400 font-semibold pt-2">
            {{ inlinePG !== null ? `${inlinePG} PG` : (displayPG ? `${displayPG} PG` : '--') }}
          </div>
        </div>
      </div>
      <div class="text-xs text-parchment/50">
        Volume: {{ stageData?.volume || 0 }} {{ stageData?.volumeUnit || 'gallon' }} (not changed)
      </div>
      <div class="flex items-center gap-2 pt-1">
        <UButton size="xs" :loading="savingInline" :disabled="!inlineValid" @click="saveInline">Save</UButton>
        <UButton size="xs" variant="ghost" color="neutral" @click="cancelInlineEdit">Cancel</UButton>
      </div>
    </div>

    <!-- Display mode -->
    <div v-else class="space-y-1 text-sm">
      <div class="flex justify-between">
        <span class="text-parchment/60">Date</span>
        <span class="text-parchment">{{ formatDate(stageData?.date) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-parchment/60">Volume</span>
        <span class="text-parchment">{{ stageData?.volume || 0 }} {{ stageData?.volumeUnit }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-parchment/60">ABV</span>
        <span class="text-parchment">{{ stageData?.abv || 0 }}%</span>
      </div>
      <div v-if="displayPG" class="flex justify-between">
        <span class="text-parchment/60">Proof Gallons</span>
        <span class="text-amber-400 font-semibold">{{ displayPG }} PG</span>
      </div>
    </div>
  </div>
</template>
