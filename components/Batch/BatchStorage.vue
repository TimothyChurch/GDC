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
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-warehouse" class="text-lg text-purple-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Storage</h3>
    </div>

    <!-- Vessel & Start Date -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vessel</div>
        <template v-if="editing">
          <USelect v-model="local.vessel" :items="tankOptions" value-key="value" label-key="label" placeholder="Select tank" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
    </div>

    <!-- Volume, ABV, Proof Gallons -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Contents</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
      <div v-else class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.volume">Volume: {{ stage.volume }} {{ stage.volumeUnit }}</span>
        <span v-if="stage?.abv">ABV: {{ stage.abv }}%</span>
        <span v-if="displayProofGallons" class="text-purple-400 font-semibold">PG: {{ displayProofGallons }}</span>
        <span v-if="!stage?.volume && !stage?.abv">Not recorded</span>
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
