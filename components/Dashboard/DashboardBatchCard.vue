<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const props = defineProps<{ batchId: string }>();

const batch = computed(() => batchStore.getBatchById(props.batchId));

const statusColor = computed(() => {
  switch (batch.value?.status) {
    case 'Upcoming': return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
    case 'Brewing': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
    case 'Fermenting': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25';
    case 'Distilling': return 'bg-copper/15 text-copper border-copper/25';
    case 'Storage': return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
    case 'Barreled': return 'bg-amber/15 text-amber border-amber/25';
    case 'Bottled': return 'bg-green-500/15 text-green-400 border-green-500/25';
    default: return 'bg-brown/15 text-parchment/50 border-brown/25';
  }
});
</script>

<template>
  <NuxtLink
    v-if="batch"
    :to="`/admin/batch/${batch._id}`"
    class="block w-full rounded-lg border border-brown/25 bg-brown/15 p-3 hover:border-gold/40 hover:bg-brown/25 transition-all duration-200 cursor-pointer group"
  >
    <div class="text-sm font-medium text-parchment mb-2 group-hover:text-gold transition-colors duration-200">
      {{ recipeStore.getRecipeById(batch?.recipe)?.name || 'Unknown Recipe' }}
    </div>
    <div class="flex flex-col gap-1.5 text-xs">
      <div class="flex justify-between items-center">
        <span class="text-parchment/60">Status</span>
        <span :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusColor]">
          {{ batch.status }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-parchment/60">Size</span>
        <span class="text-parchment/70">{{ batch.batchSize }} {{ batch.batchSizeUnit }}</span>
      </div>
      <div v-if="batch.batchCost" class="flex justify-between">
        <span class="text-parchment/60">Cost</span>
        <span class="text-parchment/70">{{ Dollar.format(batch.batchCost) }}</span>
      </div>
      <div v-if="batch.brewing?.date" class="flex justify-between">
        <span class="text-parchment/60">Brew Date</span>
        <span class="text-parchment/70">{{ new Date(batch.brewing.date).toLocaleDateString() }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
