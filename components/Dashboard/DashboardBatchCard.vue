<script setup lang="ts">
import { STAGE_DISPLAY, stageTextColor, stageBgColor } from '~/composables/batchPipeline'

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const props = defineProps<{ batchId: string }>();

const batch = computed(() => batchStore.getBatchById(props.batchId));

const stageDisplay = computed(() => {
  if (!batch.value) return { icon: 'i-lucide-circle', color: 'neutral' }
  return STAGE_DISPLAY[batch.value.currentStage] || { icon: 'i-lucide-circle', color: 'neutral' }
});

const statusBadge = computed(() => {
  switch (batch.value?.status) {
    case 'active': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
});

const startDate = computed(() => {
  if (!batch.value?.createdAt) return null
  return new Date(batch.value.createdAt).toLocaleDateString()
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
        <span class="text-parchment/60">Stage</span>
        <span
          class="px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1"
          :class="stageBgColor(stageDisplay.color)"
        >
          <UIcon :name="stageDisplay.icon" :class="stageTextColor(stageDisplay.color)" class="text-xs" />
          {{ batch.currentStage }}
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
      <div v-if="startDate" class="flex justify-between">
        <span class="text-parchment/60">Created</span>
        <span class="text-parchment/70">{{ startDate }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
