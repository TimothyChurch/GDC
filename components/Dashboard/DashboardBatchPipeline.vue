<script setup lang="ts">
import { ALL_STAGES, STAGE_DISPLAY, STAGE_KEY_MAP, stageTextColor, stageBgColor, getNextStage } from '~/composables/batchPipeline'

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const toast = useToast();

interface PipelineStage {
  name: string;
  icon: string;
  color: string;
  batches: any[];
}

// Build pipeline stages dynamically — show all stages that have active batches,
// plus Upcoming (always). Order follows ALL_STAGES canonical order.
const stages = computed<PipelineStage[]>(() => {
  const result: PipelineStage[] = [];
  for (const stageName of ALL_STAGES) {
    if (stageName === 'Bottled') continue; // Don't show Bottled in pipeline widget
    const display = STAGE_DISPLAY[stageName];
    const batches = batchStore.getBatchesByCurrentStage(stageName);
    // Always show Upcoming; show other stages only if they have batches
    if (stageName === 'Upcoming' || batches.length > 0) {
      result.push({
        name: stageName,
        icon: display?.icon || 'i-lucide-circle',
        color: display?.color || 'neutral',
        batches,
      });
    }
  }
  return result;
});

const totalActiveBatches = computed(() =>
  stages.value.reduce((sum, stage) => sum + stage.batches.length, 0)
);

const getRecipeName = (recipeId: string) => {
  return recipeStore.getRecipeById(recipeId)?.name || 'Unknown';
};

// Track whether a drag occurred to prevent click navigation after dragging
const didDrag = ref(false)

function navigateToBatch(batchId: string) {
  if (didDrag.value) {
    didDrag.value = false;
    return;
  }
  navigateTo(`/admin/batch/${batchId}`);
}

// Drag-and-drop state
const dragBatchId = ref<string | null>(null)
const dragSourceStage = ref<string | null>(null)
const dropTargetStage = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDrop = ref<{ batchId: string; fromStage: string; toStage: string } | null>(null)
const advancing = ref(false)

function onDragStart(e: DragEvent, batchId: string, stageName: string) {
  didDrag.value = true
  dragBatchId.value = batchId
  dragSourceStage.value = stageName
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', batchId)
  }
}

function onDragEnd() {
  dragBatchId.value = null
  dragSourceStage.value = null
  dropTargetStage.value = null
}

function onDragOver(e: DragEvent, stageName: string) {
  if (!dragBatchId.value || !dragSourceStage.value) return
  // Validate: the drop target must be the next stage in the dragged batch's pipeline
  const batch = batchStore.getBatchById(dragBatchId.value)
  if (!batch) return

  let expectedNext: string | null = null
  if (batch.currentStage === 'Upcoming') {
    expectedNext = batch.pipeline[0] || null
  } else {
    expectedNext = getNextStage(batch.pipeline, batch.currentStage)
  }

  if (expectedNext === stageName) {
    e.preventDefault()
    dropTargetStage.value = stageName
  }
}

function onDragLeave(stageName: string) {
  if (dropTargetStage.value === stageName) {
    dropTargetStage.value = null
  }
}

function onDrop(e: DragEvent, stageName: string) {
  e.preventDefault()
  if (!dragBatchId.value || !dragSourceStage.value) return

  const batch = batchStore.getBatchById(dragBatchId.value)
  if (!batch) return

  let expectedNext: string | null = null
  if (batch.currentStage === 'Upcoming') {
    expectedNext = batch.pipeline[0] || null
  } else {
    expectedNext = getNextStage(batch.pipeline, batch.currentStage)
  }

  if (expectedNext === stageName) {
    pendingDrop.value = {
      batchId: dragBatchId.value,
      fromStage: dragSourceStage.value,
      toStage: stageName,
    }
    confirmOpen.value = true
  }

  dragBatchId.value = null
  dragSourceStage.value = null
  dropTargetStage.value = null
}

