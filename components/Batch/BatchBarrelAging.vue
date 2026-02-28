<script setup lang="ts">
import type { Batch, BarrelAgingStage } from '~/types'
import { getBarrelAgeDefault } from '~/composables/definitions'

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

const monthsAged = computed(() => {
  if (daysAged.value === null) return null
  return parseFloat((daysAged.value / 30.44).toFixed(1))
})

const agingProgress = computed(() => {
  const target = stage.value?.targetAge
  if (!target || monthsAged.value === null) return null
  const pct = Math.min(100, (monthsAged.value / target) * 100)
  return { percent: Math.round(pct), months: monthsAged.value, target }
})

const agingProgressColor = computed(() => {
  if (!agingProgress.value) return 'bg-amber-500/60'
  const p = agingProgress.value.percent
  if (p >= 100) return 'bg-green-500/60'
  if (p >= 75) return 'bg-amber-500/60'
  return 'bg-blue-500/60'
})

// Editing state (full edit mode)
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
  barrelCost: props.batch.barrelCost,
})

// Auto-populate targetAge and barrel cost when a barrel is selected (editing mode only)
watch(() => local.value.vessel, (newVesselId) => {
  if (!newVesselId || !props.editing) return
  const barrel = vesselStore.getVesselById(newVesselId)
  if (!barrel) return
  if (!local.value.targetAge) {
    const barrelTarget = barrel.targetAge || getBarrelAgeDefault(barrel.barrel?.size)
    if (barrelTarget) local.value.targetAge = barrelTarget
  }
  if (barrel.barrel?.cost != null && !props.batch.barrelCost) {
    local.value.barrelCost = barrel.barrel.cost
  }
})

const barrelOptions = computed(() => {
  const currentBarrelId = stage.value?.vessel
  return vesselStore.barrels
    .filter((v) => v._id === currentBarrelId || !v.contents || v.contents.length === 0 || (v.current?.volume ?? 0) === 0)
    .map((v) => ({ label: v.name, value: v._id }))
})

const charLevelOptions = ['#1', '#2', '#3', '#4', 'Alligator']

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (target) target.barrelCost = local.value.barrelCost

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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
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
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Barrel Cost</div>
        <template v-if="editing">
          <UInput v-model.number="local.barrelCost" type="number" step="0.01" placeholder="0.00" icon="i-lucide-dollar-sign" />
          <div v-if="local.vessel && local.barrelCost == null" class="text-xs text-parchment/50 mt-1">
            Auto-fills from barrel when selected
          </div>
        </template>
        <div v-else class="text-sm text-parchment">
          {{ batch.barrelCost != null ? Dollar.format(batch.barrelCost) : 'Not set' }}
        </div>
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
          <div v-if="local.vessel && !local.targetAge" class="text-xs text-parchment/50 mt-1">
            Auto-fills from barrel settings when saved
          </div>
        </template>
        <div v-else class="text-sm text-parchment">{{ stage?.targetAge ? `${stage.targetAge} months` : 'Not set' }}</div>
      </div>
    </div>

    <!-- Aging Progress -->
    <div v-if="agingProgress && !editing" class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Aging Progress</div>
        <span class="text-sm font-semibold" :class="agingProgress.percent >= 100 ? 'text-green-400' : 'text-amber-400'">
          {{ agingProgress.months }} / {{ agingProgress.target }} months — {{ agingProgress.percent }}%
        </span>
      </div>
      <div class="w-full h-3 rounded-full bg-brown/20 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="agingProgressColor"
          :style="{ width: `${agingProgress.percent}%` }"
        />
      </div>
      <div v-if="agingProgress.percent >= 100" class="mt-1 text-xs text-green-400 font-medium">
        Target age reached — ready for next stage
      </div>
    </div>

    <!-- Entry / Exit -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <BatchBarrelEntryExit
        :batch="batch"
        :editing="editing"
        type="entry"
        :local-entry-exit="local.entry"
      />
      <BatchBarrelEntryExit
        :batch="batch"
        :editing="editing"
        type="exit"
        :local-entry-exit="local.exit"
      />
    </div>

    <!-- Sampling Records -->
    <BatchBarrelSampling :batch="batch" :editing="editing" />

    <!-- Tasting Notes -->
    <BatchBarrelTastingNotes :batch="batch" />

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
