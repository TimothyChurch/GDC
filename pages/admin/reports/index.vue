<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const productionsStore = useProductionStore()
const batchStore = useBatchStore()
const vesselStore = useVesselStore()
const bottleStore = useBottleStore()
const inventoryStore = useInventoryStore()
const itemStore = useItemStore()

const totalProductions = computed(() => productionsStore.productions.length)
const totalBottlesProduced = computed(() =>
  productionsStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0)
)
const activeBatches = computed(() =>
  batchStore.batches.filter(b => b.status === 'active').length
)
const totalBarrels = computed(() => vesselStore.barrels.length)
const filledBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.contents && b.contents.length > 0).length
)

// TTB stats
const distillingBatches = computed(() =>
  batchStore.batches.filter(b => (b.stages as any)?.distilling?.startedAt).length
)
const barreledBatches = computed(() =>
  batchStore.batches.filter(b => (b.stages as any)?.barrelAging?.entry?.date).length
)

// Compliance deadline urgency — drives the calendar card color
const now = new Date()
now.setHours(0, 0, 0, 0)

function getNextMonthly15(): Date {
  const d = new Date(now)
  // If today is past the 15th, next deadline is the 15th of the following month
  if (d.getDate() > 15) {
    d.setMonth(d.getMonth() + 1)
  }
  d.setDate(15)
  return d
}

const nextDeadlineDays = computed(() => {
  const d15 = getNextMonthly15()
  // FET Period 1 deposit is due the 29th of the current month
  const fet29 = new Date(now.getFullYear(), now.getMonth(), 29)
  // FET Period 2 deposit is due the 14th of the current month
  const fet14 = new Date(now.getFullYear(), now.getMonth(), 14)

  const candidates = [d15, fet29, fet14].filter(d => d >= now)
  if (candidates.length === 0) return 30
  const closest = Math.min(...candidates.map(d => Math.round((d.getTime() - now.getTime()) / 86_400_000)))
  return closest
})

const calendarUrgency = computed(() => {
  if (nextDeadlineDays.value <= 3) return { color: 'text-red-400', bg: 'group-hover:bg-red-900/10', border: 'hover:border-red-500/30' }
  if (nextDeadlineDays.value <= 7) return { color: 'text-orange-400', bg: 'group-hover:bg-orange-900/10', border: 'hover:border-orange-500/30' }
  return { color: 'text-blue-400', bg: 'group-hover:bg-blue-900/10', border: 'hover:border-blue-500/20' }
})

const reportCards = [
  {
    title: 'Production',
    subtitle: 'Bottle output, costs, and trends over time',
    icon: 'i-lucide-factory',
    to: '/admin/reports/production',
    stats: [
      { label: 'Total Runs', value: totalProductions },
      { label: 'Bottles Produced', value: totalBottlesProduced },
    ],
    color: 'text-gold',
  },
  {
    title: 'Inventory',
    subtitle: 'Stock levels, valuations, and low stock alerts',
    icon: 'i-lucide-package',
    to: '/admin/reports/inventory',
    stats: [
      { label: 'Items Tracked', value: computed(() => itemStore.items.length) },
      { label: 'Bottle Products', value: computed(() => bottleStore.bottles.length) },
    ],
    color: 'text-copper',
  },
  {
    title: 'Cost Analysis',
    subtitle: 'Batch costs, recipe comparisons, and margins',
    icon: 'i-lucide-dollar-sign',
    to: '/admin/reports/costs',
    stats: [
      { label: 'Active Batches', value: activeBatches },
      { label: 'Total Batches', value: computed(() => batchStore.batches.length) },
    ],
    color: 'text-amber-400',
  },
  {
    title: 'Barrel Aging',
    subtitle: 'Barrel inventory, aging progress, and warehouse status',
    icon: 'i-lucide-cylinder',
    to: '/admin/reports/barrels',
    stats: [
      { label: 'Total Barrels', value: totalBarrels },
      { label: 'Filled', value: filledBarrels },
    ],
    color: 'text-amber-600',
  },
]

const ttbCards = [
  {
    title: 'TTB Production',
    subtitle: 'Monthly Report of Production Operations (Form 5110.11)',
    icon: 'i-lucide-flask-conical',
    to: '/admin/reports/ttb-production',
    stats: [
      { label: 'Distillation Runs', value: distillingBatches },
      { label: 'Active Batches', value: activeBatches },
    ],
    color: 'text-blue-400',
  },
  {
    title: 'TTB Storage',
    subtitle: 'Storage Operations — barrel inventory and movements',
    icon: 'i-lucide-warehouse',
    to: '/admin/reports/ttb-storage',
    stats: [
      { label: 'Filled Barrels', value: filledBarrels },
      { label: 'Barreled Batches', value: barreledBatches },
    ],
    color: 'text-purple-400',
  },
  {
    title: 'TTB Processing',
    subtitle: 'Monthly Report of Processing Operations (Form 5110.28)',
    icon: 'i-lucide-package-check',
    to: '/admin/reports/ttb-processing',
    stats: [
      { label: 'Bottling Runs', value: totalProductions },
      { label: 'Bottles Filled', value: totalBottlesProduced },
    ],
    color: 'text-emerald-400',
  },
  {
    title: 'TTB Excise Tax',
    subtitle: 'Federal excise tax on spirits removed for consumption (Form 5000.24)',
    icon: 'i-lucide-receipt',
    to: '/admin/reports/ttb-excise-tax',
    stats: [
      { label: 'Bottling Runs', value: totalProductions },
      { label: 'Bottles Removed', value: totalBottlesProduced },
    ],
    color: 'text-gold',
  },
]

