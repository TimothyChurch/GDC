<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { LazyPanelBatch } from '#components'
import { ALL_STAGES, STAGE_DISPLAY, stageTextColor, stageBgColor } from '~/composables/batchPipeline'

definePageMeta({ layout: 'admin' })

const batchStore = useBatchStore()

const viewMode = useLocalStorage('batch-view-mode', 'table')

const selectedFilter = ref('All')

watch(selectedFilter, (next) => {
  if (next === 'Completed' && viewMode.value === 'board') viewMode.value = 'table'
})

// Stages that accumulate over time and aren't actively worked — hidden from
// the batch index. Still reachable from the batch detail page.
const HIDDEN_STAGES = new Set(['Barrel Aging', 'Bottled'])

// Filter options: All, Active, Completed, then individual stages that have batches
const filterTabs = computed(() => {
  const tabs: { name: string; count: number; type: 'status' | 'stage' }[] = [
    { name: 'All', count: batchStore.batches.length, type: 'status' },
    { name: 'Active', count: batchStore.batches.filter(b => b.status === 'active').length, type: 'status' },
    { name: 'Completed', count: batchStore.batches.filter(b => b.status === 'completed').length, type: 'status' },
  ]

  // Add stage-specific tabs for stages that have active batches (volume-aware)
  for (const stage of ALL_STAGES) {
    if (HIDDEN_STAGES.has(stage)) continue
    const count = batchStore.getBatchesInStage(stage).length
    if (count > 0) {
      tabs.push({ name: stage, count, type: 'stage' })
    }
  }

  return tabs
})

const overlay = useOverlay()
const batchPanel = overlay.create(LazyPanelBatch)
const addBatch = async () => {
  batchStore.resetBatch()
  await batchPanel.open()
}

const filteredBatches = computed(() => {
  if (selectedFilter.value === 'All') return undefined
  if (selectedFilter.value === 'Active') return batchStore.batches.filter(b => b.status === 'active')
  if (selectedFilter.value === 'Completed') return batchStore.batches.filter(b => b.status === 'completed')
  // Stage filter (volume-aware)
  return batchStore.getBatchesInStage(selectedFilter.value)
})
</script>

<template>
  <div>
    <AdminPageHeader title="Batches" subtitle="Manage batch lifecycle from mashing to bottling" icon="i-lucide-flask-conical">
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          variant="solid"
          class="bg-gold/90 text-charcoal hover:bg-gold"
          @click="addBatch"
        >
          New Batch
        </UButton>
        <div class="flex items-center gap-1 rounded-lg border border-brown/20 p-0.5">
          <UButton
            icon="i-lucide-table-2"
            size="xs"
            square
            :variant="viewMode === 'table' ? 'soft' : 'ghost'"
            :color="viewMode === 'table' ? 'primary' : 'neutral'"
            :class="viewMode === 'table' ? 'bg-brown/30 text-gold' : 'text-parchment/60 hover:text-parchment/70'"
            title="Table view"
            @click="viewMode = 'table'"
          />
          <UButton
            icon="i-lucide-kanban"
            size="xs"
            square
            :variant="viewMode === 'board' ? 'soft' : 'ghost'"
            :color="viewMode === 'board' ? 'primary' : 'neutral'"
            :class="viewMode === 'board' ? 'bg-brown/30 text-gold' : 'text-parchment/60 hover:text-parchment/70'"
            title="Board view"
            @click="viewMode = 'board'"
          />
        </div>
      </template>
    </AdminPageHeader>

    <div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide">
      <UButton
        v-for="tab in filterTabs"
        :key="tab.name"
        size="xs"
        :variant="selectedFilter === tab.name ? 'soft' : 'ghost'"
        :color="selectedFilter === tab.name ? 'primary' : 'neutral'"
        class="rounded-full whitespace-nowrap"
        :class="selectedFilter === tab.name
          ? 'bg-gold/15 text-gold border border-gold/20'
          : 'text-parchment/50 border border-brown/20 hover:text-parchment/70 hover:border-brown/30'"
        @click="selectedFilter = tab.name"
      >
        {{ tab.name }}
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="selectedFilter === tab.name ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
        >
          {{ tab.count }}
        </span>
      </UButton>
    </div>

    <TableBatches v-if="viewMode === 'table'" :data="filteredBatches" />
    <BatchKanban v-else :data="filteredBatches" />
  </div>
</template>
