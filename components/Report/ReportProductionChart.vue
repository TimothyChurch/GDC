<script setup lang="ts">
import { Bar, Line, Doughnut } from 'vue-chartjs'
useChartRegistration()
import type { Production } from '~/types'

const props = defineProps<{
  productions: Production[]
  period: 'week' | 'month' | 'quarter' | 'year' | 'all'
}>()

const bottleStore = useBottleStore()

// Filter productions by period
const filteredProductions = computed(() => {
  if (props.period === 'all') return props.productions
  const now = new Date()
  const cutoff = new Date()
  switch (props.period) {
    case 'week': cutoff.setDate(now.getDate() - 7); break
    case 'month': cutoff.setMonth(now.getMonth() - 1); break
    case 'quarter': cutoff.setMonth(now.getMonth() - 3); break
    case 'year': cutoff.setFullYear(now.getFullYear() - 1); break
  }
  return props.productions.filter(p => new Date(p.date) >= cutoff)
})

// Summary metrics
const totalBottles = computed(() =>
  filteredProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
)
const totalCost = computed(() =>
  filteredProductions.value.reduce((sum, p) => sum + (p.productionCost || 0), 0)
)
const avgCostPerBottle = computed(() =>
  totalBottles.value > 0 ? totalCost.value / totalBottles.value : 0
)
const totalRuns = computed(() => filteredProductions.value.length)

// Production by product (doughnut chart)
const productBreakdown = computed(() => {
  const map = new Map<string, number>()
  filteredProductions.value.forEach(p => {
    const name = bottleStore.getBottleById(p.bottle)?.name || 'Unknown'
    map.set(name, (map.get(name) || 0) + (p.quantity || 0))
  })
  return map
})

const doughnutData = computed(() => {
  const labels = Array.from(productBreakdown.value.keys())
  const data = Array.from(productBreakdown.value.values())
  const colors = [
    'rgba(212, 175, 55, 0.8)',   // gold
    'rgba(184, 115, 51, 0.8)',   // copper
    'rgba(245, 158, 11, 0.8)',   // amber
    'rgba(139, 92, 246, 0.8)',   // purple
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(16, 185, 129, 0.8)',   // green
    'rgba(239, 68, 68, 0.8)',    // red
    'rgba(107, 114, 128, 0.8)',  // gray
  ]
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length),
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

// Production timeline (bar chart by month)
const timelineData = computed(() => {
  const monthMap = new Map<string, number>()
  filteredProductions.value.forEach(p => {
    const d = new Date(p.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) || 0) + (p.quantity || 0))
  })
  const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b))
  return {
    labels: sorted.map(([k]) => {
      const [y, m] = k.split('-')
      return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [{
      label: 'Bottles Produced',
      data: sorted.map(([, v]) => v),
      backgroundColor: 'rgba(212, 175, 55, 0.6)',
      borderColor: 'rgba(212, 175, 55, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }
})

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { ticks: { color: 'rgba(245, 245, 220, 0.5)' }, grid: { color: 'rgba(139, 69, 19, 0.15)' } },
    y: { ticks: { color: 'rgba(245, 245, 220, 0.5)' }, grid: { color: 'rgba(139, 69, 19, 0.15)' }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: 'rgba(245, 245, 220, 0.7)' } },
  },
}

// Cost trend (line chart)
const costTrendData = computed(() => {
  const monthMap = new Map<string, { cost: number; qty: number }>()
  filteredProductions.value.forEach(p => {
    const d = new Date(p.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const existing = monthMap.get(key) || { cost: 0, qty: 0 }
    existing.cost += p.productionCost || 0
    existing.qty += p.quantity || 0
    monthMap.set(key, existing)
  })
  const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b))
  return {
    labels: sorted.map(([k]) => {
      const [y, m] = k.split('-')
      return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      {
        label: 'Total Cost',
        data: sorted.map(([, v]) => v.cost),
        borderColor: 'rgba(184, 115, 51, 1)',
        backgroundColor: 'rgba(184, 115, 51, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Avg Cost/Bottle',
        data: sorted.map(([, v]) => v.qty > 0 ? v.cost / v.qty : 0),
        borderColor: 'rgba(212, 175, 55, 1)',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { ticks: { color: 'rgba(245, 245, 220, 0.5)' }, grid: { color: 'rgba(139, 69, 19, 0.15)' } },
    y: { ticks: { color: 'rgba(245, 245, 220, 0.5)', callback: (v: any) => '$' + v }, grid: { color: 'rgba(139, 69, 19, 0.15)' }, beginAtZero: true },
  },
  plugins: {
    legend: { labels: { color: 'rgba(245, 245, 220, 0.7)' } },
  },
}
</script>

<template>
  <div class="space-y-6">
    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-gold">{{ totalRuns }}</div>
        <div class="text-xs text-parchment/60 mt-1">Production Runs</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment">{{ totalBottles.toLocaleString() }}</div>
        <div class="text-xs text-parchment/60 mt-1">Bottles Produced</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-copper">{{ Dollar.format(totalCost) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Total Cost</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment">{{ Dollar.format(avgCostPerBottle) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Avg Cost/Bottle</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Production by Product -->
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-sm font-semibold text-parchment/70 mb-3">Production by Product</h3>
        <div v-if="productBreakdown.size === 0" class="text-center py-8 text-parchment/50 text-sm">
          No production data
        </div>
        <div v-else class="h-64">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Production Timeline -->
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-sm font-semibold text-parchment/70 mb-3">Production Timeline</h3>
        <div v-if="timelineData.labels.length === 0" class="text-center py-8 text-parchment/50 text-sm">
          No production data
        </div>
        <div v-else class="h-64">
          <Bar :data="timelineData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- Cost Trend -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Cost Trend</h3>
      <div v-if="costTrendData.labels.length === 0" class="text-center py-8 text-parchment/50 text-sm">
        No cost data
      </div>
      <div v-else class="h-72">
        <Line :data="costTrendData" :options="lineOptions" />
      </div>
    </div>

    <!-- Production table -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">Production Records</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Quantity</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Total Cost</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Per Bottle</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in filteredProductions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())"
              :key="p._id"
              class="border-b border-brown/10 hover:bg-brown/10"
            >
              <td class="py-2 px-3 text-parchment/70">{{ new Date(p.date).toLocaleDateString() }}</td>
              <td class="py-2 px-3 text-parchment">{{ bottleStore.getBottleById(p.bottle)?.name || 'Unknown' }}</td>
              <td class="py-2 px-3 text-right text-parchment">{{ p.quantity }}</td>
              <td class="py-2 px-3 text-right text-copper">{{ Dollar.format(p.productionCost || 0) }}</td>
              <td class="py-2 px-3 text-right text-parchment/70">{{ Dollar.format(p.quantity > 0 ? (p.productionCost || 0) / p.quantity : 0) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredProductions.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          No production records for this period
        </div>
      </div>
    </div>
  </div>
</template>
