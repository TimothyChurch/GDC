<script setup lang="ts">
import type { Batch, DistillingRun } from '~/types'
import { getNextStage, STAGE_DISPLAY, STAGE_VESSEL_TYPE, STAGE_KEY_MAP, stageTextColor, stageBgColor, getStageVolume, getVesselRemainingCapacity } from '~/composables/batchPipeline'
import { LazyModalDistillingCharge, LazyPanelProduction } from '#components'
import { volumeUnits } from '~/utils/units'
import { convertUnitRatio } from '~/utils/conversions'

const props = defineProps<{
  batch: Batch
  sourceStage?: string
}>()

const emit = defineEmits<{ advanced: [] }>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const productionStore = useProductionStore()
const overlay = useOverlay()
const toast = useToast()

// Determine the effective source stage
const effectiveSource = computed(() => props.sourceStage || props.batch.currentStage)

const nextStage = computed(() => {
  if (effectiveSource.value === 'Upcoming') {
    return props.batch.pipeline[0] || null
  }
  return getNextStage(props.batch.pipeline, effectiveSource.value)
})

const nextDisplay = computed(() => {
  if (!nextStage.value) return null
  return STAGE_DISPLAY[nextStage.value] || { icon: 'i-lucide-circle', color: 'neutral' }
})

const stageColorClasses = computed(() => {
  if (!nextDisplay.value) return ''
  const color = nextDisplay.value.color
  const map: Record<string, string> = {
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25 hover:bg-orange-500/25',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25',
    copper: 'bg-copper/15 text-copper border-copper/25 hover:bg-copper/25',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25',
    sky: 'bg-sky-500/15 text-sky-400 border-sky-500/25 hover:bg-sky-500/25',
    amber: 'bg-amber-500/15 text-amber border-amber/25 hover:bg-amber/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25',
    pink: 'bg-pink-500/15 text-pink-400 border-pink-500/25 hover:bg-pink-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/25',
    green: 'bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/25',
  }
  return map[color] || 'bg-brown/15 text-parchment/50 border-brown/25'
})

const showModal = ref(false)
const selectedVessel = ref('')
const advancing = ref(false)
const outputAbv = ref(0)
const transferUnit = ref(props.batch.batchSizeUnit || 'gallon')

// Detect when advancing FROM distilling (output volume differs from input)
const isFromDistilling = computed(() => effectiveSource.value === 'Distilling')

// Volume tracking — sourceVolume is in batch's native unit, convert to transferUnit for display
const sourceVolumeRaw = computed(() => getStageVolume(props.batch, effectiveSource.value))
const batchUnit = computed(() => props.batch.batchSizeUnit || 'gallon')

const sourceVolume = computed(() =>
  sourceVolumeRaw.value * convertUnitRatio(batchUnit.value, transferUnit.value)
)

const vesselCapacity = computed(() => {
  if (!selectedVessel.value) return Infinity
  const vessel = vesselStore.getVesselById(selectedVessel.value)
  if (!vessel) return Infinity
  const rawCap = getVesselRemainingCapacity(vessel)
  const capUnit = vessel.stats?.volumeUnit || ''
  return rawCap * convertUnitRatio(capUnit, transferUnit.value)
})

const maxTransfer = computed(() => {
  const src = sourceVolume.value
  const cap = vesselCapacity.value
  return Math.min(src, cap === Infinity ? src : cap)
})

const transferVolume = ref(0)

// Reset transfer volume when modal opens
watch(showModal, (open) => {
  if (open) {
    if (isFromDistilling.value) {
      // Don't pre-fill — user specifies actual distillate output
      transferVolume.value = 0
      outputAbv.value = 0
    } else {
      transferVolume.value = maxTransfer.value
    }
  }
})

// Update transfer volume when vessel changes (capacity constraint)
watch(selectedVessel, () => {
  if (transferVolume.value > maxTransfer.value) {
    transferVolume.value = maxTransfer.value
  }
})

