<script setup lang="ts">
import { STAGE_KEY_MAP, hasReachedStage as _hasReached, isStageActive, hasStageVolumes, getNextStage, getActiveStages, getPreviousStage } from '~/composables/batchPipeline'

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

// A stage can be edited if it has been reached (active or completed batches)
const canEdit = (stageName: string) => {
  if (!batch.value) return false
  if (batch.value.status !== 'active' && batch.value.status !== 'completed') return false
  return hasReached(stageName)
}

// Per-stage edit mode toggle
const editingStages = ref<Set<string>>(new Set())

const isEditing = (stageName: string) => editingStages.value.has(stageName)

const toggleEdit = (stageName: string) => {
  if (editingStages.value.has(stageName)) {
    editingStages.value.delete(stageName)
  } else {
    editingStages.value.add(stageName)
  }
}

// Stages that have volume and a valid next stage
const advancableStages = computed(() => {
  if (!batch.value || batch.value.status !== 'active') return [] as string[]
  const result: string[] = []

  if (hasStageVolumes(batch.value)) {
    const active = getActiveStages(batch.value)
    for (const stage of active) {
      if (stage === 'Upcoming') {
        if (batch.value.pipeline.length > 0) result.push(stage)
      } else {
        const next = getNextStage(batch.value.pipeline, stage)
        if (next) result.push(stage)
      }
    }
  } else {
    // Legacy: advance from currentStage if there's a next stage
    const next = batch.value.currentStage === 'Upcoming'
      ? batch.value.pipeline[0]
      : getNextStage(batch.value.pipeline, batch.value.currentStage)
    if (next) result.push(batch.value.currentStage)
  }

  // Include terminal Storage stages (no next stage but has volume)
  if (hasStageVolumes(batch.value)) {
    const active = getActiveStages(batch.value)
    for (const stage of active) {
      if (stage === 'Storage' && !getNextStage(batch.value.pipeline, stage) && !result.includes(stage)) {
        result.push(stage)
      }
    }
  }

  return result
})

// Barrel Aging handles its own advancement — but only when barrels actually contain this batch
const barrelAgingHasBarrels = computed(() => {
  if (!batch.value?._id) return false
  return vesselStore.vessels.some(v =>
    v.type === 'Barrel' && v.contents?.some(c => c.batch === batch.value!._id)
  )
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

// Stages rendered in reverse order (newest first)
const reversedReachedStages = computed(() => {
  if (!batch.value) return []
  return [...batch.value.pipeline]
    .filter(s => hasReached(s) && STAGE_COMPONENTS[s])
    .reverse()
})

// Pipeline editor modal state
const pipelineEditorOpen = ref(false)

// Step back functionality
const reverting = ref(false)
const confirmRevertStage = ref<string | null>(null)

const canStepBack = (stageName: string) => {
  if (!batch.value) return false
  if (batch.value.status !== 'active' && batch.value.status !== 'completed') return false
  if (!hasStageVolumes(batch.value)) return false
  if (!isStageActive(batch.value, stageName)) return false
  const prev = getPreviousStage(batch.value.pipeline, stageName)
  return !!prev
}

const stepBack = async (stageName: string) => {
  if (!batch.value) return
  reverting.value = true
  try {
    await batchStore.revertToPreviousStage(batch.value._id, stageName)
  } finally {
    reverting.value = false
    confirmRevertStage.value = null
  }
}

</script>

<template>
  <div v-if="!batchStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/50" />
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
    <div v-if="batch.status === 'active' && advancableStages.includes('Upcoming')" class="flex justify-center">
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
      <div class="relative">
        <!-- Edit toggle button -->
        <div v-if="canEdit(stage)" class="absolute top-4 right-4 z-10">
          <UButton
            :icon="isEditing(stage) ? 'i-lucide-x' : 'i-lucide-pencil'"
            size="xs"
            :variant="isEditing(stage) ? 'soft' : 'ghost'"
            :color="isEditing(stage) ? 'primary' : 'neutral'"
            @click="toggleEdit(stage)"
          >
            {{ isEditing(stage) ? 'Done' : 'Edit' }}
          </UButton>
        </div>

        <component
          :is="STAGE_COMPONENTS[stage]"
          :batch="batch"
          :editing="isEditing(stage)"
        />
      </div>

      <!-- Per-stage actions: advance forward or step back -->
      <div class="flex items-center justify-center gap-3">
        <!-- Step Back button -->
        <template v-if="canStepBack(stage)">
          <UButton
            v-if="confirmRevertStage !== stage"
            icon="i-lucide-undo-2"
            variant="ghost"
            color="neutral"
            size="sm"
            class="text-parchment/60 hover:text-orange-400"
            @click="confirmRevertStage = stage"
          >
            Step Back
          </UButton>
          <div v-else class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/5">
            <span class="text-xs text-orange-400">
              Revert to {{ getPreviousStage(batch!.pipeline, stage) }}?
            </span>
            <UButton
              size="xs"
              color="warning"
              :loading="reverting"
              @click="stepBack(stage)"
            >
              Confirm
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              @click="confirmRevertStage = null"
            >
              Cancel
            </UButton>
          </div>
        </template>

        <!-- Advance forward (Barrel Aging handles its own advancement when barrels are linked) -->
        <BatchAdvanceAction
          v-if="advancableStages.includes(stage) && (stage !== 'Barrel Aging' || !barrelAgingHasBarrels)"
          :batch="batch"
          :source-stage="stage"
          @advanced="() => {}"
        />
      </div>
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
