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

// Global expand/collapse state for distilling runs
// null = no global override (children use their local state)
// true = all expanded, false = all collapsed
const globalExpanded = ref<boolean | null>(null)
provide('distillingRunsGlobalExpanded', globalExpanded)

const allExpanded = ref(false)
const toggleAllRuns = () => {
  allExpanded.value = !allExpanded.value
  globalExpanded.value = allExpanded.value
}

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

// Split runs by type
const strippingRuns = computed(() => runs.value.filter(r => r.runType === 'stripping'))
const spiritRuns = computed(() => runs.value.filter(r => r.runType === 'spirit'))

// Summary stats
const totalRuns = computed(() => runs.value.length)
const totalProofGallons = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.total?.proofGallons || 0), 0)
)
const strippingCount = computed(() => strippingRuns.value.length)
const spiritCount = computed(() => spiritRuns.value.length)

// Stripping output totals (low wines accumulated)
const strippingTotalVolume = computed(() =>
  strippingRuns.value.reduce((sum, r) => sum + (r.output?.volume || r.total?.volume || 0), 0)
)
const strippingTotalUnit = computed(() =>
  strippingRuns.value[0]?.output?.volumeUnit || strippingRuns.value[0]?.total?.volumeUnit || 'gallon'
)
const strippingAvgAbv = computed(() => {
  const runsWithOutput = strippingRuns.value.filter(r => (r.output?.volume || r.total?.volume) && (r.output?.abv || r.total?.abv))
  if (runsWithOutput.length === 0) return 0
  const totalVol = runsWithOutput.reduce((s, r) => s + (r.output?.volume || r.total?.volume || 0), 0)
  if (totalVol === 0) return 0
  return runsWithOutput.reduce((s, r) => {
    const vol = r.output?.volume || r.total?.volume || 0
    const abv = r.output?.abv || r.total?.abv || 0
    return s + vol * abv
  }, 0) / totalVol
})

// Spirit run hearts totals
const heartsTotalVolume = computed(() =>
  spiritRuns.value.reduce((sum, r) => sum + (r.collected?.hearts?.volume || 0), 0)
)
const heartsTotalUnit = computed(() =>
  spiritRuns.value[0]?.collected?.hearts?.volumeUnit || 'gallon'
)

// Workflow phase: where is this batch in the stripping→spirit flow?
type DistillingPhase = 'not-started' | 'stripping' | 'ready-for-spirit' | 'spirit' | 'complete'
const workflowPhase = computed<DistillingPhase>(() => {
  if (runs.value.length === 0) return 'not-started'
  const hasStripping = strippingCount.value > 0
  const hasSpirit = spiritCount.value > 0
  // Check if all spirit runs have output recorded
  const spiritComplete = hasSpirit && spiritRuns.value.every(r => r.total?.volume && r.total.volume > 0)
  if (spiritComplete) return 'complete'
  if (hasSpirit) return 'spirit'
  if (hasStripping) return 'ready-for-spirit'
  return 'stripping'
})

