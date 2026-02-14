<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const vesselName = computed(() => {
  if (!props.batch.barreled?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(props.batch.barreled.vessel)?.name || 'Unknown'
})

const daysAged = computed(() => {
  const entry = props.batch.barreled?.entry?.date
  const exit = props.batch.barreled?.exit?.date
  if (!entry) return null
  const start = new Date(entry).getTime()
  const end = exit ? new Date(exit).getTime() : Date.now()
  return Math.floor((end - start) / (1000 * 60 * 60 * 24))
})

const angelsShare = computed(() => {
  const entryVol = props.batch.barreled?.entry?.volume
  const exitVol = props.batch.barreled?.exit?.volume
  if (!entryVol || !exitVol) return null
  return ((1 - exitVol / entryVol) * 100).toFixed(1)
})

const formatDate = (d?: Date) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Editing state
const local = ref({
  vessel: props.batch.barreled?.vessel || '',
  entry: {
    date: props.batch.barreled?.entry?.date ? new Date(props.batch.barreled.entry.date) : new Date(),
    volume: props.batch.barreled?.entry?.volume,
    volumeUnit: props.batch.barreled?.entry?.volumeUnit || 'gallon',
    abv: props.batch.barreled?.entry?.abv,
  },
  exit: {
    date: props.batch.barreled?.exit?.date ? new Date(props.batch.barreled.exit.date) : undefined as Date | undefined,
    volume: props.batch.barreled?.exit?.volume,
    volumeUnit: props.batch.barreled?.exit?.volumeUnit || 'gallon',
    abv: props.batch.barreled?.exit?.abv,
  },
})

const barrelOptions = computed(() =>
  vesselStore.barrels.map((v) => ({ label: v.name, value: v._id }))
)

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (!target) return
    target.barreled = {
      vessel: local.value.vessel || undefined,
      entry: {
        date: local.value.entry.date,
        volume: local.value.entry.volume,
        volumeUnit: local.value.entry.volumeUnit,
        abv: local.value.entry.abv,
      },
      exit: {
        date: local.value.exit.date,
        volume: local.value.exit.volume,
        volumeUnit: local.value.exit.volumeUnit,
        abv: local.value.exit.abv,
      },
    }
    batchStore.batch = target
    await batchStore.updateBatch()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-amber/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-cylinder" class="text-lg text-amber" />
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Barreled</h3>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="daysAged !== null" class="text-sm text-amber font-semibold">
          {{ daysAged }} days aged
        </span>
        <span v-if="angelsShare !== null" class="text-xs text-parchment/60">
          Angel's Share: {{ angelsShare }}%
        </span>
      </div>
    </div>

    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel</div>
      <template v-if="editing">
        <USelect v-model="local.vessel" :items="barrelOptions" value-key="value" label-key="label" placeholder="Select barrel" />
      </template>
      <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Entry -->
      <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
        <div class="text-xs font-semibold text-parchment/60 uppercase mb-3">Entry</div>
        <div v-if="editing" class="space-y-3">
          <UFormField label="Date"><SiteDatePicker v-model="local.entry.date" /></UFormField>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Volume"><UInput v-model="local.entry.volume" type="number" placeholder="0" /></UFormField>
            <UFormField label="Unit"><USelect v-model="local.entry.volumeUnit" :items="['gallon', 'L', 'mL']" /></UFormField>
          </div>
          <UFormField label="ABV %"><UInput v-model="local.entry.abv" type="number" placeholder="0" /></UFormField>
        </div>
        <div v-else class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-parchment/60">Date</span>
            <span class="text-parchment">{{ formatDate(batch.barreled?.entry?.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">Volume</span>
            <span class="text-parchment">{{ batch.barreled?.entry?.volume || 0 }} {{ batch.barreled?.entry?.volumeUnit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">ABV</span>
            <span class="text-parchment">{{ batch.barreled?.entry?.abv || 0 }}%</span>
          </div>
        </div>
      </div>

      <!-- Exit -->
      <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
        <div class="text-xs font-semibold text-parchment/60 uppercase mb-3">Exit</div>
        <div v-if="editing" class="space-y-3">
          <UFormField label="Date"><SiteDatePicker v-model="local.exit.date" /></UFormField>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Volume"><UInput v-model="local.exit.volume" type="number" placeholder="0" /></UFormField>
            <UFormField label="Unit"><USelect v-model="local.exit.volumeUnit" :items="['gallon', 'L', 'mL']" /></UFormField>
          </div>
          <UFormField label="ABV %"><UInput v-model="local.exit.abv" type="number" placeholder="0" /></UFormField>
        </div>
        <div v-else class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-parchment/60">Date</span>
            <span class="text-parchment">{{ formatDate(batch.barreled?.exit?.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">Volume</span>
            <span class="text-parchment">{{ batch.barreled?.exit?.volume || 0 }} {{ batch.barreled?.exit?.volumeUnit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">ABV</span>
            <span class="text-parchment">{{ batch.barreled?.exit?.abv || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Barrel Data</UButton>
    </div>
  </div>
</template>
