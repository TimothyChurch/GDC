<script setup lang="ts">
import { ALL_STAGES, STAGE_DISPLAY, stageTextColor, stageBgColor } from '~/composables/batchPipeline'
import type { Batch } from '~/types'

const props = defineProps<{
  data?: Batch[]
}>()

const batchStore = useBatchStore()

const batchesSource = computed(() => props.data ?? batchStore.batches)

const columns = computed(() =>
  ALL_STAGES.map((stage) => {
    const display = STAGE_DISPLAY[stage] || { icon: 'i-lucide-circle', color: 'neutral' }
    const batches = batchesSource.value.filter((b) => b.currentStage === stage)
    return { stage, display, batches }
  })
)

const BORDER_TOP_MAP: Record<string, string> = {
  blue: 'border-t-blue-500', orange: 'border-t-orange-500', yellow: 'border-t-yellow-500',
  copper: 'border-t-amber-700', emerald: 'border-t-emerald-500', sky: 'border-t-sky-500',
  amber: 'border-t-amber-500', purple: 'border-t-purple-500', pink: 'border-t-pink-500',
  cyan: 'border-t-cyan-500', green: 'border-t-green-500',
}
</script>

<template>
  <div class="overflow-x-auto pb-4 -mx-2 px-2">
    <div class="flex gap-3" :style="{ minWidth: `${columns.length * 272}px` }">
      <div
        v-for="col in columns"
        :key="col.stage"
        class="flex-1 min-w-[260px] max-w-[320px] rounded-lg border border-brown/20 bg-charcoal/50 border-t-2"
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
        <div class="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
          <DashboardBatchCard
            v-for="batch in col.batches"
            :key="batch._id"
            :batch-id="batch._id"
          />

          <!-- Empty state -->
          <div v-if="!col.batches.length" class="flex flex-col items-center gap-1.5 py-6 text-parchment/30">
            <UIcon :name="col.display.icon" class="text-xl" />
            <span class="text-[11px]">No batches</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
