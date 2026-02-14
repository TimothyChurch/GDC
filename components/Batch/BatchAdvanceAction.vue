<script setup lang="ts">
import type { Batch } from '~/types'

const props = defineProps<{
  batch: Batch
}>()

const emit = defineEmits<{ advanced: [] }>()

const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const productionStore = useProductionStore()

const currentIndex = computed(() =>
  BATCH_STAGES.findIndex((s) => s.name === props.batch.status)
)

const nextStage = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= BATCH_STAGES.length - 1) return null
  return BATCH_STAGES[currentIndex.value + 1]
})

const stageColorClasses = computed(() => {
  if (!nextStage.value) return ''
  switch (nextStage.value.color) {
    case 'orange': return 'bg-orange-500/15 text-orange-400 border-orange-500/25 hover:bg-orange-500/25'
    case 'yellow': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25'
    case 'copper': return 'bg-copper/15 text-copper border-copper/25 hover:bg-copper/25'
    case 'purple': return 'bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25'
    case 'amber': return 'bg-amber/15 text-amber border-amber/25 hover:bg-amber/25'
    case 'green': return 'bg-green-500/15 text-green-400 border-green-500/25 hover:bg-green-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
})

const showModal = ref(false)
const selectedVessel = ref('')
const selectedProduction = ref('')
const advancing = ref(false)

const vesselOptions = computed(() => {
  if (!nextStage.value) return []
  switch (nextStage.value.name) {
    case 'Brewing':
      return vesselStore.mashTuns.map((v) => ({ label: v.name, value: v._id }))
    case 'Fermenting':
      return vesselStore.fermenters.map((v) => ({ label: v.name, value: v._id }))
    case 'Distilling':
      return vesselStore.stills.map((v) => ({ label: v.name, value: v._id }))
    case 'Storage':
      return vesselStore.tanks.map((v) => ({ label: v.name, value: v._id }))
    case 'Barreled':
      return vesselStore.barrels.map((v) => ({ label: v.name, value: v._id }))
    default:
      return []
  }
})

const productionOptions = computed(() =>
  productionStore.productions.map((p) => ({
    label: `${new Date(p.date).toLocaleDateString()} - ${p.quantity} bottles`,
    value: p._id,
  }))
)

const needsVessel = computed(() =>
  nextStage.value && ['Brewing', 'Fermenting', 'Distilling', 'Storage', 'Barreled'].includes(nextStage.value.name)
)

const needsProduction = computed(() =>
  nextStage.value?.name === 'Bottled'
)

const advance = async () => {
  if (!nextStage.value) return
  advancing.value = true
  try {
    const stageName = nextStage.value.name

    if (stageName === 'Brewing') {
      await batchStore.startBrewing(props.batch._id, selectedVessel.value)
    } else if (stageName === 'Bottled') {
      const target = batchStore.getBatchById(props.batch._id)
      if (target) {
        target.status = 'Bottled'
        target.bottled = { productionRecord: selectedProduction.value || undefined }
        batchStore.batch = target
        await batchStore.updateBatch()
      }
    } else {
      // For Fermenting, Distilling, Storage, Barreled — transfer vessel contents and advance
      const currentVessel = getCurrentVesselId()
      if (currentVessel && selectedVessel.value) {
        await vesselStore.fullTransfer(currentVessel, selectedVessel.value)
      }
      await batchStore.advanceBatchStatus(props.batch._id, stageName, {
        vessel: selectedVessel.value,
        date: new Date(),
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
  const status = props.batch.status
  switch (status) {
    case 'Brewing': return props.batch.brewing?.vessel
    case 'Fermenting': return props.batch.fermenting?.vessel
    case 'Distilling': return props.batch.distilling?.vessel
    case 'Storage': return props.batch.distilling?.collected?.hearts?.vessel
    case 'Barreled': return props.batch.barreled?.vessel
    default: return undefined
  }
}
</script>

<template>
  <div v-if="nextStage">
    <UButton
      :icon="nextStage.icon"
      :class="['border font-semibold', stageColorClasses]"
      size="lg"
      variant="ghost"
      @click="showModal = true"
    >
      Advance to {{ nextStage.name }}
    </UButton>

    <UModal v-model:open="showModal">
      <template #content>
        <div class="p-5">
          <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
            Advance to {{ nextStage.name }}
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
