<script setup lang="ts">
import type { Batch, DistillingStage, DistillingRun } from '~/types'
import { STAGE_KEY_MAP } from '~/composables/batchPipeline'
import { normalizeDistillingRuns } from '~/utils/distillingMigration'
import { calculateProofGallons } from '~/utils/proofGallons'
import { LazyModalDistillingCharge } from '#components'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const overlay = useOverlay()

const stage = computed(() => props.batch.stages?.distilling as DistillingStage | undefined)

// Normalize runs for backwards compatibility
const runs = computed(() => normalizeDistillingRuns(stage.value))

// Still selection (stage-level vessel)
const vesselName = computed(() => {
  if (!stage.value?.vessel) return 'Not assigned'
  return vesselStore.getVesselById(stage.value.vessel)?.name || 'Unknown'
})

const stillOptions = computed(() =>
  vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
)

const localVessel = ref(stage.value?.vessel || '')
const localNotes = ref(stage.value?.notes || '')

watch(() => stage.value?.vessel, (v) => { localVessel.value = v || '' })
watch(() => stage.value?.notes, (n) => { localNotes.value = n || '' })

const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

// Summary stats
const totalRuns = computed(() => runs.value.length)
const totalProofGallons = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.total?.proofGallons || 0), 0)
)
const strippingCount = computed(() => runs.value.filter(r => r.runType === 'stripping').length)
const spiritCount = computed(() => runs.value.filter(r => r.runType === 'spirit').length)

// Get the fermenting stage vessel (source for charges)
const fermentingVesselId = computed(() => {
  const fermStageKey = STAGE_KEY_MAP['Fermenting']
  if (!fermStageKey) return undefined
  const fermStage = (props.batch.stages as any)?.[fermStageKey]
  return fermStage?.vessel as string | undefined
})

// Add a new run via charge modal
const addingRun = ref(false)
const addRun = async (defaultRunType: 'stripping' | 'spirit') => {
  const chargeModal = overlay.create(LazyModalDistillingCharge)
  const result = await chargeModal.open({
    batchId: props.batch._id,
    sourceVesselId: fermentingVesselId.value,
    defaultRunType,
    isFirstRun: false,
  })

  if (!result) return

  addingRun.value = true
  try {
    // Transfer charge from source to still
    if (result.chargeVolume > 0 && result.chargeSourceVessel) {
      await vesselStore.transferBatchContents(
        result.chargeSourceVessel,
        result.stillId,
        props.batch._id,
        result.chargeVolume,
        result.chargeVolumeUnit,
      )
    }

    // Transfer additions (proportional — communal vessels)
    for (const addition of result.additions) {
      if (addition.sourceVessel && (addition.volume || 0) > 0) {
        await vesselStore.transferBatch(addition.sourceVessel, result.stillId, {
          volume: addition.volume!,
          volumeUnit: addition.volumeUnit || 'gallon',
          abv: addition.abv || 0,
          value: 0,
        })
      }
    }

    // Update stage vessel if still changed
    if (result.stillId !== stage.value?.vessel) {
      await batchStore.updateStageData(props.batch._id, 'Distilling', {
        vessel: result.stillId,
      })
    }

    // Create run with charge data pre-filled
    const newRun: DistillingRun = {
      runType: result.runType,
      date: new Date(),
      chargeVolume: result.chargeVolume,
      chargeVolumeUnit: result.chargeVolumeUnit,
      chargeAbv: result.chargeAbv,
      chargeSourceVessel: result.chargeSourceVessel,
      additions: result.additions.length > 0 ? result.additions : undefined,
    }
    if (result.runType === 'stripping') {
      newRun.output = { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined }
    } else {
      newRun.collected = {
        foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        lateHeads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      }
    }
    await batchStore.addDistillingRun(props.batch._id, newRun)
  } catch (error: unknown) {
    const toast = useToast()
    toast.add({
      title: 'Failed to add distilling run',
      description: getErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    addingRun.value = false
  }
}

// Delete a run
const deleteRun = async (runIndex: number) => {
  await batchStore.deleteDistillingRun(props.batch._id, runIndex)
}

// Save stage-level fields (vessel, notes)
const savingStage = ref(false)
const saveStageFields = async () => {
  savingStage.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Distilling', {
      vessel: localVessel.value || undefined,
      notes: localNotes.value || undefined,
    })
  } finally {
    savingStage.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-copper/30 p-5">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-flask-conical" class="text-lg text-copper" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Distilling</h3>
    </div>

    <!-- Stage info -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Still</div>
        <template v-if="editing">
          <USelect v-model="localVessel" :items="stillOptions" value-key="value" label-key="label" placeholder="Select still" />
        </template>
        <div v-else class="text-sm text-parchment">{{ vesselName }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Start Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Overall Notes</div>
        <template v-if="editing">
          <UTextarea v-model="localNotes" placeholder="Stage-level notes..." :rows="1" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
      </div>
    </div>

    <!-- Save stage fields -->
    <div v-if="editing" class="flex justify-end mb-4">
      <UButton @click="saveStageFields" :loading="savingStage" size="xs" variant="outline">Save Stage Info</UButton>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-parchment">{{ totalRuns }}</div>
        <div class="text-xs text-parchment/50">Total Runs</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-parchment">{{ strippingCount }}</div>
        <div class="text-xs text-parchment/50">Stripping</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-parchment">{{ spiritCount }}</div>
        <div class="text-xs text-parchment/50">Spirit</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-copper">{{ totalProofGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/50">Total PG</div>
      </div>
    </div>

    <!-- Run list -->
    <div class="space-y-3">
      <BatchDistillingRun
        v-for="(run, index) in runs"
        :key="run.runNumber || index"
        :run="run"
        :run-index="index"
        :editing="editing"
        :batch-id="batch._id"
        @delete="deleteRun"
      />
    </div>

    <!-- Empty state -->
    <div v-if="runs.length === 0" class="text-center py-8 text-parchment/50 text-sm">
      No distilling runs recorded yet.
      <span v-if="editing">Use the buttons below to add a run.</span>
    </div>

    <!-- Add run buttons -->
    <div v-if="editing" class="flex gap-3 mt-4">
      <UButton
        icon="i-lucide-plus"
        variant="outline"
        size="sm"
        :loading="addingRun"
        @click="addRun('stripping')"
      >
        Add Stripping Run
      </UButton>
      <UButton
        icon="i-lucide-plus"
        variant="outline"
        color="primary"
        size="sm"
        :loading="addingRun"
        @click="addRun('spirit')"
      >
        Add Spirit Run
      </UButton>
    </div>
  </div>
</template>
