<script setup lang="ts">
import type { Batch, Recipe } from '~/types'

const props = defineProps<{
  batch: Batch
  recipe?: Recipe
}>()

const statusColor = computed(() => {
  switch (props.batch.status) {
    case 'Upcoming': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'Brewing': return 'bg-orange-500/15 text-orange-400 border-orange-500/25'
    case 'Fermenting': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25'
    case 'Distilling': return 'bg-copper/15 text-copper border-copper/25'
    case 'Storage': return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    case 'Barreled': return 'bg-amber/15 text-amber border-amber/25'
    case 'Bottled': return 'bg-green-500/15 text-green-400 border-green-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
})

const batchCostDisplay = computed(() => {
  if (props.batch.batchCost) return Dollar.format(props.batch.batchCost)
  return Dollar.format(0)
})

const recipeCostDisplay = computed(() => {
  if (props.batch.recipeCost) return Dollar.format(props.batch.recipeCost)
  if (props.recipe) return Dollar.format(recipePrice(props.recipe))
  return Dollar.format(0)
})
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond]">
          {{ recipe?.name || 'Unknown Recipe' }}
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <span v-if="recipe?.class" class="text-sm text-parchment/60">{{ recipe.class }}</span>
          <span v-if="recipe?.class && recipe?.type" class="text-parchment/50">-</span>
          <span v-if="recipe?.type" class="text-sm text-parchment/60">{{ recipe.type }}</span>
        </div>
      </div>
      <span :class="['px-3 py-1 rounded-full text-xs font-semibold border shrink-0', statusColor]">
        {{ batch.status }}
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-brown/20">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch Size</div>
        <div class="text-sm text-parchment font-medium">
          {{ batch.batchSize }} {{ batch.batchSizeUnit }}
        </div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Recipe Cost</div>
        <div class="text-sm text-parchment font-medium">{{ recipeCostDisplay }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch Cost</div>
        <div class="text-sm text-parchment font-medium">{{ batchCostDisplay }}</div>
      </div>
    </div>
  </div>
</template>
