<script setup lang="ts">
import { Line } from 'vue-chartjs'
useChartRegistration()
import type { Batch, FermentingStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const stage = computed(() => props.batch.stages?.fermenting as FermentingStage | undefined)

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const sortedReadings = computed(() => {
  const readings = stage.value?.readings || []
  return [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const estimatedABV = computed(() => {
  const og = stage.value?.originalGravity
  const fg = stage.value?.finalGravity
  if (og && fg) return ((og - fg) * 131.25).toFixed(2)
  if (!sortedReadings.value || sortedReadings.value.length < 2) return null
  const first = sortedReadings.value[0].gravity
  const last = sortedReadings.value[sortedReadings.value.length - 1].gravity
  if (!first || !last) return null
  return ((first - last) * 131.25).toFixed(2)
})

// OG for per-reading calculations (use explicit OG or first reading)
const effectiveOG = computed(() => {
  if (stage.value?.originalGravity) return stage.value.originalGravity
  if (sortedReadings.value.length > 0) return sortedReadings.value[0].gravity
  return null
})

// Potential ABV based on OG (assumes fermentation to 1.000)
const potentialABV = computed(() => {
  if (!effectiveOG.value) return null
  return (effectiveOG.value - 1.0) * 131.25
})

// Per-reading ABV: (OG - gravity) * 131.25
const readingABV = (gravity: number) => {
  if (!effectiveOG.value || !gravity) return null
  return ((effectiveOG.value - gravity) * 131.25).toFixed(1)
}

// Per-reading % done vs initial potential
const readingPercentDone = (gravity: number) => {
  if (!effectiveOG.value || !gravity || !potentialABV.value) return null
  const currentABV = (effectiveOG.value - gravity) * 131.25
  return Math.min(100, Math.max(0, (currentABV / potentialABV.value) * 100)).toFixed(0)
}

// Start date display
const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const chartData = computed(() => ({
  labels: sortedReadings.value.map((r) =>
    new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  ),
  datasets: [{
    label: 'Gravity',
    data: sortedReadings.value.map((r) => r.gravity),
    borderColor: '#eab308',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    tension: 0.3,
    fill: true,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
}

// Add reading form
const showAddReading = ref(false)
const newReading = ref({
  date: new Date(),
  temperature: undefined as number | undefined,
  temperatureUnit: 'F',
  gravity: undefined as number | undefined,
  pH: undefined as number | undefined,
  notes: '',
})

const addReading = async () => {
  const r = newReading.value
  const readings = [...(stage.value?.readings || []), { ...r }]
  const details = [
    r.gravity != null ? `SG ${r.gravity}` : null,
    r.temperature != null ? `${r.temperature}°${r.temperatureUnit}` : null,
    r.pH != null ? `pH ${r.pH}` : null,
  ].filter(Boolean).join(', ')
  await batchStore.updateStageData(props.batch._id, 'Fermenting', { readings }, `Fermentation reading added${details ? ': ' + details : ''}`)
  showAddReading.value = false
  newReading.value = { date: new Date(), temperature: undefined, temperatureUnit: 'F', gravity: undefined, pH: undefined, notes: '' }
}

// Edit fields
const local = ref({
  vessel: stage.value?.vessel || '',
  startedAt: stage.value?.startedAt ? new Date(stage.value.startedAt) : new Date(),
  yeastStrain: stage.value?.yeastStrain || '',
  pitchTemp: stage.value?.pitchTemp,
  pitchTempUnit: stage.value?.pitchTempUnit || 'F',
  originalGravity: stage.value?.originalGravity,
  finalGravity: stage.value?.finalGravity,
  washVolume: stage.value?.washVolume,
  washVolumeUnit: stage.value?.washVolumeUnit || 'gallon',
  notes: stage.value?.notes || '',
})

const fermenterOptions = computed(() =>
  vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }))
)

const savingEdits = ref(false)
const saveEdits = async () => {
  savingEdits.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Fermenting', {
      vessel: local.value.vessel || undefined,
      startedAt: local.value.startedAt,
      yeastStrain: local.value.yeastStrain,
      pitchTemp: local.value.pitchTemp,
      pitchTempUnit: local.value.pitchTempUnit,
      originalGravity: local.value.originalGravity,
      finalGravity: local.value.finalGravity,
      washVolume: local.value.washVolume,
      washVolumeUnit: local.value.washVolumeUnit,
      notes: local.value.notes,
    })
  } finally {
    savingEdits.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-yellow-500/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-beaker" class="text-lg text-yellow-400" />
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Fermenting</h3>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="estimatedABV" class="text-sm font-semibold text-yellow-400">
          ~{{ estimatedABV }}% ABV
        </span>
        <UButton
          v-if="editing"
          size="xs"
          variant="outline"
          icon="i-lucide-plus"
          @click="showAddReading = !showAddReading"
        >
          Add Reading
        </UButton>
      </div>
    </div>

    <!-- Vessel, Pitch Date, Yeast, Pitch Temp -->
    <div v-if="editing" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <USelect v-model="local.vessel" :items="fermenterOptions" value-key="value" label-key="label" placeholder="Select fermenter" />
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Date</div>
        <SiteDatePicker v-model="local.startedAt" />
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Yeast Strain</div>
        <UInput v-model="local.yeastStrain" placeholder="e.g. Safale US-05" />
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Temp</div>
        <div class="flex gap-2">
          <UInput v-model.number="local.pitchTemp" type="number" placeholder="72" class="flex-1" />
          <USelect v-model="local.pitchTempUnit" :items="['F', 'C']" class="w-16" />
        </div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <UTextarea v-model="local.notes" placeholder="Fermentation notes..." :rows="2" />
      </div>
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <div class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
      <div v-if="stage?.yeastStrain">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Yeast</div>
        <div class="text-sm text-parchment">{{ stage.yeastStrain }}</div>
      </div>
      <div v-if="stage?.pitchTemp">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Pitch Temp</div>
        <div class="text-sm text-parchment">{{ stage.pitchTemp }}&deg;{{ stage.pitchTempUnit }}</div>
      </div>
      <div v-if="stage?.notes">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <div class="text-sm text-parchment/60">{{ stage.notes }}</div>
      </div>
    </div>

    <!-- OG / FG / Wash Volume -->
    <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <UFormField label="Original Gravity">
        <UInput v-model.number="local.originalGravity" type="number" step="0.001" placeholder="1.060" />
      </UFormField>
      <UFormField label="Final Gravity">
        <UInput v-model.number="local.finalGravity" type="number" step="0.001" placeholder="1.010" />
      </UFormField>
      <UFormField label="Wash Volume">
        <UInput v-model.number="local.washVolume" type="number" placeholder="0" />
      </UFormField>
      <UFormField label="Vol. Unit">
        <USelect v-model="local.washVolumeUnit" :items="['gallon', 'L']" />
      </UFormField>
    </div>
    <div v-else class="flex flex-wrap gap-6 mb-4 text-sm text-parchment/60">
      <span v-if="stage?.originalGravity">OG: {{ stage.originalGravity }}</span>
      <span v-if="stage?.finalGravity">FG: {{ stage.finalGravity }}</span>
      <span v-if="stage?.washVolume">Wash: {{ stage.washVolume }} {{ stage.washVolumeUnit }}</span>
    </div>

    <div v-if="editing" class="mb-4 flex justify-end">
      <UButton size="sm" @click="saveEdits" :loading="savingEdits">Save</UButton>
    </div>

    <!-- Add reading form -->
    <div v-if="showAddReading" class="mb-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <div class="text-xs text-parchment/60 mb-1">Date</div>
          <SiteDatePicker v-model="newReading.date" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Gravity</div>
          <UInput v-model.number="newReading.gravity" type="number" step="0.001" placeholder="1.050" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Temperature</div>
          <div class="flex gap-2">
            <UInput v-model.number="newReading.temperature" type="number" placeholder="72" class="flex-1" />
            <USelect v-model="newReading.temperatureUnit" :items="['F', 'C']" class="w-16" />
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">pH</div>
          <UInput v-model.number="newReading.pH" type="number" step="0.1" placeholder="4.5" />
        </div>
        <div class="flex items-end">
          <UButton size="sm" @click="addReading">Add</UButton>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="sortedReadings.length > 0" class="h-48 mb-4">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Readings table -->
    <div v-if="sortedReadings.length > 0">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Readings</div>
      <div class="divide-y divide-brown/20">
        <div class="grid grid-cols-5 gap-2 pb-2 text-xs text-parchment/50 uppercase tracking-wider">
          <span>Date</span>
          <span>Gravity</span>
          <span>ABV</span>
          <span>% Done</span>
          <span>Temp</span>
        </div>
        <div
          v-for="(reading, i) in sortedReadings"
          :key="i"
          class="grid grid-cols-5 gap-2 py-2 text-sm items-center"
        >
          <span class="text-parchment/60">
            {{ new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
          </span>
          <span class="text-parchment">{{ reading.gravity }}</span>
          <span class="text-yellow-400">
            {{ readingABV(reading.gravity) ? `${readingABV(reading.gravity)}%` : '—' }}
          </span>
          <span class="text-parchment/60">
            {{ readingPercentDone(reading.gravity) ? `${readingPercentDone(reading.gravity)}%` : '—' }}
          </span>
          <span class="text-parchment/60">
            <template v-if="reading.temperature">{{ reading.temperature }}&deg;{{ reading.temperatureUnit }}</template>
            <template v-else>—</template>
          </span>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-4">
      <p class="text-sm text-parchment/50">No readings recorded</p>
    </div>
  </div>
</template>
