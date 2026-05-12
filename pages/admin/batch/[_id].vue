<script setup lang="ts">
import { STAGE_KEY_MAP, getStageVolume } from '~/composables/batchPipeline'
import { useLocalStorage } from '@vueuse/core'

definePageMeta({ layout: 'admin' })

// View preference (kanban summary vs stacked full cards), persisted per user in localStorage.
const viewMode = useLocalStorage<'stacked' | 'kanban'>('gdc:batch-detail-view', 'kanban')

const route = useRoute()
const router = useRouter()

const batchStore = useBatchStore()

// All read-only derivations for this batch live in the composable.
const batchId = computed(() => route.params._id as string)
const {
  batch,
  recipe,
  containingVessels,
  hasReached,
  canEdit,
  advancableStages,
  barrelAgingHasBarrels,
  canStepBack,
} = useBatchDetail(batchId)

// Panel slide-over for editing
import { LazyPanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(LazyPanelBatch)

const editBatch = () => {
  if (!batch.value) return
  batchStore.setBatch(batch.value._id)
  panel.open()
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

// Dynamic component map — use resolveComponent for runtime resolution of auto-imported components
const STAGE_COMPONENTS: Record<string, ReturnType<typeof resolveComponent>> = {
  'Mashing': resolveComponent('BatchMashing'),
  'Fermenting': resolveComponent('BatchFermenting'),
  'Stripping Run': resolveComponent('BatchStrippingRun'),
  'Low Wines': resolveComponent('BatchLowWines'),
  'Spirit Run': resolveComponent('BatchSpiritRun'),
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

// Template refs keyed by stage name. Vue calls setStageRef(stage, el) on mount/unmount.
const stageRefs = new Map<string, HTMLElement>()
function setStageRef(stage: string, el: unknown) {
  if (el instanceof HTMLElement) stageRefs.set(stage, el)
  else stageRefs.delete(stage)
}

// Clicking a kanban card switches to stacked view and scrolls to that stage's full card.
const focusStage = async (stage: string) => {
  viewMode.value = 'stacked'
  await nextTick()
  stageRefs.get(stage)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

    <!-- View toggle sits just under the page header (Back / Edit) so it
         doesn't clutter the pipeline row. -->
    <div class="flex justify-end">
      <UFieldGroup size="xs">
        <UButton
          :variant="viewMode === 'stacked' ? 'solid' : 'outline'"
          :color="viewMode === 'stacked' ? 'primary' : 'neutral'"
          icon="i-lucide-rows-3"
          @click="viewMode = 'stacked'"
        >
          Stacked
        </UButton>
        <UButton
          :variant="viewMode === 'kanban' ? 'solid' : 'outline'"
          :color="viewMode === 'kanban' ? 'primary' : 'neutral'"
          icon="i-lucide-columns-3"
          @click="viewMode = 'kanban'"
        >
          Kanban
        </UButton>
      </UFieldGroup>
    </div>

    <!-- Pipeline visual: the pencil button inside opens the pipeline editor. -->
    <BatchStepper
      :pipeline="batch.pipeline"
      :current-stage="batch.currentStage"
      :stage-volumes="batch.stageVolumes"
      :batch-size-unit="batch.batchSizeUnit"
      :editable="batch.status === 'active'"
      @edit="pipelineEditorOpen = true"
    />

    <UModal v-model:open="pipelineEditorOpen">
      <template #content>
        <BatchPipelineEditor
          :batch="batch"
          @saved="pipelineEditorOpen = false"
        />
      </template>
    </UModal>

    <!-- Summary + Current Vessels side-by-side. Vessels collapse to full-width below summary on smaller screens. -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <BatchHeader :batch="batch" :recipe="recipe" class="lg:col-span-2" />

      <div v-if="containingVessels.length > 0" class="bg-charcoal rounded-xl border border-brown/30 p-5 lg:col-span-1">
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
    </div>

    <!-- Phase 5 of UI overhaul — hero CTA when the batch hasn't started yet.
         The four Shortcut* buttons are hidden in this state since nothing has
         been moved into vessels yet. -->
    <BatchStartAction
      v-if="batch.status === 'active' && batch.currentStage === 'Upcoming'"
      :batch="batch"
    />

    <!-- Phase 6 — unified Transfer Action shortcuts. Routes through the new
         atomic Transfer engine. Hidden for Upcoming batches (use Start above). -->
    <div
      v-if="batch.status === 'active' && batch.currentStage !== 'Upcoming'"
      class="flex flex-wrap items-center gap-2 rounded-xl border border-brown/30 bg-charcoal/60 p-3"
    >
      <span class="text-xs uppercase tracking-wide text-parchment/50 mr-1">Transfer</span>
      <!-- Upcoming-side advance: only when there's still volume sitting in
           Upcoming (split batch with leftover Upcoming portion). -->
      <TransferShortcutAdvanceStage
        v-if="advancableStages.includes('Upcoming')"
        :batch="batch"
        source-stage="Upcoming"
      />
      <!-- Generic advance from the batch's currentStage. -->
      <TransferShortcutAdvanceStage :batch="batch" />
      <TransferShortcutWithinStageMove :batch="batch" />
      <TransferShortcutWithdraw :batch="batch" />
      <TransferShortcutDestroy :batch="batch" />
    </div>

    <!-- Kanban summary view: compact horizontal cards for active stages + next stage. -->
    <BatchStageKanban
      v-if="viewMode === 'kanban'"
      :batch="batch"
      :advancable-stages="advancableStages"
      :barrel-aging-has-barrels="barrelAgingHasBarrels"
      @select-stage="focusStage"
    />

    <!-- Recipe card (all pipelines) — sits below the kanban / stage list as
         secondary reference info. -->
    <BatchRecipeCard v-if="recipe" :recipe="recipe" :batch-size="batch.batchSize" :batch-size-unit="batch.batchSizeUnit" />

    <!-- Dynamic stage components — newest stage first, overview stays on top. Hidden in kanban view. -->
    <template v-if="viewMode === 'stacked'">
    <template v-for="stage in reversedReachedStages" :key="stage">
      <div :ref="(el) => setStageRef(stage, el)" class="relative scroll-mt-24">
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

        <!-- Advance forward (Barrel Aging handles its own advancement when barrels are linked).
             Terminal Storage offers a "Complete to Bulk Storage" finisher instead. -->
        <TransferShortcutAdvanceStage
          v-if="advancableStages.includes(stage) && (stage !== 'Barrel Aging' || !barrelAgingHasBarrels)"
          :batch="batch"
          :source-stage="stage"
        />
        <BatchCompleteToBulk
          v-else-if="stage === 'Storage' && !getNextStage(batch.pipeline, stage) && batch.status === 'active'"
          :batch="batch"
        />
      </div>
    </template>
    </template>

    <!-- Transfer ledger (Phase 6.8) — query-driven view of the new Transfer collection. -->
    <TransferHistory :batch="batch" />

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
