<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { differenceInDays } from 'date-fns'

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

// Barrel data with aging info
const barrelData = computed(() => {
  return vesselStore.barrels.map(barrel => {
    const hasFill = barrel.contents && barrel.contents.length > 0
    const batch = hasFill ? batchStore.getBatchById(barrel.contents![0].batch) : null
    const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    const fillDate = (batch?.stages as any)?.barrelAging?.entry?.date ? new Date((batch?.stages as any).barrelAging.entry.date) : null
    const ageDays = fillDate ? differenceInDays(new Date(), fillDate) : 0
    const entryVolume = (batch?.stages as any)?.barrelAging?.entry?.volume || barrel.current?.volume || 0
    const currentVolume = barrel.current?.volume || 0
    const angelsShare = entryVolume > 0 && currentVolume > 0 ? entryVolume - currentVolume : 0
    const angelsSharePct = entryVolume > 0 ? (angelsShare / entryVolume) * 100 : 0

    return {
      _id: barrel._id,
      name: barrel.name,
      contents: recipe?.name || (hasFill ? 'Unknown' : 'Empty'),
      isEmpty: !hasFill,
      fillDate,
      ageDays,
      ageDisplay: formatAge(ageDays),
      char: barrel.barrel?.char || '',
      cost: barrel.barrel?.cost || 0,
      size: barrel.barrel?.size || '',
      entryAbv: (batch?.stages as any)?.barrelAging?.entry?.abv || 0,
      currentAbv: barrel.current?.abv || 0,
      entryVolume,
      currentVolume,
      angelsShare,
      angelsSharePct,
      currentValue: barrel.current?.value || 0,
    }
  }).sort((a, b) => b.ageDays - a.ageDays)
})

