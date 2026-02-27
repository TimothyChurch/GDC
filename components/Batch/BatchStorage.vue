<script setup lang="ts">
import type { Batch, StorageStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()

const stage = computed(() => props.batch.stages?.storage as StorageStage | undefined)

// All vessels containing this batch in storage
const containingVessels = computed(() => {
  if (!props.batch?._id) return []
  return vesselStore.vessels.filter(v =>
    v.contents?.some(c => c.batch === props.batch._id)
  )
})

const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const local = ref({
  vessel: stage.value?.vessel || '',
  volume: stage.value?.volume,
  volumeUnit: stage.value?.volumeUnit || 'gallon',
  abv: stage.value?.abv,
  proofGallons: stage.value?.proofGallons,
  notes: stage.value?.notes || '',
})

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

// Auto-calculate proof gallons when volume or ABV changes
const calculatedProofGallons = computed(() => {
  if (local.value.volume && local.value.abv) {
    return calculateProofGallons(local.value.volume, local.value.volumeUnit, local.value.abv)
  }
  return null
})

// Use manual entry if provided, otherwise auto-calculated
const displayProofGallons = computed(() => {
  if (stage.value?.proofGallons) return stage.value.proofGallons
  if (stage.value?.volume && stage.value?.abv) {
    return calculateProofGallons(stage.value.volume, stage.value.volumeUnit || 'gallon', stage.value.abv)
  }
  return null
})

// Sync calculated value into local when auto-calculating
watch([() => local.value.volume, () => local.value.abv], () => {
  if (calculatedProofGallons.value !== null) {
    local.value.proofGallons = calculatedProofGallons.value
  }
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Storage', {
      vessel: local.value.vessel || undefined,
      volume: local.value.volume,
      volumeUnit: local.value.volumeUnit,
      abv: local.value.abv,
      proofGallons: local.value.proofGallons,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-purple-500/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-warehouse" class="text-lg text-purple-400" />
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Storage</h3>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="stage?.abv" class="px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-500/15 text-purple-400 border-purple-500/25">
          {{ stage.abv }}% ABV
        </span>
        <span v-if="displayProofGallons" class="text-sm text-purple-400 font-semibold">
          {{ displayProofGallons }} PG
        </span>
      </div>
    </div>

    <!-- Vessel Cards Grid -->
    <div v-if="containingVessels.length > 0 && !editing" class="mb-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-3">Current Vessels</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <VesselCard
          v-for="vessel in containingVessels"
          :key="vessel._id"
          :vessel="vessel"
        />
      </div>
    </div>

    <!-- Editing: Vessel & Start Date -->
    <div v-if="editing" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <USelect v-model="local.vessel" :items="tankOptions" value-key="value" label-key="label" placeholder="Select tank" />
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
    </div>
    <div v-else-if="containingVessels.length === 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <div class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
    </div>

    <!-- Volume, ABV, Proof Gallons (edit mode or when no vessel cards shown) -->
    <div v-if="editing" class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Contents</div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="Volume">
          <UInput v-model.number="local.volume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.volumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="ABV %">
          <UInput v-model.number="local.abv" type="number" step="0.1" placeholder="0" />
        </UFormField>
        <UFormField label="Proof Gallons">
          <UInput v-model.number="local.proofGallons" type="number" step="0.01" :placeholder="calculatedProofGallons?.toString() || '0'" />
        </UFormField>
      </div>
    </div>
    <div v-else-if="containingVessels.length === 0" class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Contents</div>
      <div class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.volume">Volume: {{ stage.volume }} {{ stage.volumeUnit }}</span>
        <span v-if="stage?.abv">ABV: {{ stage.abv }}%</span>
        <span v-if="displayProofGallons" class="text-purple-400 font-semibold">PG: {{ displayProofGallons }}</span>
        <span v-if="!stage?.volume && !stage?.abv">Not recorded</span>
      </div>
    </div>

    <!-- Summary stats when vessel cards are shown -->
    <div v-if="!editing && containingVessels.length > 0" class="mb-4">
      <div class="flex flex-wrap gap-6 text-sm">
        <div>
          <span class="text-parchment/50">Total Volume: </span>
          <span class="text-parchment">{{ stage?.volume || 0 }} {{ stage?.volumeUnit || 'gallon' }}</span>
        </div>
        <div>
          <span class="text-parchment/50">Start Date: </span>
          <span class="text-parchment">{{ startDate }}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Storage notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Storage</UButton>
    </div>
  </div>
</template>
