<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const batchStore = useBatchStore()

const selectedStatus = ref('All')

const statusTabs = computed(() => {
  const counts: Record<string, number> = { All: batchStore.batches.length }
  for (const stage of BATCH_STAGES) {
    counts[stage.name] = batchStore.batches.filter(b => b.status === stage.name).length
  }
  return [
    { name: 'All', count: counts.All },
    ...BATCH_STAGES.map(s => ({ name: s.name, count: counts[s.name] || 0 })),
  ]
})

const filteredBatches = computed(() => {
  if (selectedStatus.value === 'All') return undefined
  return batchStore.batches.filter(b => b.status === selectedStatus.value)
})
</script>

<template>
  <div>
    <AdminPageHeader title="Batches" subtitle="Manage batch lifecycle from brewing to bottling" icon="i-lucide-flask-conical" />

    <div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide">
      <button
        v-for="tab in statusTabs"
        :key="tab.name"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
        :class="selectedStatus === tab.name
          ? 'bg-gold/15 text-gold border-gold/20'
          : 'text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30'"
        @click="selectedStatus = tab.name"
      >
        {{ tab.name }}
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="selectedStatus === tab.name ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <TableBatches :data="filteredBatches" />
  </div>
</template>
