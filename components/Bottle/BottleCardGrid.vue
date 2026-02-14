<script setup lang="ts">
const bottleStore = useBottleStore()
</script>

<template>
  <div v-if="bottleStore.loading" class="text-center py-12">
    <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
    <p class="text-sm text-parchment/50">Loading bottles...</p>
  </div>

  <div v-else-if="bottleStore.bottles.length === 0" class="text-center py-12">
    <UIcon name="i-lucide-wine" class="text-2xl text-parchment/20 mx-auto mb-2" />
    <p class="text-sm text-parchment/50">No bottles found</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
    <BottleCard
      v-for="bottle in bottleStore.bottles"
      :key="bottle._id"
      :bottle="bottle"
    />
  </div>
</template>
