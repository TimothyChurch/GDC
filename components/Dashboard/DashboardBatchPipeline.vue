<script setup lang="ts">
import { ALL_STAGES, STAGE_DISPLAY, STAGE_KEY_MAP, stageTextColor, stageBgColor, getNextStage, getStageVolume, hasStageVolumes } from '~/composables/batchPipeline'
import { getBatchBorderClass } from '~/composables/useRecipeColors'

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const toast = useToast();

interface PipelineBatchEntry {
  _id: string;
  recipe: string;
  volume?: number;
  volumeUnit?: string;
}

interface PipelineStage {
  name: string;
  icon: string;
  color: string;
  batches: PipelineBatchEntry[];
}

// Build pipeline stages dynamically — volume-aware
const stages = computed<PipelineStage[]>(() => {
  const result: PipelineStage[] = [];
  for (const stageName of ALL_STAGES) {
    if (stageName === 'Bottled') continue; // Don't show Bottled in pipeline widget
    const display = STAGE_DISPLAY[stageName];
    const batches = batchStore.getBatchesInStage(stageName);
    const entries: PipelineBatchEntry[] = batches.map((b) => ({
      _id: b._id,
      recipe: b.recipe,
      volume: getStageVolume(b, stageName),
      volumeUnit: (b.batchSizeUnit || 'gallon').replace(/gallon/i, 'gal').replace(/liter/i, 'L'),
    }));
    // Always show Upcoming; show other stages only if they have batches
    if (stageName === 'Upcoming' || entries.length > 0) {
      result.push({
        name: stageName,
        icon: display?.icon || 'i-lucide-circle',
        color: display?.color || 'neutral',
        batches: entries,
      });
    }
  }
  return result;
});

// Count unique batch IDs across all stages
const totalActiveBatches = computed(() => {
  const ids = new Set<string>();
  for (const stage of stages.value) {
    for (const b of stage.batches) {
      ids.add(b._id);
    }
  }
  return ids.size;
});

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
const dropVolume = ref(0)

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
  const batch = batchStore.getBatchById(dragBatchId.value)
  if (!batch) return

  // Validate: the drop target must be the next stage after the drag source
  let expectedNext: string | null = null
  if (dragSourceStage.value === 'Upcoming') {
    expectedNext = batch.pipeline[0] || null
  } else {
    expectedNext = getNextStage(batch.pipeline, dragSourceStage.value)
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
  if (dragSourceStage.value === 'Upcoming') {
    expectedNext = batch.pipeline[0] || null
  } else {
    expectedNext = getNextStage(batch.pipeline, dragSourceStage.value)
  }

  if (expectedNext === stageName) {
    pendingDrop.value = {
      batchId: dragBatchId.value,
      fromStage: dragSourceStage.value,
      toStage: stageName,
    }
    // Initialize drop volume to full source stage volume
    dropVolume.value = getStageVolume(batch, dragSourceStage.value)
    confirmOpen.value = true
  }

  dragBatchId.value = null
  dragSourceStage.value = null
  dropTargetStage.value = null
}

const pendingSourceVolume = computed(() => {
  if (!pendingDrop.value) return 0
  const batch = batchStore.getBatchById(pendingDrop.value.batchId)
  if (!batch) return 0
  return getStageVolume(batch, pendingDrop.value.fromStage)
})

const pendingVolumeUnit = computed(() => {
  if (!pendingDrop.value) return 'gal'
  const batch = batchStore.getBatchById(pendingDrop.value.batchId)
  return (batch?.batchSizeUnit || 'gallon').replace(/gallon/i, 'gal').replace(/liter/i, 'L')
})

async function confirmAdvance() {
  if (!pendingDrop.value) return
  advancing.value = true
  try {
    const { batchId, fromStage, toStage } = pendingDrop.value
    if (fromStage === 'Upcoming') {
      await batchStore.startFirstStage(batchId, '', dropVolume.value)
    } else {
      await batchStore.advanceToStage(batchId, toStage, undefined, dropVolume.value, fromStage)
    }
    toast.add({
      title: 'Batch advanced',
      description: `Transferred ${dropVolume.value} ${pendingVolumeUnit.value} to ${pendingDrop.value.toStage}`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  } catch (error: unknown) {
    toast.add({
      title: 'Failed to advance batch',
      description: getErrorMessage(error),
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

    <!-- Batch color legend -->
    <BatchRecipeLegend />

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
            v-for="entry in stage.batches.slice(0, 3)"
            :key="entry._id"
            :class="['flex items-center gap-1.5 cursor-grab active:cursor-grabbing rounded-r px-1 py-0.5 -mx-1 hover:bg-brown/20 hover:text-gold transition-colors border-l-4', getBatchBorderClass(entry._id)]"
            draggable="true"
            @dragstart="onDragStart($event, entry._id, stage.name)"
            @dragend="onDragEnd"
            @click="navigateToBatch(entry._id)"
          >
            <div :class="['w-1.5 h-1.5 rounded-full shrink-0', `bg-${stage.color === 'copper' ? 'copper' : stage.color + '-400'}`]" />
            <span class="text-xs text-parchment/60 truncate hover:text-gold transition-colors">
              {{ getRecipeName(entry.recipe) }}
              <span v-if="entry.volume" class="text-parchment/40">({{ entry.volume }}{{ entry.volumeUnit }})</span>
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

    <!-- Confirmation modal with volume input -->
    <UModal v-model:open="confirmOpen">
      <template #content>
        <div class="p-5 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
              <UIcon name="i-lucide-arrow-right" class="text-xl text-gold" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-parchment">Transfer Batch</h3>
              <p class="text-sm text-parchment/50">
                Move <span class="text-parchment font-medium">{{ pendingBatchName }}</span>
                from <span class="text-parchment/70">{{ pendingDrop?.fromStage }}</span>
                to <span class="text-gold font-medium">{{ pendingDrop?.toStage }}</span>
              </p>
            </div>
          </div>

          <!-- Volume input -->
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Transfer Volume</div>
            <div class="flex items-center gap-2">
              <UInput
                v-model.number="dropVolume"
                type="number"
                :min="1"
                :max="pendingSourceVolume"
                class="flex-1"
              />
              <span class="text-sm text-parchment/60 whitespace-nowrap">
                of {{ pendingSourceVolume }} {{ pendingVolumeUnit }}
              </span>
              <UButton
                size="xs"
                variant="outline"
                color="neutral"
                @click="dropVolume = pendingSourceVolume"
              >
                Max
              </UButton>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="cancelAdvance">Cancel</UButton>
            <UButton @click="confirmAdvance" :loading="advancing" :disabled="dropVolume <= 0">
              Transfer {{ dropVolume }} {{ pendingVolumeUnit }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
