<script setup lang="ts">
const props = defineProps<{
  month: string // 'YYYY-MM' format
}>()

const batchStore = useBatchStore()
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

function proofGallons(volumeGal: number, abv: number): number {
  return volumeGal * abv * 2 / 100
}

function toGallons(volume: number, unit: string): number {
  const lower = (unit || '').toLowerCase()
  if (lower.includes('gal')) return volume
  if (lower.includes('liter') || lower === 'l') return volume * 0.264172
  if (lower.includes('ml')) return volume * 0.000264172
  return volume
}

// All batches that entered barrels (Storage Operations)
// "Received into storage" = batches that entered barrels during this month
const receivedIntoStorage = computed(() => {
  return batchStore.batches.filter(b => {
    const entryDate = b.barreled?.entry?.date ? new Date(b.barreled.entry.date) : null
    if (!entryDate) return false
    return entryDate >= monthStart.value && entryDate <= monthEnd.value
  })
})

// "Removed from storage" = batches that exited barrels (for bottling) during this month
const removedFromStorage = computed(() => {
  return batchStore.batches.filter(b => {
    const exitDate = b.barreled?.exit?.date ? new Date(b.barreled.exit.date) : null
    if (!exitDate) return false
    return exitDate >= monthStart.value && exitDate <= monthEnd.value
  })
})

// Calculate received totals
const receivedTotals = computed(() => {
  let wg = 0, pg = 0
  receivedIntoStorage.value.forEach(b => {
    const entry = b.barreled?.entry
    if (!entry) return
    const vol = toGallons(entry.volume || 0, entry.volumeUnit || 'gal')
    wg += vol
    pg += proofGallons(vol, entry.abv || 0)
  })
  return { wineGallons: wg, proofGallons: pg, count: receivedIntoStorage.value.length }
})

// Calculate removed totals
const removedTotals = computed(() => {
  let wg = 0, pg = 0
  removedFromStorage.value.forEach(b => {
    const exit = b.barreled?.exit
    if (!exit) return
    const vol = toGallons(exit.volume || 0, exit.volumeUnit || 'gal')
    wg += vol
    pg += proofGallons(vol, exit.abv || 0)
  })
  return { wineGallons: wg, proofGallons: pg, count: removedFromStorage.value.length }
})

// Current on-hand (all filled barrels as of now)
const onHandCurrent = computed(() => {
  let wg = 0, pg = 0
  const barrels = vesselStore.barrels.filter(b => b.contents && b.contents.length > 0)
  barrels.forEach(barrel => {
    barrel.contents?.forEach(c => {
      const vol = toGallons(c.volume || 0, c.volumeUnit || 'gal')
      wg += vol
      pg += proofGallons(vol, c.abv || 0)
    })
  })
  return { wineGallons: wg, proofGallons: pg, count: barrels.length }
})

// Storage losses (angel's share) for barrels filled before this month
const storageLosses = computed(() => {
  let lossWG = 0, lossPG = 0

  batchStore.batches.forEach(b => {
    const entryDate = b.barreled?.entry?.date ? new Date(b.barreled.entry.date) : null
    if (!entryDate || entryDate > monthEnd.value) return

    const entry = b.barreled?.entry
    if (!entry) return

    // Find corresponding barrel
    const barrel = vesselStore.barrels.find(v =>
      v.contents?.some(c => c.batch === b._id)
    )
    if (!barrel) return

    const content = barrel.contents?.find(c => c.batch === b._id)
    if (!content) return

    const entryVol = toGallons(entry.volume || 0, entry.volumeUnit || 'gal')
    const currentVol = toGallons(content.volume || 0, content.volumeUnit || 'gal')
    const loss = entryVol - currentVol
    if (loss > 0) {
      lossWG += loss
      // Estimate proof gallon loss using entry ABV
      lossPG += proofGallons(loss, entry.abv || 0)
    }
  })

  return { wineGallons: lossWG, proofGallons: lossPG }
})

// Barrel inventory detail
const barrelInventory = computed(() => {
  return vesselStore.barrels
    .filter(barrel => barrel.contents && barrel.contents.length > 0)
    .map(barrel => {
      const content = barrel.contents![0]
      const batch = batchStore.getBatchById(content.batch)
      const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null
      const entryDate = batch?.barreled?.entry?.date ? new Date(batch.barreled.entry.date) : null
      const vol = toGallons(content.volume || 0, content.volumeUnit || 'gal')
      const abv = content.abv || 0
      const entryVol = batch?.barreled?.entry
        ? toGallons(batch.barreled.entry.volume || 0, batch.barreled.entry.volumeUnit || 'gal')
        : vol
      const loss = entryVol - vol

      return {
        barrelName: barrel.name,
        recipe: recipe?.name || 'Unknown',
        spiritType: recipe?.class || recipe?.type || 'Unknown',
        entryDate: entryDate ? entryDate.toLocaleDateString() : '--',
        wineGallons: vol,
        abv,
        proofGallons: proofGallons(vol, abv),
        loss: loss > 0 ? loss : 0,
      }
    })
    .sort((a, b) => a.barrelName.localeCompare(b.barrelName))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
          TTB Storage Operations Report
        </h2>
        <span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.11 — Storage</span>
      </div>
      <p class="text-sm text-parchment/60 print:text-gray-600">
        Reporting Period: {{ monthLabel }}
      </p>
    </div>

    <!-- Storage summary -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-4 print:text-black">Storage Account Summary</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Line</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Count</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gallons</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-brown/10 print:border-gray-200">
              <td class="py-2 px-3 text-parchment print:text-black font-medium">Received into Storage</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ receivedTotals.count }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ receivedTotals.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ receivedTotals.proofGallons.toFixed(2) }}</td>
            </tr>
            <tr class="border-b border-brown/10 print:border-gray-200">
              <td class="py-2 px-3 text-parchment print:text-black font-medium">Removed from Storage</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ removedTotals.count }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ removedTotals.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ removedTotals.proofGallons.toFixed(2) }}</td>
            </tr>
            <tr class="border-b border-brown/10 print:border-gray-200">
              <td class="py-2 px-3 text-parchment print:text-black font-medium">Storage Losses (Angel's Share)</td>
              <td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">--</td>
              <td class="py-2 px-3 text-right text-red-400/70 print:text-black">{{ storageLosses.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-red-400/70 print:text-black">{{ storageLosses.proofGallons.toFixed(2) }}</td>
            </tr>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black">On Hand (End of Period)</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ onHandCurrent.count }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ onHandCurrent.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ onHandCurrent.proofGallons.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ onHandCurrent.count }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Filled Barrels</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">{{ onHandCurrent.proofGallons.toFixed(1) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gal On Hand</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-green-400 print:text-black">{{ receivedTotals.count }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Received This Month</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-red-400/70 print:text-black">{{ storageLosses.wineGallons.toFixed(1) }} gal</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Storage Losses</div>
      </div>
    </div>

    <!-- Barrel inventory detail -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Barrel Inventory Detail</h3>
      <div v-if="barrelInventory.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Barrel</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Entry Date</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Loss (WG)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="barrel in barrelInventory"
              :key="barrel.barrelName"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ barrel.barrelName }}</td>
              <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ barrel.spiritType }}</td>
              <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ barrel.entryDate }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ barrel.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ barrel.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ barrel.proofGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right">
                <span v-if="barrel.loss > 0" class="text-red-400/70 print:text-black">{{ barrel.loss.toFixed(2) }}</span>
                <span v-else class="text-parchment/50 print:text-gray-400">--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No barrels currently in storage
      </div>
    </div>
  </div>
</template>
