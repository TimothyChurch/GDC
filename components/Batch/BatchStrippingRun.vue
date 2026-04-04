<script setup lang="ts">
import type { Batch, StrippingRunStage, DistillingRun } from '~/types'
import { STAGE_KEY_MAP } from '~/composables/batchPipeline'
import { LazyModalDistillingCharge } from '#components'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const overlay = useOverlay()

const globalExpanded = ref<boolean | null>(null)
provide('distillingRunsGlobalExpanded', globalExpanded)

const allExpanded = ref(false)
const toggleAllRuns = () => {
  allExpanded.value = !allExpanded.value
  globalExpanded.value = allExpanded.value
}

const stage = computed(() => props.batch.stages?.strippingRun as StrippingRunStage | undefined)
const runs = computed(() => stage.value?.runs || [])

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

const runCount = computed(() => runs.value.length)

const totalOutputVolume = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.output?.volume || r.total?.volume || 0), 0)
)
const totalOutputUnit = computed(() =>
  runs.value[0]?.output?.volumeUnit || runs.value[0]?.total?.volumeUnit || 'gallon'
)
const avgAbv = computed(() => {
  const runsWithOutput = runs.value.filter(r => (r.output?.volume || r.total?.volume) && (r.output?.abv || r.total?.abv))
  if (runsWithOutput.length === 0) return 0
  const totalVol = runsWithOutput.reduce((s, r) => s + (r.output?.volume || r.total?.volume || 0), 0)
  if (totalVol === 0) return 0
  return runsWithOutput.reduce((s, r) => {
    const vol = r.output?.volume || r.total?.volume || 0
    const abv = r.output?.abv || r.total?.abv || 0
    return s + vol * abv
  }, 0) / totalVol
})

const totalProofGallons = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.total?.proofGallons || 0), 0)
)

// Get the fermenting stage vessel (source for charges)
const fermentingVesselId = computed(() => {
  const fermStageKey = STAGE_KEY_MAP['Fermenting']
  if (!fermStageKey) return undefined
  const fermStage = (props.batch.stages as any)?.[fermStageKey]
  return fermStage?.vessel as string | undefined
})

const getRunIndex = (run: DistillingRun) => runs.value.indexOf(run)

const addingRun = ref(false)
const addRun = async () => {
  const chargeModal = overlay.create(LazyModalDistillingCharge)
  const result = await chargeModal.open({
    batchId: props.batch._id,
    sourceVesselId: fermentingVesselId.value,
    defaultRunType: 'stripping' as const,
    isFirstRun: false,
    forceRunType: true,
  })

  if (!result) return

  addingRun.value = true
  try {
    const sourceVessels = result.chargeSourceVessels || (result.chargeSourceVessel ? [result.chargeSourceVessel] : [])
    if (result.chargeVolume > 0 && sourceVessels.length > 0) {
      for (const vesselId of sourceVessels) {
        const perVessel = result.chargePerVessel?.find(p => p.vesselId === vesselId)
        if (perVessel) {
          await vesselStore.transferBatchContents(vesselId, result.stillId, props.batch._id, perVessel.volume, perVessel.volumeUnit)
        } else {
          const vessel = vesselStore.getVesselById(vesselId)
          const entry = vessel?.contents?.find(c => c.batch === props.batch._id)
          if (!entry || entry.volume <= 0) continue
          await vesselStore.transferBatchContents(vesselId, result.stillId, props.batch._id, entry.volume, entry.volumeUnit)
        }
      }
    }

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

    if (result.stillId !== stage.value?.vessel) {
      await batchStore.updateStageData(props.batch._id, 'Stripping Run', {
        vessel: result.stillId,
      })
    }

    const newRun: DistillingRun = {
      runType: 'stripping',
      date: new Date(),
      chargeVolume: result.chargeVolume,
      chargeVolumeUnit: result.chargeVolumeUnit,
      chargeAbv: result.chargeAbv,
      chargeSourceVessel: sourceVessels[0] || '',
      chargeSourceVessels: sourceVessels,
      additions: result.additions.length > 0 ? result.additions : undefined,
      output: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined },
    }
    await batchStore.addStrippingRun(props.batch._id, newRun)
  } catch (error: unknown) {
    const toast = useToast()
    toast.add({
      title: 'Failed to add stripping run',
      description: getErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    addingRun.value = false
  }
}

const deleteRun = async (runIndex: number) => {
  await batchStore.deleteStrippingRun(props.batch._id, runIndex)
}

const savingStage = ref(false)
const saveStageFields = async () => {
  savingStage.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Stripping Run', {
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
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Stripping Run</h3>
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
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
        <template v-if="editing">
          <UTextarea v-model="localNotes" placeholder="Stage notes..." :rows="1" />
        </template>
        <div v-else class="text-sm text-parchment/60">{{ stage?.notes || 'None' }}</div>
      </div>
    </div>

    <div v-if="editing" class="flex justify-end mb-4">
      <UButton @click="saveStageFields" :loading="savingStage" size="xs" variant="outline">Save Stage Info</UButton>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-parchment">{{ runCount }}</div>
        <div class="text-xs text-parchment/50">Stripping Runs</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-amber-400">
          {{ totalOutputVolume > 0 ? totalOutputVolume.toFixed(1) : '---' }}
          <span v-if="totalOutputVolume > 0" class="text-sm font-normal text-parchment/50">{{ totalOutputUnit === 'gallon' ? 'gal' : totalOutputUnit }}</span>
        </div>
        <div class="text-xs text-parchment/50">Low Wines Output</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-parchment">
          {{ avgAbv > 0 ? avgAbv.toFixed(1) + '%' : '---' }}
        </div>
        <div class="text-xs text-parchment/50">Avg ABV</div>
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

    <!-- Runs list -->
    <div v-if="runs.length > 0" class="space-y-3 mb-4">
      <BatchDistillingRun
        v-for="run in runs"
        :key="run.runNumber || getRunIndex(run)"
        :run="run"
        :run-index="getRunIndex(run)"
        :batch-id="batch._id"
        stage-key="strippingRun"
        @delete="deleteRun"
      />
    </div>

    <!-- Empty state -->
    <div v-if="runs.length === 0" class="text-center py-8 text-parchment/50 text-sm">
      No stripping runs recorded yet.
      <span v-if="editing">Use the button below to add a run.</span>
    </div>

    <!-- Add run button -->
    <div v-if="editing" class="flex gap-3 mt-4">
      <UButton
        icon="i-lucide-plus"
        variant="outline"
        size="sm"
        :loading="addingRun"
        @click="addRun"
      >
        Add Stripping Run
      </UButton>
    </div>
  </div>
</template>