const volumeUnit = computed(() => {
  const unit = transferUnit.value
  return unit.replace(/gallon/i, 'gal').replace(/liter/i, 'L')
})

// Determine vessel options based on stage type
const vesselOptions = computed(() => {
  if (!nextStage.value) return []
  const vesselType = STAGE_VESSEL_TYPE[nextStage.value]
  if (!vesselType) return []
  switch (vesselType) {
    case 'Mash Tun': return vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }))
    case 'Fermenter': return vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }))
    case 'Still': return vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
    case 'Tank': return vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    case 'Barrel': return vesselStore.emptyBarrels.map((v) => ({ label: v.name, value: v._id }))
    default: return []
  }
})

const needsVessel = computed(() => {
  if (!nextStage.value) return false
  // Distilling uses charge modal instead of simple vessel select
  if (nextStage.value === 'Distilling') return false
  // Bottled stage doesn't need a vessel — it needs a production record
  if (nextStage.value === 'Bottled') return false
  return !!STAGE_VESSEL_TYPE[nextStage.value]
})

const isBottledAdvance = computed(() =>
  nextStage.value === 'Bottled'
)

const isDistillingAdvance = computed(() =>
  nextStage.value === 'Distilling'
)

const handleClick = async () => {
  if (isDistillingAdvance.value) {
    await advanceToDistilling()
  } else {
    showModal.value = true
  }
}

