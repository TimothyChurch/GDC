<script setup lang="ts">
import { getNextStage, STAGE_VESSEL_TYPE } from '~/composables/batchPipeline'

const batchStore = useBatchStore();
const vesselStore = useVesselStore();

// Get the next stage vessel options for a batch in a mash tun
const getNextVesselOptions = (batchId: string) => {
  const batch = batchStore.getBatchById(batchId)
  if (!batch) return []
  const next = getNextStage(batch.pipeline, batch.currentStage)
  if (!next) return []
  const vesselType = STAGE_VESSEL_TYPE[next]
  if (!vesselType) return []
  switch (vesselType) {
    case 'Fermenter': return vesselStore.fermenters
    case 'Still': return vesselStore.stills
    case 'Tank': return vesselStore.tanks
    default: return []
  }
}

const getNextStageLabel = (batchId: string) => {
  const batch = batchStore.getBatchById(batchId)
  if (!batch) return 'Advance'
  const next = getNextStage(batch.pipeline, batch.currentStage)
  return next ? `Move to ${next}` : 'Advance'
}

const advanceFromMashTun = async (mashTunId: string, targetVesselId: string) => {
  const mashTun = vesselStore.getVesselById(mashTunId);
  const batchIds = mashTun?.contents?.map((c) => c.batch) || [];

  await vesselStore.fullTransfer(mashTunId, targetVesselId);

  for (const batchId of batchIds) {
    const batch = batchStore.getBatchById(batchId)
    if (!batch) continue
    const next = getNextStage(batch.pipeline, batch.currentStage)
    if (next) {
      await batchStore.advanceToStage(batchId, next, { vessel: targetVesselId })
    }
  }
};
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-flame" class="text-orange-400" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Mashing</h3>
    </div>
    <div v-if="vesselStore.mashTuns.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No mash tuns configured</p>
    </div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="mashTun in vesselStore.mashTuns" :key="mashTun._id">
        <div class="rounded-lg border border-brown/20 bg-brown/10 p-3">
          <div class="text-xs font-semibold text-parchment/60 mb-2">{{ mashTun.name }}</div>
          <div v-if="!mashTun.contents || mashTun.contents.length === 0" class="text-xs text-parchment/25">
            Empty
          </div>
          <div v-for="content in mashTun.contents" :key="content.batch">
            <div class="flex flex-col gap-2 items-center">
              <DashboardBatchCard :batchId="content.batch" />
              <UDropdown :items="[getNextVesselOptions(content.batch).map((v: any) => ({ label: v.name, value: v._id }))]">
                <UButton size="sm" class="bg-orange-500/15 text-orange-400 border border-orange-500/25 hover:bg-orange-500/25 text-xs">
                  {{ getNextStageLabel(content.batch) }}
                </UButton>
                <template #item="{ item }">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    class="w-full text-xs"
                    @click="advanceFromMashTun(mashTun._id, item.value)"
                  >{{ item.label }}</UButton>
                </template>
              </UDropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
