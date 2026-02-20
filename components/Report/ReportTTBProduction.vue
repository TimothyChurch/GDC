<script setup lang="ts">
import type { Batch, Recipe } from '~/types'
import { calculateProofGallons, toGallons } from '~/utils/proofGallons'

const props = defineProps<{
  month: string // 'YYYY-MM' format
}>()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const itemStore = useItemStore()

// Parse month range
const monthStart = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return new Date(y, m - 1, 1)
})
const monthEnd = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return new Date(y, m, 0, 23, 59, 59) // last day of month
})

const monthLabel = computed(() =>
  monthStart.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

// Batches distilled during the selected month
const distilledBatches = computed(() => {
  return batchStore.batches.filter(b => {
    const distDate = (b.stages as any)?.distilling?.startedAt ? new Date((b.stages as any).distilling.startedAt) : null
    if (!distDate) return false
    return distDate >= monthStart.value && distDate <= monthEnd.value
  })
})

// Production by spirit type
const productionByType = computed(() => {
  const map = new Map<string, { wineGallons: number; proofGallons: number; batches: number }>()

  distilledBatches.value.forEach(batch => {
    const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    const spiritType = recipe?.class || recipe?.type || 'Unknown'
    const hearts = (batch.stages as any)?.distilling?.collected?.hearts
    if (!hearts) return

    const vol = toGallons(hearts.volume || 0, hearts.unit || 'gal')
    const abv = hearts.abv || 0
    const pg = calculateProofGallons(vol, 'gallon', abv)

    const existing = map.get(spiritType) || { wineGallons: 0, proofGallons: 0, batches: 0 }
    existing.wineGallons += vol
    existing.proofGallons += pg
    existing.batches += 1
    map.set(spiritType, existing)
  })

  return Array.from(map.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.proofGallons - a.proofGallons)
})

// Totals
const totalWineGallons = computed(() =>
  productionByType.value.reduce((sum, t) => sum + t.wineGallons, 0)
)
const totalProofGallons = computed(() =>
  productionByType.value.reduce((sum, t) => sum + t.proofGallons, 0)
)
const totalBatchCount = computed(() =>
  productionByType.value.reduce((sum, t) => sum + t.batches, 0)
)

// Heads and tails (non-product spirits)
const headsAndTails = computed(() => {
  let headsWG = 0, headsPG = 0, tailsWG = 0, tailsPG = 0

  distilledBatches.value.forEach(batch => {
    const heads = (batch.stages as any)?.distilling?.collected?.heads
    const tails = (batch.stages as any)?.distilling?.collected?.tails

    if (heads) {
      const vol = toGallons(heads.volume || 0, heads.unit || 'gal')
      headsWG += vol
      headsPG += calculateProofGallons(vol, 'gallon', heads.abv || 0)
    }
    if (tails) {
      const vol = toGallons(tails.volume || 0, tails.unit || 'gal')
      tailsWG += vol
      tailsPG += calculateProofGallons(vol, 'gallon', tails.abv || 0)
    }
  })

  return { headsWG, headsPG, tailsWG, tailsPG }
})

// Materials used (grain/ingredients from recipes)
const materialsUsed = computed(() => {
  const map = new Map<string, { amount: number; unit: string }>()

  distilledBatches.value.forEach(batch => {
    const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    if (!recipe?.items?.length) return

    recipe.items.forEach(ing => {
      const item = itemStore.getItemById(ing.item)
      const name = item?.name || 'Unknown Material'
      const unit = ing.unit || 'units'
      const key = `${name}||${unit}`

      const existing = map.get(key) || { amount: 0, unit }
      existing.amount += ing.amount || 0
      map.set(key, existing)
    })
  })

  return Array.from(map.entries())
    .map(([key, data]) => ({
      name: key.split('||')[0],
      amount: data.amount,
      unit: data.unit,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Individual batch detail
const batchDetails = computed(() => {
  return distilledBatches.value.map(batch => {
    const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    const hearts = (batch.stages as any)?.distilling?.collected?.hearts
    const vol = hearts ? toGallons(hearts.volume || 0, hearts.unit || 'gal') : 0
    const abv = hearts?.abv || 0

    return {
      _id: batch._id,
      recipeName: recipe?.name || 'Unknown',
      spiritType: recipe?.class || recipe?.type || 'Unknown',
      date: (batch.stages as any)?.distilling?.startedAt ? new Date((batch.stages as any).distilling.startedAt).toLocaleDateString() : '--',
      wineGallons: vol,
      abv,
      proofGallons: calculateProofGallons(vol, 'gallon', abv),
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
          TTB Monthly Report of Production Operations
        </h2>
        <span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.11</span>
      </div>
      <p class="text-sm text-parchment/60 print:text-gray-600">
        Reporting Period: {{ monthLabel }}
      </p>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">{{ totalBatchCount }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Distillation Runs</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalWineGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-copper print:text-black">{{ totalProofGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ productionByType.length }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Spirit Types</div>
      </div>
    </div>

    <!-- Production by spirit type -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Production by Spirit Type</h3>
      <div v-if="productionByType.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Batches</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gallons</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in productionByType"
              :key="row.type"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ row.type }}</td>
              <td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">{{ row.batches }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ row.proofGallons.toFixed(2) }}</td>
            </tr>
            <!-- Total row -->
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalBatchCount }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalWineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ totalProofGallons.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No production recorded for {{ monthLabel }}
      </div>
    </div>

    <!-- Heads & Tails -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Non-Product Spirits (Heads & Tails)</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (WG)</div>
          <div class="text-sm text-parchment print:text-black">{{ headsAndTails.headsWG.toFixed(2) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (PG)</div>
          <div class="text-sm text-parchment print:text-black">{{ headsAndTails.headsPG.toFixed(2) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (WG)</div>
          <div class="text-sm text-parchment print:text-black">{{ headsAndTails.tailsWG.toFixed(2) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (PG)</div>
          <div class="text-sm text-parchment print:text-black">{{ headsAndTails.tailsPG.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- Materials used -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Materials Used</h3>
      <div v-if="materialsUsed.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Material</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Amount</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="mat in materialsUsed"
              :key="mat.name"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black">{{ mat.name }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ mat.amount.toFixed(2) }}</td>
              <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ mat.unit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No materials data available
      </div>
    </div>

    <!-- Batch detail -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Batch Detail</h3>
      <div v-if="batchDetails.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Recipe</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
            </tr>
          </thead>
          <tbody>
            <NuxtLink
              v-for="b in batchDetails"
              :key="b._id"
              :to="`/admin/batch/${b._id}`"
              custom
              v-slot="{ navigate }"
            >
              <tr
                class="border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200"
                @click="navigate"
              >
                <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ b.date }}</td>
                <td class="py-2 px-3 text-parchment print:text-black">{{ b.recipeName }}</td>
                <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ b.spiritType }}</td>
                <td class="py-2 px-3 text-right text-parchment print:text-black">{{ b.wineGallons.toFixed(2) }}</td>
                <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ b.abv.toFixed(1) }}%</td>
                <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ b.proofGallons.toFixed(2) }}</td>
              </tr>
            </NuxtLink>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No batches distilled in {{ monthLabel }}
      </div>
    </div>
  </div>
</template>
