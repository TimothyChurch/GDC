<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()

const vesselName = computed(() => {
  if (!props.batch.fermenting?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(props.batch.fermenting.vessel)?.name || 'Unknown'
})

const sortedReadings = computed(() => {
  const readings = props.batch.fermenting?.readings || []
  return [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const estimatedABV = computed(() => {
  if (!sortedReadings.value || sortedReadings.value.length < 2) return null
  const og = sortedReadings.value[0].gravity
  const fg = sortedReadings.value[sortedReadings.value.length - 1].gravity
  return ((og - fg) * 131.25).toFixed(2)
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
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      ticks: { color: 'rgba(255,255,255,0.4)' },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    x: {
      ticks: { color: 'rgba(255,255,255,0.4)' },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
}

// Add reading form
const showAddReading = ref(false)
const newReading = ref({
  date: new Date(),
  temperature: undefined as unknown as number,
  temperatureUnit: 'F',
  gravity: undefined as unknown as number,
})

const addReading = async () => {
  const target = batchStore.getBatchById(props.batch._id)
  if (!target) return
  target.fermenting.readings.push({ ...newReading.value })
  batchStore.batch = target
  await batchStore.updateBatch()
  showAddReading.value = false
  newReading.value = {
    date: new Date(),
    temperature: undefined as unknown as number,
    temperatureUnit: 'F',
    gravity: undefined as unknown as number,
  }
}

// Edit fields
const localVessel = ref(props.batch.fermenting?.vessel || '')
const localNotes = ref(props.batch.fermenting?.notes || '')

const fermenterOptions = computed(() =>
  vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }))
)

const savingEdits = ref(false)
const saveEdits = async () => {
  savingEdits.value = true
  try {
    const target = batchStore.getBatchById(props.batch._id)
    if (!target) return
    target.fermenting.vessel = localVessel.value || undefined
    target.fermenting.notes = localNotes.value
    batchStore.batch = target
    await batchStore.updateBatch()
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

    <!-- Vessel & Notes (editing) -->
    <div v-if="editing" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <USelect v-model="localVessel" :items="fermenterOptions" value-key="value" label-key="label" placeholder="Select fermenter" />
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <UTextarea v-model="localNotes" placeholder="Fermentation notes..." :rows="2" />
      </div>
      <div class="sm:col-span-2 flex justify-end">
        <UButton size="sm" @click="saveEdits" :loading="savingEdits">Save</UButton>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <div class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div v-if="batch.fermenting?.notes">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <div class="text-sm text-parchment/60">{{ batch.fermenting.notes }}</div>
      </div>
    </div>

    <!-- Add reading form -->
    <div v-if="showAddReading" class="mb-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <div class="text-xs text-parchment/60 mb-1">Date</div>
          <SiteDatePicker v-model="newReading.date" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Gravity</div>
          <UInput v-model="newReading.gravity" type="number" step="0.001" placeholder="1.050" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Temperature</div>
          <UInput v-model="newReading.temperature" type="number" placeholder="72" />
        </div>
        <div>
          <div class="text-xs text-parchment/60 mb-1">Unit</div>
          <div class="flex gap-2 items-end">
            <USelect v-model="newReading.temperatureUnit" :items="['F', 'C']" class="flex-1" />
            <UButton size="sm" @click="addReading">Add</UButton>
          </div>
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
        <div
          v-for="(reading, i) in sortedReadings"
          :key="i"
          class="flex items-center justify-between py-2 text-sm"
        >
          <span class="text-parchment/60">
            {{ new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
          </span>
          <span class="text-parchment">{{ reading.gravity }}</span>
          <span class="text-parchment/60">{{ reading.temperature }}&deg;{{ reading.temperatureUnit }}</span>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-4">
      <p class="text-sm text-parchment/50">No readings recorded</p>
    </div>
  </div>
</template>
