<script setup lang="ts">
import { ALL_STAGES, STAGE_DISPLAY, stageTextColor, stageBgColor, isStageActive, hasStageVolumes, getStageVolume } from '~/composables/batchPipeline'
import type { Batch } from '~/types'

const props = defineProps<{
  data?: Batch[]
}>()

const batchStore = useBatchStore()

const batchesSource = computed(() => props.data ?? batchStore.batches)

const allColumns = computed(() =>
  ALL_STAGES.map((stage) => {
    const display = STAGE_DISPLAY[stage] || { icon: 'i-lucide-circle', color: 'neutral' }
    // Volume-aware filtering: show batch in stage if it has volume there
    const batches = batchesSource.value.filter((b) => {
      if (hasStageVolumes(b)) return isStageActive(b, stage)
      return b.currentStage === stage
    })
    return { stage, display, batches }
  })
)

// Only show columns that have batches (no empty columns in wrapping layout)
const columns = computed(() =>
  allColumns.value.filter((col) => col.batches.length > 0)
)

const BORDER_TOP_MAP: Record<string, string> = {
  blue: 'border-t-blue-500', orange: 'border-t-orange-500', yellow: 'border-t-yellow-500',
  copper: 'border-t-amber-700', emerald: 'border-t-emerald-500', sky: 'border-t-sky-500',
  amber: 'border-t-amber-500', purple: 'border-t-purple-500', pink: 'border-t-pink-500',
  cyan: 'border-t-cyan-500', green: 'border-t-green-500',
}
</script>

<template>
  <div>
    <!-- Empty state when no batches at all -->
    <div v-if="columns.length === 0" class="text-center py-12 text-parchment/40">
      <UIcon name="i-lucide-kanban" class="text-3xl mb-2" />
      <p class="text-sm">No batches to display</p>
    </div>

    <div v-else>
    <!-- Batch color legend -->
    <BatchRecipeLegend :batches="batchesSource" />

    <!-- Wrapping grid of stage columns -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div
        v-for="col in columns"
        :key="col.stage"
        class="rounded-lg border border-brown/20 bg-charcoal/50 border-t-2"
        :class="BORDER_TOP_MAP[col.display.color] || 'border-t-brown/40'"
      >
        <!-- Column header -->
        <div class="flex items-center gap-2 px-3 py-2.5 border-b border-brown/15">
          <UIcon :name="col.display.icon" :class="stageTextColor(col.display.color)" class="text-base" />
          <span class="text-xs font-semibold text-parchment/80 truncate">{{ col.stage }}</span>
          <span
            v-if="col.batches.length"
            class="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            :class="stageBgColor(col.display.color)"
          >
            {{ col.batches.length }}
          </span>
        </div>

        <!-- Column body -->
        <div class="p-2 space-y-2">
          <DashboardBatchCard
            v-for="batch in col.batches"
            :key="batch._id"
            :batch-id="batch._id"
          />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
