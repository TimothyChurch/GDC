<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs'

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const bottleStore = useBottleStore()
const productionStore = useProductionStore()

// Batch cost data
const batchCostData = computed(() => {
  return batchStore.batches
    .filter(b => b.batchCost && b.batchCost > 0)
    .map(batch => {
      const recipe = recipeStore.getRecipeById(batch.recipe)
      const recipeCostVal = recipePrice(batch.recipe)
      return {
        _id: batch._id,
        recipeName: recipe?.name || 'Unknown',
        recipeClass: recipe?.class || '',
        status: batch.status || 'Unknown',
        batchSize: batch.batchSize,
        batchSizeUnit: batch.batchSizeUnit,
        recipeCost: recipeCostVal,
        batchCost: batch.batchCost || 0,
        brewDate: batch.createdAt ? new Date(batch.createdAt) : null,
      }
    })
    .sort((a, b) => (b.brewDate?.getTime() || 0) - (a.brewDate?.getTime() || 0))
})

// Recipe cost comparison
const recipeCosts = computed(() => {
  const costMap = new Map<string, { name: string; class: string; cost: number; batchCount: number }>()
  batchStore.batches.forEach(batch => {
    const recipe = recipeStore.getRecipeById(batch.recipe)
    if (!recipe) return
    const existing = costMap.get(recipe._id)
    if (!existing) {
      costMap.set(recipe._id, {
        name: recipe.name,
        class: recipe.class || '',
        cost: recipePrice(recipe._id),
        batchCount: 1,
      })
    } else {
      existing.batchCount++
    }
  })
  return Array.from(costMap.values()).sort((a, b) => b.cost - a.cost)
})

const recipeCostChart = computed(() => {
  const data = recipeCosts.value.slice(0, 10)
  return {
    labels: data.map(r => r.name),
    datasets: [{
      label: 'Recipe Cost',
      data: data.map(r => r.cost),
      backgroundColor: 'rgba(212, 175, 55, 0.6)',
      borderColor: 'rgba(212, 175, 55, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }
})

const recipeCostBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  scales: {
    x: { ticks: { color: 'rgba(245, 245, 220, 0.5)', callback: (v: any) => '$' + v }, grid: { color: 'rgba(139, 69, 19, 0.15)' } },
    y: { ticks: { color: 'rgba(245, 245, 220, 0.5)' }, grid: { display: false } },
  },
  plugins: {
    legend: { display: false },
  },
}

// Margin analysis
const marginData = computed(() => {
  return bottleStore.bottles
    .filter(b => b.price && b.price > 0)
    .map(bottle => {
      const cost = bottleCost(bottle._id) || 0
      const price = bottle.price || 0
      const margin = price - cost
      const marginPct = price > 0 ? (margin / price) * 100 : 0
      return {
        _id: bottle._id,
        name: bottle.name,
        class: bottle.class || '',
        price,
        cost,
        margin,
        marginPct,
      }
    })
    .sort((a, b) => b.marginPct - a.marginPct)
})

// Margin chart (doughnut showing cost vs margin for all products)
const marginChart = computed(() => {
  const totalCost = marginData.value.reduce((sum, m) => sum + m.cost, 0)
  const totalMargin = marginData.value.reduce((sum, m) => sum + m.margin, 0)
  return {
    labels: ['Cost', 'Margin'],
    datasets: [{
      data: [totalCost, Math.max(0, totalMargin)],
      backgroundColor: [
        'rgba(184, 115, 51, 0.7)',
        'rgba(16, 185, 129, 0.7)',
      ],
      borderColor: 'rgba(28, 25, 23, 0.8)',
      borderWidth: 2,
    }],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: 'rgba(245, 245, 220, 0.7)', padding: 12, font: { size: 11 } },
    },
  },
}

// Summary stats
const totalBatchCost = computed(() =>
  batchCostData.value.reduce((sum, b) => sum + b.batchCost, 0)
)
const avgBatchCost = computed(() =>
  batchCostData.value.length > 0 ? totalBatchCost.value / batchCostData.value.length : 0
)
const avgMargin = computed(() => {
  const margins = marginData.value.filter(m => m.cost > 0)
  if (margins.length === 0) return 0
  return margins.reduce((sum, m) => sum + m.marginPct, 0) / margins.length
})
</script>

<template>
  <div class="space-y-6">
    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-copper">{{ Dollar.format(totalBatchCost) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Total Batch Costs</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment">{{ Dollar.format(avgBatchCost) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Avg Batch Cost</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-gold">{{ recipeCosts.length }}</div>
        <div class="text-xs text-parchment/60 mt-1">Recipes Costed</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold" :class="avgMargin > 50 ? 'text-green-400' : avgMargin > 30 ? 'text-amber-400' : 'text-red-400'">
          {{ avgMargin.toFixed(1) }}%
        </div>
        <div class="text-xs text-parchment/60 mt-1">Avg Margin</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Recipe cost comparison -->
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-sm font-semibold text-parchment/70 mb-3">Recipe Cost Comparison</h3>
        <div v-if="recipeCostChart.labels.length === 0" class="text-center py-8 text-parchment/50 text-sm">
          No recipe cost data
        </div>
        <div v-else class="h-64">
          <Bar :data="recipeCostChart" :options="recipeCostBarOptions" />
        </div>
      </div>

      <!-- Overall margin split -->
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-sm font-semibold text-parchment/70 mb-3">Overall Cost vs Margin</h3>
        <div v-if="marginData.length === 0" class="text-center py-8 text-parchment/50 text-sm">
          No margin data
        </div>
        <div v-else class="h-64">
          <Doughnut :data="marginChart" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Margin analysis table -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Product Margin Analysis</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Class</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Price</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Cost</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Margin</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Margin %</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in marginData"
              :key="m._id"
              class="border-b border-brown/10 hover:bg-brown/10"
            >
              <td class="py-2 px-3 text-parchment">{{ m.name }}</td>
              <td class="py-2 px-3 text-parchment/60">{{ m.class }}</td>
              <td class="py-2 px-3 text-right text-parchment">{{ Dollar.format(m.price) }}</td>
              <td class="py-2 px-3 text-right text-copper">{{ Dollar.format(m.cost) }}</td>
              <td class="py-2 px-3 text-right" :class="m.margin > 0 ? 'text-green-400' : 'text-red-400'">
                {{ Dollar.format(m.margin) }}
              </td>
              <td class="py-2 px-3 text-right">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="m.marginPct > 50
                    ? 'bg-green-500/15 text-green-400'
                    : m.marginPct > 30
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'"
                >
                  {{ m.marginPct.toFixed(1) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="marginData.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          No products with pricing data
        </div>
      </div>
    </div>

    <!-- Batch cost breakdown table -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Batch Cost Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Recipe</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Status</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Batch Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Recipe Cost</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Batch Cost</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Brew Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="batch in batchCostData"
              :key="batch._id"
              class="border-b border-brown/10 hover:bg-brown/10"
            >
              <td class="py-2 px-3 text-parchment">{{ batch.recipeName }}</td>
              <td class="py-2 px-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/20 text-parchment/60">
                  {{ batch.status }}
                </span>
              </td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ batch.batchSize }} {{ batch.batchSizeUnit }}</td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ Dollar.format(batch.recipeCost) }}</td>
              <td class="py-2 px-3 text-right text-copper font-semibold">{{ Dollar.format(batch.batchCost) }}</td>
              <td class="py-2 px-3 text-right text-parchment/50">
                {{ batch.brewDate ? batch.brewDate.toLocaleDateString() : '--' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="batchCostData.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          No batch cost data available
        </div>
      </div>
    </div>
  </div>
</template>
