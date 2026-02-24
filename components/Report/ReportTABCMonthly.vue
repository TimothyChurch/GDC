<script setup lang="ts">
import { calculateProofGallons, toGallons } from '~/utils/proofGallons'
import { normalizeDistillingRuns } from '~/utils/distillingMigration'

/**
 * TABC Monthly Production and Disposition Report
 *
 * Texas Alcoholic Beverage Commission requires Distiller's and Rectifier's
 * permit holders to file monthly reports covering:
 *
 * PRODUCTION:
 *   - Gallons of distilled spirits produced by spirit type
 *   - Both wine gallons and proof gallons
 *   - Grain/material inputs
 *
 * DISPOSITION (how spirits left the DSP):
 *   - Sold to TABC-licensed distributors
 *   - Sold direct-to-consumer (tasting room/package store)
 *   - Transferred to storage/aging
 *   - Any losses or adjustments
 *
 * INVENTORY:
 *   - On-hand at beginning of period
 *   - On-hand at end of period
 *
 * TABC reports in WINE GALLONS (not proof gallons like TTB).
 * Texas excise tax is $2.40 per wine gallon of spirits produced.
 *
 * Reports due by the 15th of the following month.
 * Filed via TABC Compliance Portal.
 */

const props = defineProps<{
  month: string  // 'YYYY-MM'
}>()

const batchStore = useBatchStore()
const productionStore = useProductionStore()
const bottleStore = useBottleStore()
const recipeStore = useRecipeStore()
const itemStore = useItemStore()
const vesselStore = useVesselStore()

// ─── Date helpers ─────────────────────────────────────────────────────────────

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

// TABC report due date: 15th of following month
const dueDate = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return new Date(nextYear, nextMonth - 1, 15).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
})

const isOverdue = computed(() => new Date() > new Date(monthEnd.value.getFullYear(), monthEnd.value.getMonth() + 1, 15))

// ─── Section 1: Production ────────────────────────────────────────────────────

const distilledBatches = computed(() =>
  batchStore.batches.filter(b => {
    const distDate = (b.stages as any)?.distilling?.startedAt
      ? new Date((b.stages as any).distilling.startedAt)
      : null
    if (!distDate) return false
    return distDate >= monthStart.value && distDate <= monthEnd.value
  })
)

// Production by spirit type — wine gallons (TABC reports in wine gallons)
const productionByType = computed(() => {
  const map = new Map<string, { wineGallons: number; proofGallons: number; batches: number }>()

  distilledBatches.value.forEach(batch => {
    const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    const spiritType = recipe?.class || recipe?.type || 'Unknown'
    const runs = normalizeDistillingRuns((batch.stages as any)?.distilling)

    let heartsVol = 0
    let heartsAbvWeighted = 0

    for (const run of runs) {
      if (run.runType === 'spirit' && run.collected?.hearts) {
        const h = run.collected.hearts
        const vol = toGallons(h.volume || 0, h.volumeUnit || 'gallon')
        heartsVol += vol
        heartsAbvWeighted += vol * (h.abv || 0)
      }
    }
    if (heartsVol === 0) return

    const avgAbv = heartsAbvWeighted / heartsVol
    const pg = calculateProofGallons(heartsVol, 'gallon', avgAbv)

    const existing = map.get(spiritType) || { wineGallons: 0, proofGallons: 0, batches: 0 }
    existing.wineGallons += heartsVol
    existing.proofGallons += pg
    existing.batches += 1
    map.set(spiritType, existing)
  })

  return Array.from(map.entries()).map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.wineGallons - a.wineGallons)
})

const totalProductionWG = computed(() =>
  productionByType.value.reduce((s, t) => s + t.wineGallons, 0)
)
const totalProductionPG = computed(() =>
  productionByType.value.reduce((s, t) => s + t.proofGallons, 0)
)

// Heads/late heads/tails (non-beverage spirits — must be reported)
// Late heads are aggregated into the heads total for regulatory reporting
const headsAndTails = computed(() => {
  let headsWG = 0, tailsWG = 0, headsAbvWt = 0, tailsAbvWt = 0

  distilledBatches.value.forEach(batch => {
    const runs = normalizeDistillingRuns((batch.stages as any)?.distilling)
    for (const run of runs) {
      if (run.runType !== 'spirit' || !run.collected) continue
      const heads = run.collected.heads
      const lateHeads = run.collected.lateHeads
      const tails = run.collected.tails
      if (heads) {
        const vol = toGallons(heads.volume || 0, heads.volumeUnit || 'gallon')
        headsWG += vol
        headsAbvWt += vol * (heads.abv || 0)
      }
      if (lateHeads) {
        const vol = toGallons(lateHeads.volume || 0, lateHeads.volumeUnit || 'gallon')
        headsWG += vol
        headsAbvWt += vol * (lateHeads.abv || 0)
      }
      if (tails) {
        const vol = toGallons(tails.volume || 0, tails.volumeUnit || 'gallon')
        tailsWG += vol
        tailsAbvWt += vol * (tails.abv || 0)
      }
    }
  })

  const headsAvgAbv = headsWG > 0 ? headsAbvWt / headsWG : 0
  const tailsAvgAbv = tailsWG > 0 ? tailsAbvWt / tailsWG : 0

  return {
    headsWG,
    headsPG: calculateProofGallons(headsWG, 'gallon', headsAvgAbv),
    tailsWG,
    tailsPG: calculateProofGallons(tailsWG, 'gallon', tailsAvgAbv),
  }
})

