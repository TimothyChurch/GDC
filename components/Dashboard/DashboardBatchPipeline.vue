<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const toast = useToast();

interface PipelineStage {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  batches: any[];
}

const stages = computed<PipelineStage[]>(() => [
  {
    name: 'Upcoming',
    icon: 'i-lucide-calendar-clock',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-400',
    batches: batchStore.upcomingBatches,
  },
  {
    name: 'Brewing',
    icon: 'i-lucide-flame',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    dotColor: 'bg-orange-400',
    batches: batchStore.brewingBatches,
  },
  {
    name: 'Fermenting',
    icon: 'i-lucide-beaker',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    dotColor: 'bg-yellow-400',
    batches: batchStore.fermentingBatches,
  },
  {
    name: 'Distilling',
    icon: 'i-lucide-flask-conical',
    color: 'text-copper',
    bgColor: 'bg-copper/10',
    borderColor: 'border-copper/30',
    dotColor: 'bg-copper',
    batches: batchStore.distillingBatches,
  },
  {
    name: 'Storage',
    icon: 'i-lucide-warehouse',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-400',
    batches: batchStore.storedBatches,
  },
  {
    name: 'Barreled',
    icon: 'i-lucide-cylinder',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
    borderColor: 'border-amber/30',
    dotColor: 'bg-amber',
    batches: batchStore.barreledBatches,
  },
]);

const totalActiveBatches = computed(() =>
  stages.value.reduce((sum, stage) => sum + stage.batches.length, 0)
);

const getRecipeName = (recipeId: string) => {
  return recipeStore.getRecipeById(recipeId)?.name || 'Unknown';
};

// Drag-and-drop state
const dragBatchId = ref<string | null>(null)
const dragSourceStage = ref<string | null>(null)
const dropTargetStage = ref<string | null>(null)
const confirmOpen = ref(false)
const pendingDrop = ref<{ batchId: string; fromStage: string; toStage: string } | null>(null)
const advancing = ref(false)

const stageOrder = BATCH_STAGES.map(s => s.name)

function onDragStart(e: DragEvent, batchId: string, stageName: string) {
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
  if (!dragBatchId.value) return
  const fromIdx = stageOrder.indexOf(dragSourceStage.value || '')
  const toIdx = stageOrder.indexOf(stageName)
  if (toIdx === fromIdx + 1) {
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

  const fromIdx = stageOrder.indexOf(dragSourceStage.value)
  const toIdx = stageOrder.indexOf(stageName)

  if (toIdx === fromIdx + 1) {
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
    await batchStore.advanceBatchStatus(
      pendingDrop.value.batchId,
      pendingDrop.value.toStage,
      { date: new Date() }
    )
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
              ? `${stage.bgColor} ${stage.borderColor} hover:scale-[1.02]`
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
              stage.batches.length > 0 ? stage.color : 'text-parchment/50',
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
            class="flex items-center gap-1.5 cursor-grab active:cursor-grabbing rounded px-1 py-0.5 -mx-1 hover:bg-brown/20 transition-colors"
            draggable="true"
            @dragstart="onDragStart($event, batch._id, stage.name)"
            @dragend="onDragEnd"
          >
            <div :class="['w-1.5 h-1.5 rounded-full shrink-0', stage.dotColor]" />
            <span class="text-xs text-parchment/60 truncate">
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
