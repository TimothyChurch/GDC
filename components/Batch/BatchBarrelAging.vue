<script setup lang="ts">
import type { Batch, BarrelAgingStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const stage = computed(() => props.batch.stages?.barrelAging as BarrelAgingStage | undefined)

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const formatDate = (d?: Date | string) => {
  if (!d) return 'Not set'
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const daysAged = computed(() => {
  const entryDate = stage.value?.entry?.date
  const exitDate = stage.value?.exit?.date
  if (!entryDate) return null
  const start = new Date(entryDate).getTime()
  const end = exitDate ? new Date(exitDate).getTime() : Date.now()
  return Math.floor((end - start) / (1000 * 60 * 60 * 24))
})

const angelsShare = computed(() => {
  const entryVol = stage.value?.entry?.volume
  const exitVol = stage.value?.exit?.volume
  if (!entryVol || !exitVol) return null
  return ((1 - exitVol / entryVol) * 100).toFixed(1)
})

const sortedSamplings = computed(() => {
  const samplings = stage.value?.samplings || []
  return [...samplings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

// Editing state
const local = ref({
  vessel: stage.value?.vessel || '',
  barrelType: stage.value?.barrelType || '',
  barrelSize: stage.value?.barrelSize || '',
  charLevel: stage.value?.charLevel || '',
  previousUse: stage.value?.previousUse || '',
  warehouseLocation: stage.value?.warehouseLocation || '',
  entry: {
    date: stage.value?.entry?.date ? new Date(stage.value.entry.date) : new Date(),
    volume: stage.value?.entry?.volume,
    volumeUnit: stage.value?.entry?.volumeUnit || 'gallon',
    abv: stage.value?.entry?.abv,
    proofGallons: stage.value?.entry?.proofGallons,
  },
  exit: {
    date: stage.value?.exit?.date ? new Date(stage.value.exit.date) : undefined as Date | undefined,
    volume: stage.value?.exit?.volume,
    volumeUnit: stage.value?.exit?.volumeUnit || 'gallon',
    abv: stage.value?.exit?.abv,
    proofGallons: stage.value?.exit?.proofGallons,
  },
  targetAge: stage.value?.targetAge,
  notes: stage.value?.notes || '',
})

// Auto-calculate proof gallons for entry
const calculatedEntryPG = computed(() => {
  const e = local.value.entry
  if (e.volume && e.abv) return calculateProofGallons(e.volume, e.volumeUnit, e.abv)
  return null
})

const displayEntryPG = computed(() => {
  const e = stage.value?.entry
  if (e?.proofGallons) return e.proofGallons
  if (e?.volume && e?.abv) return calculateProofGallons(e.volume, e.volumeUnit || 'gallon', e.abv)
  return null
})

watch([() => local.value.entry.volume, () => local.value.entry.abv, () => local.value.entry.volumeUnit], () => {
  if (calculatedEntryPG.value !== null) local.value.entry.proofGallons = calculatedEntryPG.value
})

// Auto-calculate proof gallons for exit
const calculatedExitPG = computed(() => {
  const x = local.value.exit
  if (x.volume && x.abv) return calculateProofGallons(x.volume, x.volumeUnit, x.abv)
  return null
})

const displayExitPG = computed(() => {
  const x = stage.value?.exit
  if (x?.proofGallons) return x.proofGallons
  if (x?.volume && x?.abv) return calculateProofGallons(x.volume, x.volumeUnit || 'gallon', x.abv)
  return null
})

watch([() => local.value.exit.volume, () => local.value.exit.abv, () => local.value.exit.volumeUnit], () => {
  if (calculatedExitPG.value !== null) local.value.exit.proofGallons = calculatedExitPG.value
})

const barrelOptions = computed(() =>
  vesselStore.barrels.map((v) => ({ label: v.name, value: v._id }))
)

const charLevelOptions = ['#1', '#2', '#3', '#4', 'Alligator']
const volumeUnits = ['gallon', 'L', 'mL']

// Sampling records
const showAddSampling = ref(false)
const newSampling = ref({
  date: new Date(),
  abv: undefined as number | undefined,
  volume: undefined as number | undefined,
  volumeUnit: 'gallon',
  notes: '',
})

const addSampling = async () => {
  const samplings = [...(stage.value?.samplings || []), { ...newSampling.value }]
  await batchStore.updateStageData(props.batch._id, 'Barrel Aging', { samplings })
  showAddSampling.value = false
  newSampling.value = { date: new Date(), abv: undefined, volume: undefined, volumeUnit: 'gallon', notes: '' }
}

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Barrel Aging', {
      vessel: local.value.vessel || undefined,
      barrelType: local.value.barrelType,
      barrelSize: local.value.barrelSize,
      charLevel: local.value.charLevel || undefined,
      previousUse: local.value.previousUse,
      warehouseLocation: local.value.warehouseLocation,
      entry: {
        date: local.value.entry.date,
        volume: local.value.entry.volume,
        volumeUnit: local.value.entry.volumeUnit,
        abv: local.value.entry.abv,
        proofGallons: local.value.entry.proofGallons,
      },
      exit: {
        date: local.value.exit.date,
        volume: local.value.exit.volume,
        volumeUnit: local.value.exit.volumeUnit,
        abv: local.value.exit.abv,
        proofGallons: local.value.exit.proofGallons,
      },
      targetAge: local.value.targetAge,
      notes: local.value.notes,
    })
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
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Barrel Aging</h3>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="daysAged !== null" class="text-sm text-amber-400 font-semibold">
          {{ daysAged }} days aged
        </span>
        <span v-if="angelsShare !== null" class="text-xs text-parchment/60">
          Angel's Share: {{ angelsShare }}%
        </span>
      </div>
    </div>

    <!-- Barrel Info -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="barrelOptions" value-key="value" label-key="label" placeholder="Select barrel" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel Type</div>
        <template v-if="editing">
          <UInput v-model="local.barrelType" placeholder="e.g. new charred oak" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.barrelType || 'Not set' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel Size</div>
        <template v-if="editing">
          <UInput v-model="local.barrelSize" placeholder="e.g. 53 gal" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.barrelSize || 'Not set' }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Char Level</div>
        <template v-if="editing">
          <USelect v-model="local.charLevel" :items="charLevelOptions" placeholder="Select char level" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.charLevel || 'Not set' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Previous Use</div>
        <template v-if="editing">
          <UInput v-model="local.previousUse" placeholder="e.g. bourbon, sherry" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.previousUse || 'None' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Warehouse Location</div>
        <template v-if="editing">
          <UInput v-model="local.warehouseLocation" placeholder="e.g. Rack A, Row 3" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.warehouseLocation || 'Not set' }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Target Age (months)</div>
        <template v-if="editing">
          <UInput v-model.number="local.targetAge" type="number" placeholder="24" />
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.targetAge ? `${stage.targetAge} months` : 'Not set' }}</div>
      </div>
    </div>

    <!-- Entry / Exit -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <!-- Entry -->
      <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
        <div class="text-xs font-semibold text-parchment/60 uppercase mb-3">Entry</div>
        <div v-if="editing" class="space-y-3">
          <UFormField label="Date"><SiteDatePicker v-model="local.entry.date" /></UFormField>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Volume"><UInput v-model.number="local.entry.volume" type="number" placeholder="0" /></UFormField>
            <UFormField label="Unit"><USelect v-model="local.entry.volumeUnit" :items="volumeUnits" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="ABV %"><UInput v-model.number="local.entry.abv" type="number" placeholder="0" /></UFormField>
            <UFormField label="Proof Gallons"><UInput v-model.number="local.entry.proofGallons" type="number" step="0.01" :placeholder="calculatedEntryPG?.toString() || '0'" /></UFormField>
          </div>
        </div>
        <div v-else class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-parchment/60">Date</span>
            <span class="text-parchment">{{ formatDate(stage?.entry?.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">Volume</span>
            <span class="text-parchment">{{ stage?.entry?.volume || 0 }} {{ stage?.entry?.volumeUnit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">ABV</span>
            <span class="text-parchment">{{ stage?.entry?.abv || 0 }}%</span>
          </div>
          <div v-if="displayEntryPG" class="flex justify-between">
            <span class="text-parchment/60">Proof Gallons</span>
            <span class="text-amber-400 font-semibold">{{ displayEntryPG }} PG</span>
          </div>
        </div>
      </div>

      <!-- Exit -->
      <div class="p-3 rounded-lg border border-brown/20 bg-brown/5">
        <div class="text-xs font-semibold text-parchment/60 uppercase mb-3">Exit</div>
        <div v-if="editing" class="space-y-3">
          <UFormField label="Date"><SiteDatePicker v-model="local.exit.date" /></UFormField>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Volume"><UInput v-model.number="local.exit.volume" type="number" placeholder="0" /></UFormField>
            <UFormField label="Unit"><USelect v-model="local.exit.volumeUnit" :items="volumeUnits" /></UFormField>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <UFormField label="ABV %"><UInput v-model.number="local.exit.abv" type="number" placeholder="0" /></UFormField>
            <UFormField label="Proof Gallons"><UInput v-model.number="local.exit.proofGallons" type="number" step="0.01" :placeholder="calculatedExitPG?.toString() || '0'" /></UFormField>
          </div>
        </div>
        <div v-else class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-parchment/60">Date</span>
            <span class="text-parchment">{{ formatDate(stage?.exit?.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">Volume</span>
            <span class="text-parchment">{{ stage?.exit?.volume || 0 }} {{ stage?.exit?.volumeUnit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-parchment/60">ABV</span>
            <span class="text-parchment">{{ stage?.exit?.abv || 0 }}%</span>
          </div>
          <div v-if="displayExitPG" class="flex justify-between">
            <span class="text-parchment/60">Proof Gallons</span>
            <span class="text-amber-400 font-semibold">{{ displayExitPG }} PG</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sampling Records -->
    <div class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Sampling Records</div>
        <UButton
          v-if="editing"
          size="xs"
          variant="outline"
          icon="i-lucide-plus"
          @click="showAddSampling = !showAddSampling"
        >
          Add Sample
        </UButton>
      </div>

      <!-- Add sampling form -->
      <div v-if="showAddSampling" class="mb-3 p-3 rounded-lg border border-amber/20 bg-amber-500/5">
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <div class="text-xs text-parchment/60 mb-1">Date</div>
            <SiteDatePicker v-model="newSampling.date" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">ABV %</div>
            <UInput v-model.number="newSampling.abv" type="number" placeholder="0" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">Volume</div>
            <UInput v-model.number="newSampling.volume" type="number" placeholder="0" />
          </div>
          <div>
            <div class="text-xs text-parchment/60 mb-1">Unit</div>
            <USelect v-model="newSampling.volumeUnit" :items="['gallon', 'L', 'mL', 'fl oz']" />
          </div>
          <div class="flex items-end">
            <UButton size="sm" @click="addSampling">Add</UButton>
          </div>
        </div>
        <div class="mt-2">
          <div class="text-xs text-parchment/60 mb-1">Notes</div>
          <UInput v-model="newSampling.notes" placeholder="Sampling notes..." />
        </div>
      </div>

      <!-- Samplings list -->
      <div v-if="sortedSamplings.length > 0" class="divide-y divide-brown/20">
        <div
          v-for="(sample, i) in sortedSamplings"
          :key="i"
          class="flex items-center justify-between py-2 text-sm gap-2"
        >
          <span class="text-parchment/60">
            {{ new Date(sample.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </span>
          <span v-if="sample.abv" class="text-parchment">{{ sample.abv }}% ABV</span>
          <span v-if="sample.volume" class="text-parchment/60">{{ sample.volume }} {{ sample.volumeUnit }}</span>
          <span v-if="sample.notes" class="text-parchment/50 truncate max-w-32">{{ sample.notes }}</span>
        </div>
      </div>
      <div v-else class="text-center py-3">
        <p class="text-sm text-parchment/50">No samplings recorded</p>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Barrel aging notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Barrel Aging</UButton>
    </div>
  </div>
</template>
