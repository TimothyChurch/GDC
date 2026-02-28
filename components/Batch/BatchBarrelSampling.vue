<script setup lang="ts">
import type { Batch, BarrelAgingStage } from '~/types'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()

const stage = computed(() => props.batch.stages?.barrelAging as BarrelAgingStage | undefined)

const sortedSamplings = computed(() => {
  const samplings = stage.value?.samplings || []
  return [...samplings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

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
</script>

<template>
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
</template>
