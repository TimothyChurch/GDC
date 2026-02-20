<script setup lang="ts">
import type { Batch, ProofingStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()

const stage = computed(() => props.batch.stages?.proofing as ProofingStage | undefined)

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
  startAbv: stage.value?.startAbv,
  startVolume: stage.value?.startVolume,
  startVolumeUnit: stage.value?.startVolumeUnit || 'gallon',
  targetAbv: stage.value?.targetAbv,
  waterAdded: stage.value?.waterAdded,
  waterAddedUnit: stage.value?.waterAddedUnit || 'gallon',
  waterSource: stage.value?.waterSource || '',
  finalAbv: stage.value?.finalAbv,
  finalVolume: stage.value?.finalVolume,
  finalVolumeUnit: stage.value?.finalVolumeUnit || 'gallon',
  finalProofGallons: stage.value?.finalProofGallons,
  notes: stage.value?.notes || '',
})

const tankOptions = computed(() =>
  vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
)

// Auto-calculate water needed: (startAbv / targetAbv * startVolume) - startVolume
const calculatedWaterNeeded = computed(() => {
  const { startAbv, targetAbv, startVolume } = local.value
  if (startAbv && targetAbv && startVolume && targetAbv > 0 && startAbv > targetAbv) {
    const result = (startAbv / targetAbv) * startVolume - startVolume
    return +result.toFixed(2)
  }
  return null
})

// Auto-calculate final proof gallons
const calculatedProofGallons = computed(() => {
  if (local.value.finalVolume && local.value.finalAbv) {
    return calculateProofGallons(local.value.finalVolume, local.value.finalVolumeUnit, local.value.finalAbv)
  }
  return null
})

// Display proof gallons for read-only mode
const displayProofGallons = computed(() => {
  if (stage.value?.finalProofGallons) return stage.value.finalProofGallons
  if (stage.value?.finalVolume && stage.value?.finalAbv) {
    return calculateProofGallons(stage.value.finalVolume, stage.value.finalVolumeUnit || 'gallon', stage.value.finalAbv)
  }
  return null
})

// Sync calculated proof gallons into local
watch([() => local.value.finalVolume, () => local.value.finalAbv], () => {
  if (calculatedProofGallons.value !== null) {
    local.value.finalProofGallons = calculatedProofGallons.value
  }
})

const saving = ref(false)
const save = async () => {
  saving.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Proofing', {
      vessel: local.value.vessel || undefined,
      startAbv: local.value.startAbv,
      startVolume: local.value.startVolume,
      startVolumeUnit: local.value.startVolumeUnit,
      targetAbv: local.value.targetAbv,
      waterAdded: local.value.waterAdded,
      waterAddedUnit: local.value.waterAddedUnit,
      waterSource: local.value.waterSource,
      finalAbv: local.value.finalAbv,
      finalVolume: local.value.finalVolume,
      finalVolumeUnit: local.value.finalVolumeUnit,
      finalProofGallons: local.value.finalProofGallons,
      notes: local.value.notes,
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-cyan-500/30 p-5">
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-droplets" class="text-lg text-cyan-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Proofing</h3>
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

    <!-- Starting Spirit -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Starting Spirit</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="ABV %">
          <UInput v-model.number="local.startAbv" type="number" step="0.1" placeholder="e.g. 65" />
        </UFormField>
        <UFormField label="Volume">
          <UInput v-model.number="local.startVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.startVolumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="Target ABV %">
          <UInput v-model.number="local.targetAbv" type="number" step="0.1" placeholder="e.g. 40" />
        </UFormField>
      </div>
      <div v-else class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.startAbv">Start ABV: {{ stage.startAbv }}%</span>
        <span v-if="stage?.startVolume">Volume: {{ stage.startVolume }} {{ stage.startVolumeUnit }}</span>
        <span v-if="stage?.targetAbv" class="text-cyan-400 font-semibold">Target: {{ stage.targetAbv }}%</span>
        <span v-if="!stage?.startAbv && !stage?.startVolume">Not recorded</span>
      </div>
    </div>

    <!-- Water needed helper -->
    <div v-if="editing && calculatedWaterNeeded" class="mb-4 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
      <span class="text-xs text-cyan-400">
        Estimated water needed: {{ calculatedWaterNeeded }} {{ local.startVolumeUnit }}
      </span>
    </div>

    <!-- Water Addition -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Water Addition</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <UFormField label="Water Added">
          <UInput v-model.number="local.waterAdded" type="number" :placeholder="calculatedWaterNeeded?.toString() || '0'" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.waterAddedUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="Water Source">
          <UInput v-model="local.waterSource" placeholder="e.g. RO, distilled, municipal" />
        </UFormField>
      </div>
      <div v-else class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.waterAdded">Added: {{ stage.waterAdded }} {{ stage.waterAddedUnit }}</span>
        <span v-if="stage?.waterSource">Source: {{ stage.waterSource }}</span>
        <span v-if="!stage?.waterAdded && !stage?.waterSource">Not recorded</span>
      </div>
    </div>

    <!-- Final Result -->
    <div class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Final Result</div>
      <div v-if="editing" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <UFormField label="Final ABV %">
          <UInput v-model.number="local.finalAbv" type="number" step="0.1" placeholder="0" />
        </UFormField>
        <UFormField label="Final Volume">
          <UInput v-model.number="local.finalVolume" type="number" placeholder="0" />
        </UFormField>
        <UFormField label="Unit">
          <USelect v-model="local.finalVolumeUnit" :items="['gallon', 'L', 'mL']" />
        </UFormField>
        <UFormField label="Proof Gallons">
          <UInput v-model.number="local.finalProofGallons" type="number" step="0.01" :placeholder="calculatedProofGallons?.toString() || '0'" />
        </UFormField>
      </div>
      <div v-else class="flex flex-wrap gap-6 text-sm text-parchment/60">
        <span v-if="stage?.finalAbv">Final ABV: {{ stage.finalAbv }}%</span>
        <span v-if="stage?.finalVolume">Volume: {{ stage.finalVolume }} {{ stage.finalVolumeUnit }}</span>
        <span v-if="displayProofGallons" class="text-cyan-400 font-semibold">PG: {{ displayProofGallons }}</span>
        <span v-if="!stage?.finalAbv && !stage?.finalVolume">Not recorded</span>
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <template v-if="editing">
        <UTextarea v-model="local.notes" placeholder="Proofing notes..." :rows="2" />
      </template>
      <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
    </div>

    <div v-if="editing" class="mt-4 flex justify-end">
      <UButton @click="save" :loading="saving" size="sm">Save Proofing</UButton>
    </div>
  </div>
</template>
