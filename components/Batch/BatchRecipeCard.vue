<script setup lang="ts">
import type { Recipe } from '~/types'
import { convertUnitRatio } from '~/utils/conversions'
import { formatVolume } from '~/utils/formatting'

const props = defineProps<{
  recipe: Recipe
  batchSize: number
  batchSizeUnit: string
}>()

const itemStore = useItemStore()
const bulkSpiritStore = useBulkSpiritStore()
const { ingredientCost } = useUnitConversion()

// Scale factor: batch volume ÷ recipe volume (unit-converted).
// E.g. recipe = 100 gal, batch = 400 gal → scale = 4.
const scale = computed(() => {
  if (!props.recipe.volume || props.recipe.volume <= 0) return 1
  const batchInRecipeUnit = props.batchSize * convertUnitRatio(props.batchSizeUnit, props.recipe.volumeUnit)
  return batchInRecipeUnit / props.recipe.volume
})

const ingredients = computed(() =>
  (props.recipe.items || []).map((ing) => {
    const item = itemStore.getItemById(ing._id)
    const price = latestPrice(ing._id)
    const adjusted = ing.amount * scale.value
    const cost = ingredientCost(price, adjusted, ing.unit, item?.inventoryUnit || ing.unit)
    return {
      id: ing._id,
      name: item?.name || 'Unknown',
      recipeAmount: ing.amount,
      adjustedAmount: adjusted,
      unit: ing.unit,
      cost,
    }
  })
)

const bulkSpirits = computed(() =>
  (props.recipe.bulkSpirits || []).map((bs) => {
    const spirit = bulkSpiritStore.getBulkSpiritById(bs.bulkSpirit)
    const adjusted = bs.volume * scale.value
    const cost = spirit && spirit.costPerProofGallon > 0
      ? bulkSpiritIngredientCost(adjusted, bs.volumeUnit, spirit)
      : 0
    return {
      id: bs.bulkSpirit,
      name: spirit?.name || 'Unknown Spirit',
      recipeVolume: bs.volume,
      adjustedVolume: adjusted,
      volumeUnit: bs.volumeUnit,
      cost,
    }
  })
)

const totalCost = computed(() => {
  const ingTotal = ingredients.value.reduce((s, i) => s + i.cost, 0)
  const bsTotal = bulkSpirits.value.reduce((s, b) => s + b.cost, 0)
  return ingTotal + bsTotal
})

const shortUnit = (u: string) => u.replace(/gallon/i, 'gal').replace(/liter/i, 'L')
const isScaled = computed(() => Math.abs(scale.value - 1) > 0.001)
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <!-- Header: recipe name, size, and link -->
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
        <NuxtLink
          :to="`/admin/recipes/${recipe._id}`"
          class="text-gold hover:text-copper transition-colors"
        >
          {{ recipe.name }}
        </NuxtLink>
      </h3>
      <NuxtLink
        :to="`/admin/recipes/${recipe._id}`"
        class="text-xs text-gold hover:text-copper transition-colors shrink-0"
      >
        View Full Recipe →
      </NuxtLink>
    </div>
    <div class="flex items-center gap-3 text-sm text-parchment/60 mb-4">
      <span>Recipe: {{ recipe.volume }} {{ shortUnit(recipe.volumeUnit) }}</span>
      <span v-if="isScaled" class="text-parchment/40">→</span>
      <span v-if="isScaled" class="text-parchment/80">
        Batch: {{ batchSize }} {{ shortUnit(batchSizeUnit) }}
        <span class="text-parchment/50">({{ scale.toFixed(2) }}×)</span>
      </span>
    </div>

    <!-- Ingredients -->
    <div v-if="ingredients.length > 0" class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Ingredients</div>

      <!-- Column headers -->
      <div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0 pb-1 text-[10px] text-parchment/40 uppercase tracking-wider">
        <span>Item</span>
        <span v-if="isScaled" class="text-right">Recipe</span>
        <span class="text-right">{{ isScaled ? 'Adjusted' : 'Amount' }}</span>
        <span class="text-right">Cost</span>
      </div>

      <div class="divide-y divide-brown/10">
        <div
          v-for="ing in ingredients"
          :key="ing.id"
          class="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 py-1.5 text-sm items-center"
        >
          <span class="text-parchment truncate">{{ ing.name }}</span>
          <span v-if="isScaled" class="text-parchment/40 text-right whitespace-nowrap">
            {{ formatVolume(ing.recipeAmount) }} {{ ing.unit }}
          </span>
          <span class="text-parchment/80 text-right whitespace-nowrap font-medium">
            {{ formatVolume(ing.adjustedAmount) }} {{ ing.unit }}
          </span>
          <span class="text-parchment/50 text-right whitespace-nowrap w-16">{{ Dollar.format(ing.cost) }}</span>
        </div>
      </div>
    </div>

    <!-- Base Spirits -->
    <div v-if="bulkSpirits.length > 0" class="mb-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Base Spirits</div>

      <div class="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0 pb-1 text-[10px] text-parchment/40 uppercase tracking-wider">
        <span>Spirit</span>
        <span v-if="isScaled" class="text-right">Recipe</span>
        <span class="text-right">{{ isScaled ? 'Adjusted' : 'Amount' }}</span>
        <span class="text-right">Cost</span>
      </div>

      <div class="divide-y divide-brown/10">
        <div
          v-for="bs in bulkSpirits"
          :key="bs.id"
          class="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 py-1.5 text-sm items-center"
        >
          <span class="text-parchment truncate">{{ bs.name }}</span>
          <span v-if="isScaled" class="text-parchment/40 text-right whitespace-nowrap">
            {{ formatVolume(bs.recipeVolume) }} {{ bs.volumeUnit }}
          </span>
          <span class="text-parchment/80 text-right whitespace-nowrap font-medium">
            {{ formatVolume(bs.adjustedVolume) }} {{ bs.volumeUnit }}
          </span>
          <span class="text-parchment/50 text-right whitespace-nowrap w-16">{{ Dollar.format(bs.cost) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="ingredients.length === 0 && bulkSpirits.length === 0" class="text-sm text-parchment/50 italic py-2">
      No ingredients listed.
    </div>

    <!-- Total -->
    <div class="flex items-center justify-between pt-3 border-t border-brown/20">
      <span class="text-xs text-parchment/60 uppercase tracking-wider">
        {{ isScaled ? 'Batch Recipe Cost' : 'Recipe Cost' }}
      </span>
      <span class="text-sm text-gold font-semibold">{{ Dollar.format(totalCost) }}</span>
    </div>
  </div>
</template>
