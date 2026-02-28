<script setup lang="ts">
import type { Bottle } from '~/types'

const props = defineProps<{ bottles: Bottle[] }>()
const bottleStore = useBottleStore()
</script>

<template>
  <div v-if="bottleStore.loading" class="text-center py-12">
    <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
    <p class="text-sm text-parchment/50">Loading bottles...</p>
  </div>

  <BaseEmptyState v-else-if="props.bottles.length === 0" icon="i-lucide-wine" title="No bottles match the current filters" description="Try adjusting your search or filters" />

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    <BottleCard
      v-for="bottle in props.bottles"
      :key="bottle._id"
      :bottle="bottle"
    />
  </div>
</template>
