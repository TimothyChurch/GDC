<script setup lang="ts">
import type { Batch } from '~/types'
import { getNextStage, STAGE_DISPLAY, STAGE_VESSEL_TYPE, STAGE_KEY_MAP, stageTextColor, stageBgColor } from '~/composables/batchPipeline'

const props = defineProps<{
  batch: Batch
}>()

const emit = defineEmits<{ advanced: [] }>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const productionStore = useProductionStore()

const nextStage = computed(() => {
  if (props.batch.currentStage === 'Upcoming') {
    // First pipeline stage
    return props.batch.pipeline[0] || null
  }
  return getNextStage(props.batch.pipeline, props.batch.currentStage)
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
const selectedProduction = ref('')
const advancing = ref(false)

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
    case 'Barrel': return vesselStore.barrels.map((v) => ({ label: v.name, value: v._id }))
    default: return []
  }
})

const productionOptions = computed(() =>
  productionStore.productions.map((p) => ({
    label: `${new Date(p.date).toLocaleDateString()} - ${p.quantity} bottles`,
    value: p._id,
  }))
)

const needsVessel = computed(() =>
  nextStage.value ? !!STAGE_VESSEL_TYPE[nextStage.value] : false
)

const needsProduction = computed(() =>
  nextStage.value === 'Bottled'
)

const advance = async () => {
  if (!nextStage.value) return
  advancing.value = true
  try {
    const stageName = nextStage.value

    if (props.batch.currentStage === 'Upcoming') {
      // Start first pipeline stage
      await batchStore.startFirstStage(props.batch._id, selectedVessel.value)
    } else {
      // Get current vessel for potential transfer
      const currentVessel = getCurrentVesselId()
      if (currentVessel && selectedVessel.value && currentVessel !== selectedVessel.value) {
        await vesselStore.fullTransfer(currentVessel, selectedVessel.value)
      }

      const stageData: { vessel?: string } = {}
      if (selectedVessel.value) stageData.vessel = selectedVessel.value

      await batchStore.advanceToStage(props.batch._id, stageName, stageData)
    }

    // If bottled, link production record
    if (stageName === 'Bottled' && selectedProduction.value) {
      await batchStore.updateStageData(props.batch._id, 'Bottled', {
        productionRecord: selectedProduction.value,
      })
    }

    showModal.value = false
    selectedVessel.value = ''
    selectedProduction.value = ''
    emit('advanced')
  } finally {
    advancing.value = false
  }
}

const getCurrentVesselId = (): string | undefined => {
  const stageKey = STAGE_KEY_MAP[props.batch.currentStage]
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
      @click="showModal = true"
    >
      Advance to {{ nextStage }}
    </UButton>

    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
            Advance to {{ nextStage }}
          </h3>

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

          <div v-if="needsProduction" class="mb-4">
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Link Production Record</div>
            <USelect
              v-model="selectedProduction"
              :items="productionOptions"
              value-key="value"
              label-key="label"
              placeholder="Choose a production record (optional)..."
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="outline" color="neutral" @click="showModal = false">Cancel</UButton>
            <UButton
              @click="advance"
              :loading="advancing"
              :disabled="needsVessel && !selectedVessel"
            >
              Confirm
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
