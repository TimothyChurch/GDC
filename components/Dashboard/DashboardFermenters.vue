<script setup lang="ts">
import { getNextStage, STAGE_VESSEL_TYPE } from '~/composables/batchPipeline'

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

// Get next vessel options for a batch in a fermenter
const getNextVesselOptions = (batchId: string) => {
  const batch = batchStore.getBatchById(batchId)
  if (!batch) return []
  const next = getNextStage(batch.pipeline, batch.currentStage)
  if (!next) return []
  const vesselType = STAGE_VESSEL_TYPE[next]
  if (!vesselType) return []
  switch (vesselType) {
    case 'Still': return vesselStore.stills
    case 'Tank': return vesselStore.tanks
    case 'Barrel': return vesselStore.barrels
    default: return []
  }
}

const getNextStageLabel = (batchId: string) => {
  const batch = batchStore.getBatchById(batchId)
  if (!batch) return 'Advance'
  const next = getNextStage(batch.pipeline, batch.currentStage)
  return next ? `Start ${next}` : 'Advance'
}

const advanceFromFermenter = async (fermenterId: string, targetVesselId: string) => {
  const fermenter = vesselStore.getVesselById(fermenterId);
  const batchIds = fermenter?.contents?.map((c) => c.batch) || [];

  await vesselStore.fullTransfer(fermenterId, targetVesselId);

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
      <UIcon name="i-lucide-beaker" class="text-yellow-400" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Fermenting</h3>
    </div>
    <div v-if="vesselStore.fermenters.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No fermenters configured</p>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div v-for="fermenter in vesselStore.fermenters" :key="fermenter._id">
        <div class="rounded-lg border border-brown/20 bg-brown/10 p-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold text-parchment/60">{{ fermenter.name }}</span>
            <span class="text-[10px] text-copper truncate ml-2">
              {{
                recipeStore.getRecipeById(
                  batchStore.getBatchById(fermenter.contents?.[0]?.batch)?.recipe
                )?.name
              }}
            </span>
          </div>
          <div v-if="!fermenter.contents || fermenter.contents.length === 0" class="text-xs text-parchment/25">
            Empty
          </div>
          <div v-else class="flex flex-col gap-2 items-center">
            <div v-for="content in fermenter.contents" :key="content.batch" class="text-xs text-parchment/50">
              <span>{{ content.volume }} {{ content.volumeUnit }}</span>
            </div>
            <UDropdown :items="[getNextVesselOptions(fermenter.contents[0]?.batch || '').map((v: any) => ({ label: v.name, value: v._id }))]">
              <UButton size="sm" class="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/25 text-xs">
                {{ getNextStageLabel(fermenter.contents[0]?.batch || '') }}
              </UButton>
              <template #item="{ item }">
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  class="w-full text-xs"
                  @click="advanceFromFermenter(fermenter._id, item.value)"
                >{{ item.label }}</UButton>
              </template>
            </UDropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