const tabcCards = [
  {
    title: 'TABC Monthly Report',
    subtitle: 'Texas monthly production and disposition report',
    icon: 'i-lucide-file-text',
    to: '/admin/reports/tabc-monthly',
    stats: [
      { label: 'Distillation Runs', value: distillingBatches },
      { label: 'Active Batches', value: activeBatches },
    ],
    color: 'text-amber-400',
  },
  {
    title: 'TABC Excise Tax',
    subtitle: 'Texas distilled spirits excise tax — $2.40/wine gallon produced',
    icon: 'i-lucide-landmark',
    to: '/admin/reports/tabc-excise-tax',
    stats: [
      { label: 'Distillation Runs', value: distillingBatches },
      { label: 'Total Batches', value: computed(() => batchStore.batches.length) },
    ],
    color: 'text-amber-500',
  },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Reports &amp; Compliance" subtitle="Production analytics, TTB federal filings, and TABC state reporting" icon="i-lucide-bar-chart-3" />

    <!-- Compliance Calendar featured card -->
    <NuxtLink
      to="/admin/reports/compliance-calendar"
      class="group block mb-6 bg-charcoal rounded-xl border border-brown/30 p-5 transition-all duration-200"
      :class="[calendarUrgency.border, calendarUrgency.bg]"
    >
      <div class="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors">
            <UIcon name="i-lucide-calendar-days" :class="['text-xl', calendarUrgency.color]" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors">
              Compliance Calendar
            </h3>
            <p class="text-xs text-parchment/60 mt-0.5">TTB and TABC filing deadlines — 90-day rolling window</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs text-parchment/50 uppercase tracking-wider">Next Deadline</div>
            <div class="text-sm font-semibold" :class="calendarUrgency.color">
              {{ nextDeadlineDays }} day{{ nextDeadlineDays !== 1 ? 's' : '' }}
            </div>
          </div>
          <UIcon name="i-lucide-arrow-right" class="text-parchment/30 group-hover:text-parchment/60 transition-colors" />
        </div>
      </div>
    </NuxtLink>

    <!-- Operational Reports -->
    <h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-3">Operational Reports</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <NuxtLink
        v-for="card in reportCards"
        :key="card.title"
        :to="card.to"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-5 transition-all duration-200"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors">
            <UIcon :name="card.icon" :class="['text-xl', card.color]" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-xs text-parchment/60 mt-0.5">{{ card.subtitle }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in card.stats"
            :key="stat.label"
            class="bg-brown/10 rounded-lg px-3 py-2"
          >
            <div class="text-xl font-bold text-parchment">{{ stat.value.value }}</div>
            <div class="text-[10px] text-parchment/60">{{ stat.label }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- TTB Federal Compliance Reports -->
    <h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-1">
      TTB Federal Compliance
    </h2>
    <p class="text-xs text-parchment/50 mb-3">
      Alcohol and Tobacco Tax and Trade Bureau — 27 CFR Parts 19 &amp; 26 — reports due 15th of following month
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <NuxtLink
        v-for="card in ttbCards"
        :key="card.title"
        :to="card.to"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-blue-500/30 p-5 transition-all duration-200"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors">
            <UIcon :name="card.icon" :class="['text-xl', card.color]" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-xs text-parchment/60 mt-0.5">{{ card.subtitle }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in card.stats"
            :key="stat.label"
            class="bg-brown/10 rounded-lg px-3 py-2"
          >
            <div class="text-xl font-bold text-parchment">{{ stat.value.value }}</div>
            <div class="text-[10px] text-parchment/60">{{ stat.label }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- TABC State Compliance Reports -->
    <h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-1">
      TABC State Compliance
    </h2>
    <p class="text-xs text-parchment/50 mb-3">
      Texas Alcoholic Beverage Commission — Distiller's &amp; Rectifier's Permit — reports due 15th of following month
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="card in tabcCards"
        :key="card.title"
        :to="card.to"
        class="group bg-charcoal rounded-xl border border-brown/30 hover:border-amber-500/30 p-5 transition-all duration-200"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-amber-900/20 transition-colors">
            <UIcon :name="card.icon" :class="['text-xl', card.color]" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors">
              {{ card.title }}
            </h3>
            <p class="text-xs text-parchment/60 mt-0.5">{{ card.subtitle }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in card.stats"
            :key="stat.label"
            class="bg-brown/10 rounded-lg px-3 py-2"
          >
            <div class="text-xl font-bold text-parchment">{{ stat.value.value }}</div>
            <div class="text-[10px] text-parchment/60">{{ stat.label }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