// Run index offset for spirit runs (since they come after stripping runs in the flat array)
const getRunIndex = (run: DistillingRun) => runs.value.indexOf(run)

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
    // Transfer charge from all selected source vessels to still
    const sourceVessels = result.chargeSourceVessels || (result.chargeSourceVessel ? [result.chargeSourceVessel] : [])
    if (result.chargeVolume > 0 && sourceVessels.length > 0) {
      for (const vesselId of sourceVessels) {
        const vessel = vesselStore.getVesselById(vesselId)
        const entry = vessel?.contents?.find(c => c.batch === props.batch._id)
        if (!entry || entry.volume <= 0) continue
        await vesselStore.transferBatchContents(
          vesselId,
          result.stillId,
          props.batch._id,
          entry.volume,
          entry.volumeUnit,
        )
      }
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
      chargeSourceVessel: sourceVessels[0] || '',
      chargeSourceVessels: sourceVessels,
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

    <!-- Workflow progress -->
    <div v-if="runs.length > 0" class="mb-5 rounded-lg border border-brown/20 bg-brown/5 p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="text-xs text-parchment/60 uppercase tracking-wider">Distilling Workflow</div>
      </div>
      <div class="flex items-center gap-0">
        <!-- Step 1: Stripping -->
        <div class="flex flex-col items-center gap-1 flex-1">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              strippingCount > 0
                ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30'
                : 'bg-brown/20 text-parchment/50',
              workflowPhase === 'stripping' && 'animate-pulse',
            ]"
          >
            <UIcon name="i-lucide-flame" />
          </div>
          <span class="text-[10px] text-parchment/50 uppercase tracking-wider">Strip</span>
          <span v-if="strippingCount > 0" class="text-[10px] text-amber-400 font-semibold">
            {{ strippingCount }} {{ strippingCount === 1 ? 'run' : 'runs' }}
          </span>
        </div>

        <!-- Connector 1→2 -->
        <div
          :class="[
            'flex-1 h-0.5 rounded -mt-5',
            strippingCount > 0 ? 'bg-amber-500/40' : 'bg-brown/20',
          ]"
        />

        <!-- Step 2: Low Wines -->
        <div class="flex flex-col items-center gap-1 flex-1">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              workflowPhase === 'ready-for-spirit' || workflowPhase === 'spirit' || workflowPhase === 'complete'
                ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/30'
                : strippingCount > 0
                  ? 'bg-yellow-500/10 text-yellow-400/60 ring-1 ring-yellow-500/20'
                  : 'bg-brown/20 text-parchment/50',
              workflowPhase === 'ready-for-spirit' && 'animate-pulse',
            ]"
          >
            <UIcon name="i-lucide-beaker" />
          </div>
          <span class="text-[10px] text-parchment/50 uppercase tracking-wider">Low Wines</span>
          <span v-if="strippingTotalVolume > 0" class="text-[10px] text-yellow-400 font-semibold">
            {{ strippingTotalVolume.toFixed(1) }} {{ strippingTotalUnit === 'gallon' ? 'gal' : strippingTotalUnit }}
            <span v-if="strippingAvgAbv > 0" class="text-parchment/60">@ {{ strippingAvgAbv.toFixed(1) }}%</span>
          </span>
        </div>

        <!-- Connector 2→3 -->
        <div
          :class="[
            'flex-1 h-0.5 rounded -mt-5',
            spiritCount > 0 ? 'bg-copper/40' : 'bg-brown/20',
          ]"
        />

        <!-- Step 3: Spirit Run -->
        <div class="flex flex-col items-center gap-1 flex-1">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              spiritCount > 0
                ? 'bg-copper/20 text-copper ring-2 ring-copper/30'
                : 'bg-brown/20 text-parchment/50',
              workflowPhase === 'spirit' && 'animate-pulse',
            ]"
          >
            <UIcon name="i-lucide-flask-conical" />
          </div>
          <span class="text-[10px] text-parchment/50 uppercase tracking-wider">Spirit</span>
          <span v-if="spiritCount > 0" class="text-[10px] text-copper font-semibold">
            {{ spiritCount }} {{ spiritCount === 1 ? 'run' : 'runs' }}
          </span>
        </div>

        <!-- Connector 3→4 -->
        <div
          :class="[
            'flex-1 h-0.5 rounded -mt-5',
            workflowPhase === 'complete' ? 'bg-green-500/40' : 'bg-brown/20',
          ]"
        />

        <!-- Step 4: Hearts -->
        <div class="flex flex-col items-center gap-1 flex-1">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              workflowPhase === 'complete'
                ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30'
                : 'bg-brown/20 text-parchment/50',
            ]"
          >
            <UIcon name="i-lucide-heart" />
          </div>
          <span class="text-[10px] text-parchment/50 uppercase tracking-wider">Hearts</span>
          <span v-if="heartsTotalVolume > 0" class="text-[10px] text-green-400 font-semibold">
            {{ heartsTotalVolume.toFixed(1) }} {{ heartsTotalUnit === 'gallon' ? 'gal' : heartsTotalUnit }}
          </span>
        </div>
      </div>
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

    <!-- Expand/Collapse All toggle -->
    <div v-if="runs.length >= 2 && !editing" class="flex justify-end mb-2">
      <UButton
        :icon="allExpanded ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down'"
        variant="ghost"
        size="xs"
        color="neutral"
        @click="toggleAllRuns"
      >
        {{ allExpanded ? 'Collapse All' : 'Expand All' }}
      </UButton>
    </div>

    <!-- Stripping Runs Section -->
    <div v-if="strippingRuns.length > 0" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-lucide-flame" class="text-amber-400 text-sm" />
        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Stripping Runs</span>
        <span class="text-[10px] text-parchment/60">({{ strippingCount }})</span>
      </div>
      <div class="space-y-3">
        <BatchDistillingRun
          v-for="run in strippingRuns"
          :key="run.runNumber || getRunIndex(run)"
          :run="run"
          :run-index="getRunIndex(run)"
          :editing="editing"
          :batch-id="batch._id"
          @delete="deleteRun"
        />
      </div>
    </div>

    <!-- Ready for spirit run hint -->
    <div
      v-if="editing && workflowPhase === 'ready-for-spirit'"
      class="flex items-center gap-2 rounded-lg border border-copper/20 bg-copper/5 px-3 py-2 mb-4"
    >
      <UIcon name="i-lucide-arrow-down" class="text-copper shrink-0" />
      <span class="text-xs text-parchment/70">
        Low wines accumulated from {{ strippingCount }} stripping {{ strippingCount === 1 ? 'run' : 'runs' }}.
        Ready to charge the still for a spirit run.
      </span>
    </div>

    <!-- Spirit Runs Section -->
    <div v-if="spiritRuns.length > 0" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-lucide-flask-conical" class="text-copper text-sm" />
        <span class="text-xs font-semibold text-copper uppercase tracking-wider">Spirit Runs</span>
        <span class="text-[10px] text-parchment/60">({{ spiritCount }})</span>
      </div>
      <div class="space-y-3">
        <BatchDistillingRun
          v-for="run in spiritRuns"
          :key="run.runNumber || getRunIndex(run)"
          :run="run"
          :run-index="getRunIndex(run)"
          :editing="editing"
          :batch-id="batch._id"
          @delete="deleteRun"
        />
      </div>
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
