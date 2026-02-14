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
  batchStore.batches.filter(b => b.status && !['Upcoming', 'Bottled'].includes(b.status)).length
)
const totalBarrels = computed(() => vesselStore.barrels.length)
const filledBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.contents && b.contents.length > 0).length
)

// TTB stats
const distillingBatches = computed(() =>
  batchStore.batches.filter(b => b.distilling?.date).length
)
const barreledBatches = computed(() =>
  batchStore.batches.filter(b => b.barreled?.entry?.date).length
)

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
]
</script>

<template>
  <div>
    <AdminPageHeader title="Reports & Analytics" subtitle="Data insights across production, inventory, costs, and aging" icon="i-lucide-bar-chart-3" />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

    <!-- TTB Compliance Reports -->
    <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mt-8 mb-4">TTB Compliance Reports</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="card in ttbCards"
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
  </div>
</template>