const advanceToDistilling = async () => {
  const sourceVesselId = getCurrentVesselId()

  const chargeModal = overlay.create(LazyModalDistillingCharge)
  const result = await chargeModal.open({
    batchId: props.batch._id,
    sourceVesselId,
    isFirstRun: true,
  })

  if (!result) return

  advancing.value = true
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

    // Advance batch stage with volume
    const vol = result.chargeVolume || sourceVolume.value
    await batchStore.advanceToStage(
      props.batch._id,
      'Distilling',
      { vessel: result.stillId },
      vol,
      effectiveSource.value,
    )

    // Create first distilling run with charge data
    const firstRun: DistillingRun = {
      runType: result.runType,
      date: new Date(),
      chargeVolume: result.chargeVolume,
      chargeVolumeUnit: result.chargeVolumeUnit,
      chargeAbv: result.chargeAbv,
      chargeSourceVessel: result.chargeSourceVessel,
      additions: result.additions.length > 0 ? result.additions : undefined,
    }
    if (result.runType === 'stripping') {
      firstRun.output = { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined, proofGallons: undefined }
    } else {
      firstRun.collected = {
        foreshots: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        heads: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        hearts: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
        tails: { vessel: '', volume: undefined, volumeUnit: 'gallon', abv: undefined },
      }
    }
    await batchStore.addDistillingRun(props.batch._id, firstRun)

    emit('advanced')
  } catch (error: unknown) {
    toast.add({
      title: 'Failed to advance to Distilling',
      description: getErrorMessage(error),
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    advancing.value = false
  }
}

/** Open the production panel pre-filled with batch data for the bottling run */
const openProductionPanel = async () => {
  // Gather vessel IDs that contain this batch
  const batchVesselIds = vesselStore.vessels
    .filter(v =>
      (v.type.toLowerCase() === 'barrel' || v.type.toLowerCase() === 'tank') &&
      v.contents?.some(c => c.batch === props.batch._id)
    )
    .map(v => v._id)

  // Reset the production store to a fresh new production, pre-filled with batch data
  productionStore.resetProduction()
  productionStore.production.date = new Date()
  productionStore.production.vessel = batchVesselIds

  // Open the production panel with batch linkage prefill
  const panel = overlay.create(LazyPanelProduction)
  const result = await panel.open({
    prefill: {
      batchId: props.batch._id,
      vessels: batchVesselIds,
      date: new Date(),
    },
  })

  // If a production ID was returned, the link was created successfully
  if (result && typeof result === 'string') {
    toast.add({
      title: 'Production linked to batch',
      description: 'The bottling run has been recorded and linked.',
      color: 'success',
      icon: 'i-lucide-link',
    })
  }

  emit('advanced')
}

const advance = async () => {
  if (!nextStage.value) return
  advancing.value = true
  try {
    const stageName = nextStage.value
    const vol = transferVolume.value
    // Convert transfer volume back to batch's native unit for stage tracking
    const volInBatchUnit = vol * convertUnitRatio(transferUnit.value, batchUnit.value)

    if (effectiveSource.value === 'Upcoming') {
      // Start first pipeline stage with volume
      await batchStore.startFirstStage(props.batch._id, selectedVessel.value, volInBatchUnit)
    } else if (isFromDistilling.value) {
      // Distilling output: empty the still, add distillate to destination
      const currentVessel = getCurrentVesselId()

      // Clear this batch's contents from the still (still is emptied)
      if (currentVessel) {
        const still = vesselStore.getVesselById(currentVessel)
        if (still) {
          still.contents = (still.contents || []).filter(c => c.batch !== props.batch._id)
          vesselStore.vessel = still
          await vesselStore.updateVessel()
        }
      }

      // Add distillate to destination vessel with user-specified volume and ABV
      if (selectedVessel.value) {
        await vesselStore.addContents(selectedVessel.value, {
          batch: props.batch._id,
          volume: vol,
          volumeUnit: transferUnit.value,
          abv: outputAbv.value,
          value: 0,
        })
      }

      // Advance stage: deduct ALL from distilling, add only output volume to destination
      const stageData: { vessel?: string } = {}
      if (selectedVessel.value) stageData.vessel = selectedVessel.value

      const sourceVolInBatchUnit = sourceVolumeRaw.value
      await batchStore.advanceToStage(
        props.batch._id,
        stageName,
        stageData,
        sourceVolInBatchUnit,    // Deduct full still charge from Distilling (in batch units)
        effectiveSource.value,
        volInBatchUnit,          // Only add distillate output to destination (in batch units)
      )
    } else {
      // Standard transfer
      const currentVessel = getCurrentVesselId()
      if (currentVessel && selectedVessel.value && currentVessel !== selectedVessel.value) {
        // Partial vessel transfer based on volume ratio
        await vesselStore.transferBatchContents(
          currentVessel,
          selectedVessel.value,
          props.batch._id,
          vol,
          transferUnit.value,
        )
      }

      const stageData: { vessel?: string } = {}
      if (selectedVessel.value) stageData.vessel = selectedVessel.value

      await batchStore.advanceToStage(props.batch._id, stageName, stageData, volInBatchUnit, effectiveSource.value)
    }

    showModal.value = false
    selectedVessel.value = ''

    // If advancing to Bottled, automatically open the production panel
    if (stageName === 'Bottled') {
      advancing.value = false
      await openProductionPanel()
      return
    }

    emit('advanced')
  } finally {
    advancing.value = false
  }
}

const getCurrentVesselId = (): string | undefined => {
  const stageKey = STAGE_KEY_MAP[effectiveSource.value]
  if (!stageKey) return undefined
  const stageData = (props.batch.stages as any)?.[stageKey]
  return stageData?.vessel
}
</script>

<template>
  <div v-if="nextStage && nextDisplay">
    <UButton
      :icon="nextDisplay.icon"
      :class="['border font-semibold', stageColorClasses]"
      size="lg"
      variant="ghost"
      :loading="advancing && isDistillingAdvance"
      @click="handleClick"
    >
      Transfer to {{ nextStage }}
      <span v-if="sourceStage" class="text-xs opacity-70 ml-1">(from {{ sourceStage }})</span>
    </UButton>

    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
            Transfer to {{ nextStage }}
          </h3>

          <!-- Bottled advance: simplified — just transfer volume, production panel opens after -->
          <div v-if="isBottledAdvance && !isFromDistilling" class="mb-4">
            <div class="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4">
              <UIcon name="i-lucide-info" class="text-green-400 shrink-0" />
              <span class="text-xs text-parchment/70">
                After transferring to Bottled, a production recording form will open automatically so you can capture the bottling details.
              </span>
            </div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Transfer Volume</div>
            <div class="flex items-center gap-2">
              <UInput
                v-model.number="transferVolume"
                type="number"
                :min="1"
                :max="maxTransfer"
                class="flex-1"
              />
              <USelect v-model="transferUnit" :items="volumeUnits" class="w-28" />
              <UButton
                size="xs"
                variant="outline"
                color="neutral"
                @click="transferVolume = maxTransfer"
              >
                Max
              </UButton>
            </div>
            <div class="text-xs text-parchment/50 mt-1">
              {{ sourceVolume.toFixed(1) }} {{ volumeUnit }} available
            </div>
          </div>

          <!-- Distilling output: volume + ABV -->
          <template v-else-if="isFromDistilling">
            <div v-if="isBottledAdvance" class="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 mb-4">
              <UIcon name="i-lucide-info" class="text-green-400 shrink-0" />
              <span class="text-xs text-parchment/70">
                After transferring, a production recording form will open automatically.
              </span>
            </div>
            <div class="mb-4">
              <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Distillate Output Volume</div>
              <div class="flex items-center gap-2">
                <UInput
                  v-model.number="transferVolume"
                  type="number"
                  :min="0"
                  :step="0.1"
                  class="flex-1"
                />
                <USelect v-model="transferUnit" :items="volumeUnits" class="w-28" />
              </div>
              <div class="text-xs text-parchment/50 mt-1">
                Still charge: {{ sourceVolume.toFixed(1) }} {{ volumeUnit }} (will be emptied)
              </div>
            </div>

            <div class="mb-4">
              <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Distillate ABV (%)</div>
              <UInput
                v-model.number="outputAbv"
                type="number"
                :min="0"
                :max="100"
                :step="0.1"
                placeholder="0.0"
              />
            </div>
          </template>

          <!-- Standard transfer volume (non-distilling, non-bottled) -->
          <template v-else>
            <div class="mb-4">
              <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Transfer Volume</div>
              <div class="flex items-center gap-2">
                <UInput
                  v-model.number="transferVolume"
                  type="number"
                  :min="1"
                  :max="maxTransfer"
                  class="flex-1"
                />
                <USelect v-model="transferUnit" :items="volumeUnits" class="w-28" />
                <UButton
                  size="xs"
                  variant="outline"
                  color="neutral"
                  @click="transferVolume = maxTransfer"
                >
                  Max
                </UButton>
              </div>
              <div class="text-xs text-parchment/50 mt-1">
                {{ sourceVolume.toFixed(1) }} {{ volumeUnit }} available
                <template v-if="selectedVessel && vesselCapacity !== Infinity">
                  &middot; {{ vesselCapacity.toFixed(0) }} {{ volumeUnit }} vessel capacity
                </template>
              </div>
            </div>
          </template>

          <div v-if="needsVessel" class="mb-4">
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Select Vessel</div>
            <USelect
              v-model="selectedVessel"
              :items="vesselOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose a vessel..."
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="outline" color="neutral" @click="showModal = false">Cancel</UButton>
            <UButton
              @click="advance"
              :loading="advancing"
              :disabled="(needsVessel && !selectedVessel) || transferVolume <= 0"
            >
              <template v-if="isBottledAdvance">
                Transfer {{ transferVolume }} {{ volumeUnit }} &amp; Record Bottling
              </template>
              <template v-else-if="isFromDistilling">
                Collect {{ transferVolume }} {{ volumeUnit }} to {{ nextStage }}
              </template>
              <template v-else>
                Transfer {{ transferVolume }} {{ volumeUnit }}
              </template>
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
