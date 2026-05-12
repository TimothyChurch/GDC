<script setup lang="ts">
import { STAGE_DISPLAY } from '~/composables/batchPipeline'

const {
  stageFilter,
  typeFilter,
  attentionOnly,
  stagesPresent,
  typesPresent,
  counts,
} = useVesselBoard()

const resetAll = () => {
  stageFilter.value = 'all'
  typeFilter.value = 'all'
  attentionOnly.value = false
}

const hasActiveFilter = computed(() =>
  stageFilter.value !== 'all' || typeFilter.value !== 'all' || attentionOnly.value
)
</script>

<template>
  <div class="flex flex-col gap-3 mb-5">
    <!-- Type filter chips -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-[10px] uppercase tracking-widest text-parchment/40 mr-1">Type</span>
      <UButton
        v-for="t in typesPresent"
        :key="t"
        size="xs"
        :variant="typeFilter === t ? 'soft' : 'ghost'"
        :color="typeFilter === t ? 'primary' : 'neutral'"
        @click="typeFilter = t"
      >
        {{ t === 'all' ? 'All' : t }}
      </UButton>
    </div>

    <!-- Stage filter chips (only stages currently in use) -->
    <div v-if="stagesPresent.length > 0" class="flex flex-wrap items-center gap-2">
      <span class="text-[10px] uppercase tracking-widest text-parchment/40 mr-1">Stage</span>
      <UButton
        size="xs"
        :variant="stageFilter === 'all' ? 'soft' : 'ghost'"
        :color="stageFilter === 'all' ? 'primary' : 'neutral'"
        @click="stageFilter = 'all'"
      >
        All
      </UButton>
      <UButton
        v-for="stage in stagesPresent"
        :key="stage"
        size="xs"
        :variant="stageFilter === stage ? 'soft' : 'ghost'"
        :color="stageFilter === stage ? 'primary' : 'neutral'"
        :icon="STAGE_DISPLAY[stage]?.icon"
        @click="stageFilter = stage"
      >
        {{ stage }}
      </UButton>
    </div>

    <!-- Attention toggle + reset + counts -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        size="xs"
        :variant="attentionOnly ? 'soft' : 'ghost'"
        :color="attentionOnly ? 'error' : 'neutral'"
        icon="i-lucide-bell-ring"
        @click="attentionOnly = !attentionOnly"
      >
        {{ attentionOnly ? 'Showing attention only' : 'Needs attention' }}
        <span
          v-if="counts.needsAttention > 0"
          class="ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold"
        >
          {{ counts.needsAttention }}
        </span>
      </UButton>

      <UButton
        v-if="hasActiveFilter"
        size="xs"
        variant="ghost"
        color="neutral"
        icon="i-lucide-x"
        class="text-parchment/50 hover:text-parchment"
        @click="resetAll"
      >
        Reset filters
      </UButton>

      <span class="ml-auto text-xs text-parchment/40">
        Showing {{ counts.filtered }} of {{ counts.total }} vessels<span v-if="counts.inUse > 0"> · {{ counts.inUse }} in use</span>
      </span>
    </div>
  </div>
</template>
