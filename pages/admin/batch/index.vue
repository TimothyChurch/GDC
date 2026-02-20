<script setup lang="ts">
import { ALL_STAGES, STAGE_DISPLAY, stageTextColor, stageBgColor } from '~/composables/batchPipeline'

definePageMeta({ layout: 'admin' })

const batchStore = useBatchStore()

const selectedFilter = ref('All')

// Filter options: All, Active, Completed, then individual stages that have batches
const filterTabs = computed(() => {
  const tabs: { name: string; count: number; type: 'status' | 'stage' }[] = [
    { name: 'All', count: batchStore.batches.length, type: 'status' },
    { name: 'Active', count: batchStore.batches.filter(b => b.status === 'active').length, type: 'status' },
    { name: 'Completed', count: batchStore.batches.filter(b => b.status === 'completed').length, type: 'status' },
  ]

  // Add stage-specific tabs for stages that have active batches
  for (const stage of ALL_STAGES) {
    const count = batchStore.getBatchesByCurrentStage(stage).length
    if (count > 0) {
      tabs.push({ name: stage, count, type: 'stage' })
    }
  }

  return tabs
})

const filteredBatches = computed(() => {
  if (selectedFilter.value === 'All') return undefined
  if (selectedFilter.value === 'Active') return batchStore.batches.filter(b => b.status === 'active')
  if (selectedFilter.value === 'Completed') return batchStore.batches.filter(b => b.status === 'completed')
  // Stage filter
  return batchStore.getBatchesByCurrentStage(selectedFilter.value)
})
</script>

<template>
  <div>
    <AdminPageHeader title="Batches" subtitle="Manage batch lifecycle from mashing to bottling" icon="i-lucide-flask-conical" />

    <div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide">
      <button
        v-for="tab in filterTabs"
        :key="tab.name"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
        :class="selectedFilter === tab.name
          ? 'bg-gold/15 text-gold border-gold/20'
          : 'text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30'"
        @click="selectedFilter = tab.name"
      >
        {{ tab.name }}
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="selectedFilter === tab.name ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <TableBatches :data="filteredBatches" />
  </div>
</template>
