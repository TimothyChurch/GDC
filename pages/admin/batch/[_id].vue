<script setup lang="ts">
import { STAGE_KEY_MAP, hasReachedStage as _hasReached, isCurrentStage as _isCurrent, isStageActive, hasStageVolumes, getNextStageForActive, getActiveStages } from '~/composables/batchPipeline'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const vesselStore = useVesselStore()

const batch = computed(() => batchStore.getBatchById(route.params._id as string))
const recipe = computed(() => batch.value?.recipe ? recipeStore.getRecipeById(batch.value.recipe) : undefined)

const containingVessels = computed(() => {
  if (!batch.value?._id) return []
  return vesselStore.vessels.filter(v =>
    v.contents?.some(c => c.batch === batch.value!._id)
  )
})

// Panel slide-over for editing
import { LazyPanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(LazyPanelBatch)

const editBatch = () => {
  if (!batch.value) return
  batchStore.setBatch(batch.value._id)
  panel.open()
}

// Stage helpers using batch pipeline
const hasReached = (stageName: string) => {
  if (!batch.value) return false
  if (batch.value.currentStage === 'Upcoming' && !hasStageVolumes(batch.value)) return false
  // Volume-aware: stage has been reached if it has volume OR if currentStage has passed it
  if (hasStageVolumes(batch.value)) {
    return isStageActive(batch.value, stageName) || _hasReached(batch.value.pipeline, batch.value.currentStage, stageName)
  }
  return _hasReached(batch.value.pipeline, batch.value.currentStage, stageName)
}

// A stage is editable if it has volume > 0 (or is the current stage for legacy batches)
const isEditable = (stageName: string) => {
  if (!batch.value) return false
  if (hasStageVolumes(batch.value)) {
    return isStageActive(batch.value, stageName)
  }
  return _isCurrent(batch.value.currentStage, stageName)
}

// Stages that have volume and a valid next stage — returns { stage, pipelineIndex } for each
const advancableStages = computed(() => {
  if (!batch.value || batch.value.status !== 'active') return [] as { stage: string; pipelineIndex: number }[]
  const result: { stage: string; pipelineIndex: number }[] = []

  if (hasStageVolumes(batch.value)) {
    const active = getActiveStages(batch.value)
    for (const stage of active) {
      if (stage === 'Upcoming') {
        if (batch.value.pipeline.length > 0) result.push({ stage, pipelineIndex: -1 })
      } else {
        const { nextStage, activePipelineIndex } = getNextStageForActive(batch.value.pipeline, stage, batch.value.currentStage)
        if (nextStage) result.push({ stage, pipelineIndex: activePipelineIndex })
      }
    }
  } else {
    // Legacy: single advance button
    const { activePipelineIndex } = getNextStageForActive(batch.value.pipeline, batch.value.currentStage, batch.value.currentStage)
    result.push({ stage: batch.value.currentStage, pipelineIndex: activePipelineIndex })
  }

  return result
})

// Dynamic component map — use resolveComponent for runtime resolution of auto-imported components
const STAGE_COMPONENTS: Record<string, ReturnType<typeof resolveComponent>> = {
  'Mashing': resolveComponent('BatchMashing'),
  'Fermenting': resolveComponent('BatchFermenting'),
  'Distilling': resolveComponent('BatchDistilling'),
  'Maceration': resolveComponent('BatchMaceration'),
  'Filtering': resolveComponent('BatchFiltering'),
  'Barrel Aging': resolveComponent('BatchBarrelAging'),
  'Storage': resolveComponent('BatchStorage'),
  'Blending': resolveComponent('BatchBlending'),
  'Proofing': resolveComponent('BatchProofing'),
  'Bottled': resolveComponent('BatchBottled'),
}

// Stages rendered in reverse order (newest first), deduplicated by name
// (duplicate pipeline entries share stage data, so one card per unique stage)
const reversedReachedStages = computed(() => {
  if (!batch.value) return []
  const seen = new Set<string>()
  return [...batch.value.pipeline]
    .filter(s => {
      if (seen.has(s)) return false
      seen.add(s)
      return hasReached(s) && STAGE_COMPONENTS[s]
    })
    .reverse()
})

// Pipeline editor modal state
const pipelineEditorOpen = ref(false)

</script>

<template>
  <div v-if="!batchStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="batch" class="space-y-6">
    <AdminPageHeader
      :title="recipe?.name || 'Batch'"
      :subtitle="`${batch.batchSize} ${batch.batchSizeUnit} batch`"
      icon="i-lucide-flask-conical"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/batch')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editBatch"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <div class="flex items-center gap-3">
      <BatchStepper
        :pipeline="batch.pipeline"
        :current-stage="batch.currentStage"
        :stage-volumes="batch.stageVolumes"
        :batch-size-unit="batch.batchSizeUnit"
        class="flex-1"
      />
      <UButton
        v-if="batch.status === 'active'"
        icon="i-lucide-pencil-ruler"
        variant="outline"
        color="neutral"
        size="xs"
        @click="pipelineEditorOpen = true"
      >
        Edit Pipeline
      </UButton>
    </div>

    <UModal v-model:open="pipelineEditorOpen">
      <template #content>
        <BatchPipelineEditor
          :batch="batch"
          @saved="pipelineEditorOpen = false"
        />
      </template>
    </UModal>

    <BatchHeader :batch="batch" :recipe="recipe" />

    <!-- Upcoming advance action (no stage card for Upcoming) -->
    <div v-if="batch.status === 'active' && advancableStages.some(a => a.stage === 'Upcoming')" class="flex justify-center">
      <BatchAdvanceAction
        :batch="batch"
        source-stage="Upcoming"
        @advanced="() => {}"
      />
    </div>

    <!-- Current Vessels -->
    <div v-if="containingVessels.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Current Vessels</h3>
      <div class="divide-y divide-brown/20">
        <div
          v-for="vessel in containingVessels"
          :key="vessel._id"
          class="flex items-center justify-between py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/vessels/${vessel._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ vessel.name }}
          </NuxtLink>
          <span class="text-parchment/50 text-xs">{{ vessel.type }}</span>
        </div>
      </div>
    </div>

    <!-- Dynamic stage components — newest stage first, overview stays on top -->
    <template v-for="stage in reversedReachedStages" :key="stage">
      <component
        :is="STAGE_COMPONENTS[stage]"
        :batch="batch"
        :editing="isEditable(stage)"
      />
      <!-- Per-stage advance action directly below the card -->
      <template v-for="adv in advancableStages.filter(a => a.stage === stage)" :key="`adv-${adv.stage}-${adv.pipelineIndex}`">
        <div class="flex justify-center">
          <BatchAdvanceAction
            :batch="batch"
            :source-stage="adv.stage"
            :pipeline-index="adv.pipelineIndex"
            @advanced="() => {}"
          />
        </div>
      </template>
    </template>

    <!-- Tasting Notes (visible on all stages) -->
    <BatchTastingNotes :batch="batch" />

    <!-- Activity Log -->
    <BatchActivityLog :batch="batch" />
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Batch not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/batch')"
    >
      Back to Batches
    </UButton>
  </div>
</template>
