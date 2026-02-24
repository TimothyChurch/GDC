<script setup lang="ts">
import { STAGE_DISPLAY, STAGE_VESSEL_TYPE, stageTextColor } from '~/composables/batchPipeline'

const batchStore = useBatchStore();
const vesselStore = useVesselStore();

// Get vessel options for a batch's first pipeline stage
const getVesselOptions = (batch: any) => {
  const firstStage = batch.pipeline?.[0]
  if (!firstStage) return []
  const vesselType = STAGE_VESSEL_TYPE[firstStage]
  if (!vesselType) return []
  switch (vesselType) {
    case 'Mash Tun': return vesselStore.mashTuns
    case 'Fermenter': return vesselStore.fermenters
    case 'Still': return vesselStore.stills
    case 'Tank': return vesselStore.tanks
    case 'Barrel': return vesselStore.barrels
    default: return []
  }
}

const getFirstStageLabel = (batch: any) => {
  const firstStage = batch.pipeline?.[0]
  if (!firstStage) return 'Start'
  return `Start ${firstStage}`
}

const getFirstStageDisplay = (batch: any) => {
  const firstStage = batch.pipeline?.[0]
  if (!firstStage) return STAGE_DISPLAY['Upcoming']
  return STAGE_DISPLAY[firstStage] || STAGE_DISPLAY['Upcoming']
}

const onStartFirstStage = async (batchId: string, vesselId: string) => {
  await batchStore.startFirstStage(batchId, vesselId);
};
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-calendar-clock" class="text-blue-400" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Upcoming</h3>
      <span v-if="batchStore.upcomingBatches.length > 0" class="text-xs text-parchment/50">
        ({{ batchStore.upcomingBatches.length }})
      </span>
    </div>
    <div v-if="batchStore.upcomingBatches.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No upcoming batches</p>
    </div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="batch in batchStore.upcomingBatches" :key="batch._id">
        <div class="flex flex-col items-center gap-2">
          <DashboardBatchCard :batchId="batch._id" />
          <UDropdownMenu
            :items="getVesselOptions(batch).map((v: any) => ({ label: v.name, _id: v._id, onSelect: () => onStartFirstStage(batch._id, v._id) }))"
          >
            <UButton
              size="sm"
              :class="[
                'text-xs border',
                `bg-${getFirstStageDisplay(batch).color === 'copper' ? 'copper' : getFirstStageDisplay(batch).color + '-500'}/15`,
                stageTextColor(getFirstStageDisplay(batch).color),
                `border-${getFirstStageDisplay(batch).color === 'copper' ? 'copper' : getFirstStageDisplay(batch).color + '-500'}/25`,
              ]"
            >
              {{ getFirstStageLabel(batch) }}
            </UButton>
          </UDropdownMenu>
        </div>
      </div>
    </div>
  </div>
</template>