async function confirmAdvance() {
  if (!pendingDrop.value) return
  advancing.value = true
  try {
    const { batchId, fromStage, toStage } = pendingDrop.value
    if (fromStage === 'Upcoming') {
      await batchStore.startFirstStage(batchId, '')
    } else {
      await batchStore.advanceToStage(batchId, toStage)
    }
    toast.add({
      title: 'Batch advanced',
      description: `Moved to ${pendingDrop.value.toStage}`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (error: any) {
    toast.add({
      title: 'Failed to advance batch',
      description: error?.message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    advancing.value = false
    confirmOpen.value = false
    pendingDrop.value = null
  }
}

function cancelAdvance() {
  confirmOpen.value = false
  pendingDrop.value = null
}

const pendingBatchName = computed(() => {
  if (!pendingDrop.value) return ''
  const batch = batchStore.getBatchById(pendingDrop.value.batchId)
  return batch ? getRecipeName(batch.recipe) : 'Unknown'
})
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Batch Pipeline</h2>
        <p class="text-xs text-parchment/60 mt-0.5">
          {{ totalActiveBatches }} active {{ totalActiveBatches === 1 ? 'batch' : 'batches' }} across all stages
          <span class="hidden sm:inline text-parchment/25 ml-1">- drag batches to advance</span>
        </p>
      </div>
      <NuxtLink
        to="/admin/batch"
        class="text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      >
        View All
        <UIcon name="i-lucide-arrow-right" class="text-sm" />
      </NuxtLink>
    </div>

    <!-- Pipeline stages -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <div
        v-for="stage in stages"
        :key="stage.name"
        :class="[
          'rounded-lg border p-4 transition-all duration-200',
          dropTargetStage === stage.name
            ? 'ring-2 ring-gold/50 border-gold/40 bg-gold/5 scale-[1.02]'
            : stage.batches.length > 0
              ? `${stageBgColor(stage.color)} hover:scale-[1.02]`
              : 'bg-brown/10 border-brown/20',
        ]"
        @dragover="onDragOver($event, stage.name)"
        @dragleave="onDragLeave(stage.name)"
        @drop="onDrop($event, stage.name)"
      >
        <!-- Stage header -->
        <div class="flex items-center gap-2 mb-3">
          <UIcon
            :name="stage.icon"
            :class="[
              'text-lg',
              stage.batches.length > 0 ? stageTextColor(stage.color) : 'text-parchment/50',
            ]"
          />
          <span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">
            {{ stage.name }}
          </span>
        </div>

        <!-- Count -->
        <div
          :class="[
            'text-3xl font-bold font-[Cormorant_Garamond] mb-2',
            stage.batches.length > 0 ? 'text-parchment' : 'text-parchment/20',
          ]"
        >
          {{ stage.batches.length }}
        </div>

        <!-- Batch previews (draggable) -->
        <div v-if="stage.batches.length > 0" class="flex flex-col gap-1.5">
          <div
            v-for="batch in stage.batches.slice(0, 3)"
            :key="batch._id"
            class="flex items-center gap-1.5 cursor-grab active:cursor-grabbing rounded px-1 py-0.5 -mx-1 hover:bg-brown/20 hover:text-gold transition-colors"
            draggable="true"
            @dragstart="onDragStart($event, batch._id, stage.name)"
            @dragend="onDragEnd"
            @click="navigateToBatch(batch._id)"
          >
            <div :class="['w-1.5 h-1.5 rounded-full shrink-0', `bg-${stage.color === 'copper' ? 'copper' : stage.color + '-400'}`]" />
            <span class="text-xs text-parchment/60 truncate hover:text-gold transition-colors">
              {{ getRecipeName(batch.recipe) }}
            </span>
          </div>
          <span
            v-if="stage.batches.length > 3"
            class="text-[10px] text-parchment/50 pl-3"
          >
            +{{ stage.batches.length - 3 }} more
          </span>
        </div>
        <div v-else class="text-xs text-parchment/20">
          No batches
        </div>
      </div>
    </div>

    <!-- Confirmation modal -->
    <UModal v-model:open="confirmOpen">
      <template #content>
        <div class="p-5 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
              <UIcon name="i-lucide-arrow-right" class="text-xl text-gold" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-parchment">Advance Batch</h3>
              <p class="text-sm text-parchment/50">
                Move <span class="text-parchment font-medium">{{ pendingBatchName }}</span>
                from <span class="text-parchment/70">{{ pendingDrop?.fromStage }}</span>
                to <span class="text-gold font-medium">{{ pendingDrop?.toStage }}</span>?
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="cancelAdvance">Cancel</UButton>
            <UButton @click="confirmAdvance" :loading="advancing">Advance</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
