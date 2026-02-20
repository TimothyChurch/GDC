<script setup lang="ts">
import type { Batch, Recipe } from '~/types'
import { STAGE_DISPLAY, stageTextColor, stageBgColor } from '~/composables/batchPipeline'

const props = defineProps<{
  batch: Batch
  recipe?: Recipe
}>()

const stageDisplay = computed(() => {
  const d = STAGE_DISPLAY[props.batch.currentStage]
  return d || { icon: 'i-lucide-circle', color: 'neutral' }
})

const statusBadge = computed(() => {
  switch (props.batch.status) {
    case 'active': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
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
        <h2 class="text-2xl font-bold font-[Cormorant_Garamond]">
          <NuxtLink
            v-if="recipe?._id"
            :to="`/admin/recipes/${recipe._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ recipe.name }}
          </NuxtLink>
          <span v-else class="text-parchment">Unknown Recipe</span>
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <span v-if="recipe?.class" class="text-sm text-parchment/60">{{ recipe.class }}</span>
          <span v-if="recipe?.class && recipe?.type" class="text-parchment/50">-</span>
          <span v-if="recipe?.type" class="text-sm text-parchment/60">{{ recipe.type }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span :class="['px-3 py-1 rounded-full text-xs font-semibold border', statusBadge]">
          {{ batch.status }}
        </span>
        <span
          class="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1"
          :class="stageBgColor(stageDisplay.color)"
        >
          <UIcon :name="stageDisplay.icon" :class="stageTextColor(stageDisplay.color)" class="text-sm" />
          {{ batch.currentStage }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-brown/20">
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
      <div v-if="batch.batchNumber">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Batch #</div>
        <div class="text-sm text-parchment font-medium">{{ batch.batchNumber }}</div>
      </div>
    </div>
  </div>
</template>
