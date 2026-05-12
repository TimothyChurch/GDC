<script setup lang="ts">
import type { Batch, SpiritRunStage, DistillingRun } from '~/types'
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

const stage = computed(() => props.batch.stages?.spiritRun as SpiritRunStage | undefined)
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

const heartsTotalVolume = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.collected?.hearts?.volume || 0), 0)
)
const heartsTotalUnit = computed(() =>
  runs.value[0]?.collected?.hearts?.volumeUnit || 'gallon'
)
const totalProofGallons = computed(() =>
  runs.value.reduce((sum, r) => sum + (r.total?.proofGallons || 0), 0)
)

// Get the low wines vessel or fermenting vessel as source for charges
const sourceVesselId = computed(() => {
  const lowWinesKey = STAGE_KEY_MAP['Low Wines']
  if (!lowWinesKey) return undefined
  return getStage(props.batch, lowWinesKey)?.vessel
})

const getRunIndex = (run: DistillingRun) => runs.value.indexOf(run)

const addingRun = ref(false)
const addRun = async () => {
  const chargeModal = overlay.create(LazyModalDistillingCharge)
  const result = await chargeModal.open({
    batchId: props.batch._id,
    sourceVesselId: sourceVesselId.value,
    defaultRunType: 'spirit' as const,
    isFirstRun: false,
    forceRunType: true,
  })

  if (!result) return

  addingRun.value = true
  try {
    const { sourceVesselIds: sourceVessels, chargeEffectiveVolume, chargeEffectiveVolumeUnit } = await applyChargeResult({
      batchId: props.batch._id,
      stage: 'Spirit Run',
      result,
      currentStageVessel: stage.value?.vessel,
    })

    const newRun: DistillingRun = {
      runType: 'spirit',
      date: new Date(),
      chargeVolume: result.chargeVolume,
      chargeVolumeUnit: result.chargeVolumeUnit,
      chargeAbv: result.chargeAbv,
      ...(typeof chargeEffectiveVolume === 'number' ? { chargeEffectiveVolume, chargeEffectiveVolumeUnit } : {}),
      chargeSourceVessel: sourceVessels[0] || '',
      chargeSourceVessels: sourceVessels,
      additions: result.additions.length > 0 ? result.additions : undefined,
      collected: {
        foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        lateHeads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      },
    }
    await batchStore.addSpiritRun(props.batch._id, newRun)
  } catch (error: unknown) {
    const toast = useToast()
    toast.add({
      title: 'Failed to add spirit run',
      description: getErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    addingRun.value = false
  }
}

const deleteRun = async (runIndex: number) => {
  await batchStore.deleteSpiritRun(props.batch._id, runIndex)
}

const savingStage = ref(false)
const saveStageFields = async () => {
  savingStage.value = true
  try {
    await batchStore.updateStageData(props.batch._id, 'Spirit Run', {
      vessel: localVessel.value || undefined,
      notes: localNotes.value || undefined,
    })
  } finally {
    savingStage.value = false
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-rose-500/30 p-5">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-flask-round" class="text-lg text-rose-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Spirit Run</h3>
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
        <div class="text-xs text-parchment/50">Spirit Runs</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-rose-400">
          {{ heartsTotalVolume > 0 ? heartsTotalVolume.toFixed(1) : '---' }}
          <span v-if="heartsTotalVolume > 0" class="text-sm font-normal text-parchment/50">{{ heartsTotalUnit === 'gallon' ? 'gal' : heartsTotalUnit }}</span>
        </div>
        <div class="text-xs text-parchment/50">Hearts</div>
      </div>
      <div class="bg-brown/10 rounded-lg p-3 text-center">
        <div class="text-xl font-bold text-rose-400">{{ totalProofGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/50">Proof Gallons</div>
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
        stage-key="spiritRun"
        @delete="deleteRun"
      />
    </div>

    <!-- Empty state -->
    <div v-if="runs.length === 0" class="text-center py-8 text-parchment/50 text-sm">
      No spirit runs recorded yet.
      <span v-if="editing">Use the button below to add a run.</span>
    </div>

    <!-- Add run button -->
    <div v-if="editing" class="flex gap-3 mt-4">
      <UButton
        icon="i-lucide-plus"
        variant="outline"
        color="primary"
        size="sm"
        :loading="addingRun"
        @click="addRun"
      >
        Add Spirit Run
      </UButton>
    </div>
  </div>
</template>
