<script setup lang="ts">
import { calculateProofGallons, toGallons } from '~/utils/proofGallons'

const props = defineProps<{
  month: string // 'YYYY-MM' format
}>()

const productionStore = useProductionStore()
const batchStore = useBatchStore()
const bottleStore = useBottleStore()
const vesselStore = useVesselStore()
const recipeStore = useRecipeStore()

// Parse month range
const monthStart = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return new Date(y, m - 1, 1)
})
const monthEnd = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return new Date(y, m, 0, 23, 59, 59)
})

const monthLabel = computed(() =>
  monthStart.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

// Bottle volume to wine gallons
function bottleToWineGallons(bottle: { volume?: number; volumeUnit?: string }): number {
  const vol = bottle.volume || 750
  const unit = (bottle.volumeUnit || 'mL').toLowerCase()
  if (unit === 'ml' || unit.includes('milli')) return vol * 0.000264172
  if (unit === 'l' || unit.includes('liter')) return vol * 0.264172
  if (unit.includes('oz')) return vol * 0.0078125
  if (unit.includes('gal')) return vol
  // Default: assume mL
  return vol * 0.000264172
}

// Productions (bottling runs) during the selected month
const monthlyProductions = computed(() => {
  return productionStore.productions.filter(p => {
    const pDate = new Date(p.date)
    return pDate >= monthStart.value && pDate <= monthEnd.value
  })
})

// Spirits bottled summary
const bottledByProduct = computed(() => {
  const map = new Map<string, {
    productName: string
    spiritType: string
    bottles: number
    bottleSize: string
    wineGallons: number
    proofGallons: number
    abv: number
  }>()

  monthlyProductions.value.forEach(p => {
    const bottle = bottleStore.getBottleById(p.bottle)
    if (!bottle) return

    const key = bottle._id
    const abv = bottle.abv || 0
    const wgPerBottle = bottleToWineGallons(bottle)
    const totalWG = wgPerBottle * (p.quantity || 0)
    const totalPG = calculateProofGallons(totalWG, 'gallon', abv)
    const sizeLabel = `${bottle.volume || 750}${bottle.volumeUnit || 'mL'}`

    const existing = map.get(key) || {
      productName: bottle.name || 'Unknown',
      spiritType: bottle.class || bottle.type || 'Unknown',
      bottles: 0,
      bottleSize: sizeLabel,
      wineGallons: 0,
      proofGallons: 0,
      abv,
    }
    existing.bottles += p.quantity || 0
    existing.wineGallons += totalWG
    existing.proofGallons += totalPG
    map.set(key, existing)
  })

  return Array.from(map.values()).sort((a, b) => b.proofGallons - a.proofGallons)
})

// Totals
const totalBottles = computed(() =>
  bottledByProduct.value.reduce((sum, p) => sum + p.bottles, 0)
)
const totalWineGallons = computed(() =>
  bottledByProduct.value.reduce((sum, p) => sum + p.wineGallons, 0)
)
const totalProofGallons = computed(() =>
  bottledByProduct.value.reduce((sum, p) => sum + p.proofGallons, 0)
)

// Dumped from barrels (batches that exited barrels this month for bottling)
const dumpedFromBarrels = computed(() => {
  return batchStore.batches
    .filter(b => {
      const exitDate = (b.stages as any)?.barrelAging?.exit?.date ? new Date((b.stages as any).barrelAging.exit.date) : null
      if (!exitDate) return false
      return exitDate >= monthStart.value && exitDate <= monthEnd.value
    })
    .map(b => {
      const recipe = b.recipe ? recipeStore.getRecipeById(b.recipe) : null
      const exit = (b.stages as any)?.barrelAging?.exit
      const vol = exit ? toGallons(exit.volume || 0, exit.volumeUnit || 'gal') : 0
      const abv = exit?.abv || 0
      return {
        _id: b._id,
        recipe: recipe?.name || 'Unknown',
        spiritType: recipe?.class || recipe?.type || 'Unknown',
        date: exit?.date ? new Date(exit.date).toLocaleDateString() : '--',
        wineGallons: vol,
        abv,
        proofGallons: calculateProofGallons(vol, 'gallon', abv),
      }
    })
})

const dumpedWG = computed(() => dumpedFromBarrels.value.reduce((s, d) => s + d.wineGallons, 0))
const dumpedPG = computed(() => dumpedFromBarrels.value.reduce((s, d) => s + d.proofGallons, 0))

// Individual production records
const productionDetails = computed(() => {
  return monthlyProductions.value
    .map(p => {
      const bottle = bottleStore.getBottleById(p.bottle)
      const abv = bottle?.abv || 0
      const wgPerBottle = bottle ? bottleToWineGallons(bottle) : 0
      const totalWG = wgPerBottle * (p.quantity || 0)
      return {
        _id: p._id,
        date: new Date(p.date).toLocaleDateString(),
        product: bottle?.name || 'Unknown',
        quantity: p.quantity || 0,
        bottleSize: bottle ? `${bottle.volume || 750}${bottle.volumeUnit || 'mL'}` : '--',
        wineGallons: totalWG,
        proofGallons: calculateProofGallons(totalWG, 'gallon', abv),
        abv,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
          TTB Monthly Report of Processing Operations
        </h2>
        <span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.28</span>
      </div>
      <p class="text-sm text-parchment/60 print:text-gray-600">
        Reporting Period: {{ monthLabel }}
      </p>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ monthlyProductions.length }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottling Runs</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">{{ totalBottles.toLocaleString() }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottles Filled</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalWineGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Bottled</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-copper print:text-black">{{ totalProofGallons.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons Bottled</div>
      </div>
    </div>

    <!-- Spirits bottled by product -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Spirits Bottled by Product</h3>
      <div v-if="bottledByProduct.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in bottledByProduct"
              :key="row.productName"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ row.productName }}</td>
              <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ row.spiritType }}</td>
              <td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">{{ row.bottleSize }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.bottles }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ row.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ row.proofGallons.toFixed(2) }}</td>
            </tr>
            <!-- Total row -->
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalBottles.toLocaleString() }}</td>
              <td class="py-2 px-3"></td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalWineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ totalProofGallons.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No bottling operations recorded for {{ monthLabel }}
      </div>
    </div>

    <!-- Dumped from barrels -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Dumped from Barrels</h3>
      <div v-if="dumpedFromBarrels.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="dump in dumpedFromBarrels"
              :key="dump._id"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ dump.date }}</td>
              <td class="py-2 px-3 text-parchment print:text-black">{{ dump.recipe }} ({{ dump.spiritType }})</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ dump.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ dump.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ dump.proofGallons.toFixed(2) }}</td>
            </tr>
            <!-- Total row -->
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="2">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ dumpedWG.toFixed(2) }}</td>
              <td class="py-2 px-3"></td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ dumpedPG.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No barrels dumped during {{ monthLabel }}
      </div>
    </div>

    <!-- Individual production records -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Bottling Records</h3>
      <div v-if="productionDetails.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in productionDetails"
              :key="p._id"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ p.date }}</td>
              <td class="py-2 px-3 text-parchment print:text-black">{{ p.product }}</td>
              <td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">{{ p.bottleSize }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ p.quantity }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ p.wineGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ p.proofGallons.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No bottling records for {{ monthLabel }}
      </div>
    </div>
  </div>
</template>