// ─── Section 2: Materials (grain bill inputs) ─────────────────────────────────

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
    .map(([key, data]) => ({ name: key.split('||')[0], amount: data.amount, unit: data.unit }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// ─── Section 3: Disposition ───────────────────────────────────────────────────

// Bottles produced this month = spirits transferred from DSP bonded to taxpaid
function bottleToWineGallons(bottle: { volume?: number; volumeUnit?: string }): number {
  const vol = bottle.volume || 750
  const unit = (bottle.volumeUnit || 'mL').toLowerCase()
  if (unit === 'ml' || unit.includes('milli')) return vol * 0.000264172
  if (unit === 'l' || unit.includes('liter')) return vol * 0.264172
  if (unit.includes('oz')) return vol * 0.0078125
  if (unit.includes('gal')) return vol
  return vol * 0.000264172
}

const monthlyProductions = computed(() =>
  productionStore.productions.filter(p => {
    const d = new Date(p.date)
    return d >= monthStart.value && d <= monthEnd.value
  })
)

const dispositionByProduct = computed(() => {
  const map = new Map<string, {
    product: string
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
    const abv = bottle.abv || 0
    const wgPerBottle = bottleToWineGallons(bottle)
    const totalWG = wgPerBottle * (p.quantity || 0)
    const key = bottle._id
    const existing = map.get(key) || {
      product: bottle.name,
      spiritType: bottle.class || bottle.type || 'Unknown',
      bottles: 0,
      bottleSize: `${bottle.volume || 750}${bottle.volumeUnit || 'mL'}`,
      wineGallons: 0,
      proofGallons: 0,
      abv,
    }
    existing.bottles += p.quantity || 0
    existing.wineGallons += totalWG
    existing.proofGallons += calculateProofGallons(totalWG, 'gallon', abv)
    map.set(key, existing)
  })

  return Array.from(map.values()).sort((a, b) => b.wineGallons - a.wineGallons)
})

const totalDispositionWG = computed(() =>
  dispositionByProduct.value.reduce((s, d) => s + d.wineGallons, 0)
)
const totalDispositionBottles = computed(() =>
  dispositionByProduct.value.reduce((s, d) => s + d.bottles, 0)
)

// ─── Section 4: Storage / Inventory ──────────────────────────────────────────

// Barreled this month
const barreledThisMonth = computed(() =>
  batchStore.batches.filter(b => {
    const d = (b.stages as any)?.barrelAging?.entry?.date
      ? new Date((b.stages as any).barrelAging.entry.date)
      : null
    return d && d >= monthStart.value && d <= monthEnd.value
  })
)
const barreledWG = computed(() => {
  let wg = 0
  barreledThisMonth.value.forEach(b => {
    const entry = (b.stages as any)?.barrelAging?.entry
    if (entry) wg += toGallons(entry.volume || 0, entry.volumeUnit || 'gal')
  })
  return wg
})

// Barrel inventory on hand
const onHandBarrelWG = computed(() => {
  let wg = 0
  vesselStore.barrels.filter(b => b.contents?.length).forEach(barrel =>
    barrel.contents?.forEach(c => {
      wg += toGallons(c.volume || 0, c.volumeUnit || 'gal')
    })
  )
  return wg
})

// ─── Texas excise tax calculation ────────────────────────────────────────────
// Texas imposes $2.40 per GALLON (wine gallons) on distilled spirits produced
// Note: TABC uses wine gallons for their excise calculation, unlike TTB's proof gallons
const TABC_TAX_RATE = 2.40
const tabcTaxDue = computed(() => totalProductionWG.value * TABC_TAX_RATE)
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
            TABC Monthly Production and Disposition Report
          </h2>
          <p class="text-xs text-parchment/60 mt-0.5 print:text-gray-500">
            Texas Alcoholic Beverage Commission — Distiller's and Rectifier's Permit
          </p>
        </div>
        <div class="text-right">
          <div class="text-xs text-parchment/60 print:text-gray-500">Reporting Period</div>
          <div class="text-sm font-semibold text-parchment print:text-black">{{ monthLabel }}</div>
          <div class="text-xs mt-1" :class="isOverdue ? 'text-red-400' : 'text-parchment/50 print:text-gray-500'">
            Due: {{ dueDate }}{{ isOverdue ? ' — OVERDUE' : '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ distilledBatches.length }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Batches Distilled</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalProductionWG.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Produced</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalDispositionBottles.toLocaleString() }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottles Disposed</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">${{ tabcTaxDue.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">TX Excise Tax (est.)</div>
      </div>
    </div>

    <!-- Section 1: Production -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">
        Section 1 — Spirits Produced
      </h3>
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
              <td class="py-2 px-3 text-right text-parchment print:text-black font-semibold">{{ row.wineGallons.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">{{ row.proofGallons.toFixed(2) }}</td>
            </tr>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">
                {{ productionByType.reduce((s, t) => s + t.batches, 0) }}
              </td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ totalProductionWG.toFixed(2) }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalProductionPG.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No spirits produced in {{ monthLabel }}
      </div>

      <!-- Heads & Tails sub-section -->
      <div class="mt-4 pt-4 border-t border-brown/20 print:border-gray-300">
        <p class="text-xs text-parchment/50 font-semibold uppercase tracking-wider mb-3 print:text-gray-600">
          Non-Beverage Spirits (Heads &amp; Tails)
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (WG)</div>
            <div class="text-parchment print:text-black">{{ headsAndTails.headsWG.toFixed(2) }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (PG)</div>
            <div class="text-parchment print:text-black">{{ headsAndTails.headsPG.toFixed(2) }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (WG)</div>
            <div class="text-parchment print:text-black">{{ headsAndTails.tailsWG.toFixed(2) }}</div>
          </div>
          <div>
            <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (PG)</div>
            <div class="text-parchment print:text-black">{{ headsAndTails.tailsPG.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Materials Used -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">
        Section 2 — Raw Materials Used
      </h3>
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
      <div v-else class="text-center py-6 text-parchment/50 text-sm">No materials data available</div>
    </div>

    <!-- Section 3: Disposition -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">
        Section 3 — Disposition of Spirits (Removed for Sale/Consumption)
      </h3>

      <div v-if="dispositionByProduct.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in dispositionByProduct"
              :key="row.product"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ row.product }}</td>
              <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ row.spiritType }}</td>
              <td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">{{ row.bottleSize }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.bottles.toLocaleString() }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ row.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black font-semibold">{{ row.wineGallons.toFixed(4) }}</td>
            </tr>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalDispositionBottles.toLocaleString() }}</td>
              <td class="py-2 px-3"></td>
              <td class="py-2 px-3 text-right text-gold print:text-black">{{ totalDispositionWG.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No bottling/disposition records for {{ monthLabel }}
      </div>

      <!-- DTC compliance note -->
      <div class="mt-4 pt-4 border-t border-brown/20 print:border-gray-300">
        <p class="text-xs text-parchment/50 print:text-gray-600">
          <strong class="text-parchment/60 print:text-gray-700">Direct-to-Consumer (Texas SB 1232):</strong>
          Direct sales to consumers are limited to 2 bottles (750mL or smaller) per person per 30-day period,
          for off-premises consumption only. Ensure DTC sales are tracked separately and do not exceed these limits.
        </p>
      </div>
    </div>

    <!-- Section 4: Storage / Barrel Inventory -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">
        Section 4 — Storage and Barrel Inventory
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">
            Entered Barrels This Month (WG)
          </div>
          <div class="text-parchment print:text-black font-semibold text-base">{{ barreledWG.toFixed(2) }}</div>
          <div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">
            {{ barreledThisMonth.length }} barrel{{ barreledThisMonth.length !== 1 ? 's' : '' }} filled
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">
            Total Barrel Inventory On Hand (WG)
          </div>
          <div class="text-parchment print:text-black font-semibold text-base">{{ onHandBarrelWG.toFixed(2) }}</div>
          <div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">
            {{ vesselStore.barrels.filter(b => b.contents?.length).length }} filled barrels
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">
            Estimated TX Excise Tax on Production
          </div>
          <div class="text-gold print:text-black font-bold text-base">${{ tabcTaxDue.toFixed(2) }}</div>
          <div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">
            {{ totalProductionWG.toFixed(2) }} WG x $2.40/gal
          </div>
        </div>
      </div>
    </div>

    <!-- Compliance reminders -->
    <div class="bg-brown/10 rounded-xl border border-brown/20 p-4 space-y-2 print:border-gray-300">
      <p class="text-xs font-semibold text-parchment/70 uppercase tracking-wider print:text-gray-700">
        TABC Filing Checklist
      </p>
      <ul class="text-xs text-parchment/50 space-y-1.5 list-none print:text-gray-600">
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          Production volumes verified against batch records
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          Disposition totals reconcile with production records and inventory
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          DTC sales within 2 bottles/person/30-day limit
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          Tasting room samples within 1 oz per product / 3 oz total per visit
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          Texas excise tax remittance prepared ($2.40/wine gallon produced)
        </li>
        <li class="flex items-start gap-2">
          <span class="text-green-400 shrink-0">[ ]</span>
          Report submitted via TABC Compliance Portal by {{ dueDate }}
        </li>
      </ul>
    </div>
  </div>
</template>