function formatAge(days: number): string {
  if (days <= 0) return '--'
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`
}

// Summary stats
const filledBarrels = computed(() => barrelData.value.filter(b => !b.isEmpty))
const emptyBarrels = computed(() => barrelData.value.filter(b => b.isEmpty))
const totalBarrelValue = computed(() =>
  barrelData.value.reduce((sum, b) => sum + b.currentValue, 0)
)
const totalBarrelCost = computed(() =>
  barrelData.value.reduce((sum, b) => sum + b.cost, 0)
)
const avgAge = computed(() => {
  const filled = filledBarrels.value
  if (filled.length === 0) return 0
  return Math.round(filled.reduce((sum, b) => sum + b.ageDays, 0) / filled.length)
})
const totalAngelsShare = computed(() =>
  filledBarrels.value.reduce((sum, b) => sum + b.angelsShare, 0)
)

// Age distribution chart
const ageDistribution = computed(() => {
  const buckets: Record<string, number> = {
    '< 6 mo': 0,
    '6-12 mo': 0,
    '1-2 yr': 0,
    '2-3 yr': 0,
    '3+ yr': 0,
  }
  filledBarrels.value.forEach(b => {
    if (b.ageDays < 180) buckets['< 6 mo']++
    else if (b.ageDays < 365) buckets['6-12 mo']++
    else if (b.ageDays < 730) buckets['1-2 yr']++
    else if (b.ageDays < 1095) buckets['2-3 yr']++
    else buckets['3+ yr']++
  })
  return {
    labels: Object.keys(buckets),
    datasets: [{
      label: 'Barrels',
      data: Object.values(buckets),
      backgroundColor: [
        'rgba(245, 158, 11, 0.4)',
        'rgba(245, 158, 11, 0.55)',
        'rgba(184, 115, 51, 0.6)',
        'rgba(184, 115, 51, 0.75)',
        'rgba(139, 69, 19, 0.8)',
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(184, 115, 51, 1)',
        'rgba(184, 115, 51, 1)',
        'rgba(139, 69, 19, 1)',
      ],
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
    y: { ticks: { color: 'rgba(245, 245, 220, 0.5)', stepSize: 1 }, grid: { color: 'rgba(139, 69, 19, 0.15)' }, beginAtZero: true },
  },
  plugins: {
    legend: { display: false },
  },
}

// Char level breakdown
const charBreakdown = computed(() => {
  const map = new Map<string, number>()
  barrelData.value.forEach(b => {
    const char = b.char || 'Unknown'
    map.set(char, (map.get(char) || 0) + 1)
  })
  return Array.from(map.entries()).sort(([, a], [, b]) => b - a)
})

// Size breakdown
const sizeBreakdown = computed(() => {
  const map = new Map<string, number>()
  barrelData.value.forEach(b => {
    const size = b.size || 'Unknown'
    map.set(size, (map.get(size) || 0) + 1)
  })
  return Array.from(map.entries()).sort(([, a], [, b]) => b - a)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment">{{ barrelData.length }}</div>
        <div class="text-xs text-parchment/60 mt-1">Total Barrels</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-copper">{{ filledBarrels.length }}</div>
        <div class="text-xs text-parchment/60 mt-1">Filled</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-parchment/60">{{ emptyBarrels.length }}</div>
        <div class="text-xs text-parchment/60 mt-1">Empty</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-gold">{{ formatAge(avgAge) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Avg Age</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-amber-400">{{ Dollar.format(totalBarrelValue) }}</div>
        <div class="text-xs text-parchment/60 mt-1">Contents Value</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center">
        <div class="text-2xl font-bold text-red-400/70">{{ totalAngelsShare.toFixed(1) }} gal</div>
        <div class="text-xs text-parchment/60 mt-1">Angel's Share</div>
      </div>
    </div>

    <!-- Charts and breakdowns -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Age distribution chart -->
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4 lg:col-span-2">
        <h3 class="text-sm font-semibold text-parchment/70 mb-3">Age Distribution</h3>
        <div v-if="filledBarrels.length === 0" class="text-center py-8 text-parchment/50 text-sm">
          No filled barrels
        </div>
        <div v-else class="h-56">
          <Bar :data="ageDistribution" :options="barOptions" />
        </div>
      </div>

      <!-- Breakdowns -->
      <div class="space-y-4">
        <!-- Char level -->
        <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
          <h3 class="text-sm font-semibold text-parchment/70 mb-3">By Char Level</h3>
          <div class="space-y-2">
            <div
              v-for="[char, count] in charBreakdown"
              :key="char"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-parchment/60">{{ char }}</span>
              <span class="text-parchment font-semibold">{{ count }}</span>
            </div>
            <div v-if="charBreakdown.length === 0" class="text-parchment/50 text-sm text-center py-2">No data</div>
          </div>
        </div>

        <!-- Size -->
        <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
          <h3 class="text-sm font-semibold text-parchment/70 mb-3">By Size</h3>
          <div class="space-y-2">
            <div
              v-for="[size, count] in sizeBreakdown"
              :key="size"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-parchment/60">{{ size }}</span>
              <span class="text-parchment font-semibold">{{ count }}</span>
            </div>
            <div v-if="sizeBreakdown.length === 0" class="text-parchment/50 text-sm text-center py-2">No data</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barrel detail table -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3">All Barrels</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Barrel</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium">Contents</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Age</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Fill Date</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium">Char</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Entry ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Current Vol</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Angel's Share</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="barrel in barrelData"
              :key="barrel._id"
              class="border-b border-brown/10 hover:bg-brown/10"
              :class="barrel.isEmpty ? 'opacity-40' : ''"
            >
              <td class="py-2 px-3 text-parchment font-medium">{{ barrel.name }}</td>
              <td class="py-2 px-3 text-parchment/70">{{ barrel.contents }}</td>
              <td class="py-2 px-3 text-right">
                <span :class="barrel.ageDays >= 730 ? 'text-gold font-semibold' : barrel.ageDays >= 365 ? 'text-amber-400' : 'text-parchment/60'">
                  {{ barrel.ageDisplay }}
                </span>
              </td>
              <td class="py-2 px-3 text-right text-parchment/50">
                {{ barrel.fillDate ? barrel.fillDate.toLocaleDateString() : '--' }}
              </td>
              <td class="py-2 px-3 text-center text-parchment/60">{{ barrel.char || '--' }}</td>
              <td class="py-2 px-3 text-right text-parchment/60">
                {{ barrel.entryAbv ? barrel.entryAbv + '%' : '--' }}
              </td>
              <td class="py-2 px-3 text-right text-parchment/70">
                {{ barrel.currentVolume ? barrel.currentVolume + ' gal' : '--' }}
              </td>
              <td class="py-2 px-3 text-right">
                <span v-if="barrel.angelsShare > 0" class="text-red-400/70">
                  {{ barrel.angelsShare.toFixed(1) }} gal ({{ barrel.angelsSharePct.toFixed(1) }}%)
                </span>
                <span v-else class="text-parchment/20">--</span>
              </td>
              <td class="py-2 px-3 text-right text-copper">
                {{ barrel.currentValue > 0 ? Dollar.format(barrel.currentValue) : '--' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="barrelData.length === 0" class="text-center py-6 text-parchment/50 text-sm">
          No barrels found
        </div>
      </div>
    </div>
  </div>
</template>
