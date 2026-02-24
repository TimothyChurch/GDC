<script setup lang="ts">
import { calculateProofGallons, toGallons } from '~/utils/proofGallons'

/**
 * TTB Excise Tax Report — Form 5000.24
 *
 * Federal excise tax (FET) applies to distilled spirits REMOVED FOR CONSUMPTION
 * or sale, i.e., spirits that leave the bonded premises (bottled and distributed
 * or sold directly from the tasting room).
 *
 * Standard rate:    $13.50 / proof gallon
 * CBMA Tier 1:       $2.70 / proof gallon (first 100,000 PG domestically produced)
 * CBMA Tier 2:      $13.34 / proof gallon (next 22,130,000 PG)
 * Above 22,230,000: $13.50 / proof gallon
 *
 * Semi-monthly deposit schedule:
 *   Period 1 (1st–15th):     deposit due by the 29th of the same month
 *   Period 2 (16th–end):     deposit due by the 14th of the following month
 *
 * Spirits "removed" = production records (bottling runs), because the system
 * models transfer from bonded to taxpaid status at the bottling/production event.
 * For a DSP that also runs a tasting room, additional removals would be tracked
 * separately; this report surfaces all production records as removals.
 */

const props = defineProps<{
  month: string   // 'YYYY-MM'
  cbmaRate: 'tier1' | 'tier2' | 'standard'  // which CBMA rate tier applies
  ytdProofGallons?: number  // proof gallons removed so far this calendar year BEFORE this month
}>()

const productionStore = useProductionStore()
const bottleStore = useBottleStore()

// ─── Date helpers ────────────────────────────────────────────────────────────

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

// ─── CBMA Rate Logic ─────────────────────────────────────────────────────────

// CBMA Tier 1: $2.70/PG for first 100,000 PG of domestically produced spirits
// Tier 2: $13.34/PG for next 22,130,000 PG
// Standard: $13.50/PG above that

const CBMA_TIER1_LIMIT = 100_000       // PG
const CBMA_TIER2_LIMIT = 22_230_000    // PG (100k + 22.13M)

const TAX_RATE_TIER1 = 2.70
const TAX_RATE_TIER2 = 13.34
const TAX_RATE_STANDARD = 13.50

function getRateLabel(rate: 'tier1' | 'tier2' | 'standard'): string {
  if (rate === 'tier1') return `CBMA Reduced Rate — $${TAX_RATE_TIER1.toFixed(2)}/PG (first 100,000 PG)`
  if (rate === 'tier2') return `CBMA Reduced Rate — $${TAX_RATE_TIER2.toFixed(2)}/PG (100,001–22,230,000 PG)`
  return `Standard Rate — $${TAX_RATE_STANDARD.toFixed(2)}/PG`
}

function getApplicableRate(rate: 'tier1' | 'tier2' | 'standard'): number {
  if (rate === 'tier1') return TAX_RATE_TIER1
  if (rate === 'tier2') return TAX_RATE_TIER2
  return TAX_RATE_STANDARD
}

// ─── Volume conversion for bottles ──────────────────────────────────────────

function bottleToWineGallons(bottle: { volume?: number; volumeUnit?: string }): number {
  const vol = bottle.volume || 750
  const unit = (bottle.volumeUnit || 'mL').toLowerCase()
  if (unit === 'ml' || unit.includes('milli')) return vol * 0.000264172
  if (unit === 'l' || unit.includes('liter')) return vol * 0.264172
  if (unit.includes('oz')) return vol * 0.0078125
  if (unit.includes('gal')) return vol
  return vol * 0.000264172  // default: assume mL
}

// ─── Productions (removals) this month ──────────────────────────────────────

const monthlyRemovals = computed(() =>
  productionStore.productions.filter(p => {
    const d = new Date(p.date)
    return d >= monthStart.value && d <= monthEnd.value
  })
)

// Period 1: days 1–15; Period 2: days 16–end
const period1Removals = computed(() =>
  monthlyRemovals.value.filter(p => new Date(p.date).getDate() <= 15)
)
const period2Removals = computed(() =>
  monthlyRemovals.value.filter(p => new Date(p.date).getDate() > 15)
)

// ─── Calculate proof gallons per removal line ────────────────────────────────

interface RemovalLine {
  _id: string
  date: string
  product: string
  spiritType: string
  quantity: number
  bottleSize: string
  wineGallons: number
  abv: number
  proofGallons: number
  taxDue: number
}

function buildRemovalLines(productions: typeof monthlyRemovals.value): RemovalLine[] {
  const rate = getApplicableRate(props.cbmaRate)
  return productions.map(p => {
    const bottle = bottleStore.getBottleById(p.bottle)
    const abv = bottle?.abv || 0
    const wgPerBottle = bottle ? bottleToWineGallons(bottle) : 0
    const totalWG = wgPerBottle * (p.quantity || 0)
    const totalPG = calculateProofGallons(totalWG, 'gallon', abv)
    return {
      _id: p._id,
      date: new Date(p.date).toLocaleDateString(),
      product: bottle?.name || 'Unknown Product',
      spiritType: bottle?.class || bottle?.type || 'Unknown',
      quantity: p.quantity || 0,
      bottleSize: bottle ? `${bottle.volume || 750}${bottle.volumeUnit || 'mL'}` : '--',
      wineGallons: totalWG,
      abv,
      proofGallons: totalPG,
      taxDue: totalPG * rate,
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
}

const period1Lines = computed(() => buildRemovalLines(period1Removals.value))
const period2Lines = computed(() => buildRemovalLines(period2Removals.value))
const allLines = computed(() => buildRemovalLines(monthlyRemovals.value))

// ─── Aggregated by product (for summary section) ─────────────────────────────

const removalsByProduct = computed(() => {
  const rate = getApplicableRate(props.cbmaRate)
  const map = new Map<string, {
    product: string
    spiritType: string
    bottles: number
    wineGallons: number
    proofGallons: number
    taxDue: number
  }>()

  allLines.value.forEach(line => {
    const existing = map.get(line.product) || {
      product: line.product,
      spiritType: line.spiritType,
      bottles: 0,
      wineGallons: 0,
      proofGallons: 0,
      taxDue: 0,
    }
    existing.bottles += line.quantity
    existing.wineGallons += line.wineGallons
    existing.proofGallons += line.proofGallons
    existing.taxDue += line.proofGallons * rate
    map.set(line.product, existing)
  })

  return Array.from(map.values()).sort((a, b) => b.proofGallons - a.proofGallons)
})

// ─── Totals ───────────────────────────────────────────────────────────────────

const totalWG = computed(() => allLines.value.reduce((s, l) => s + l.wineGallons, 0))
const totalPG = computed(() => allLines.value.reduce((s, l) => s + l.proofGallons, 0))
const totalTax = computed(() => totalPG.value * getApplicableRate(props.cbmaRate))

const period1PG = computed(() => period1Lines.value.reduce((s, l) => s + l.proofGallons, 0))
const period1Tax = computed(() => period1PG.value * getApplicableRate(props.cbmaRate))

const period2PG = computed(() => period2Lines.value.reduce((s, l) => s + l.proofGallons, 0))
const period2Tax = computed(() => period2PG.value * getApplicableRate(props.cbmaRate))

// ─── YTD tracking for CBMA tier monitoring ───────────────────────────────────

const ytdAfterMonth = computed(() =>
  (props.ytdProofGallons || 0) + totalPG.value
)

const cbmaTier1Remaining = computed(() =>
  Math.max(0, CBMA_TIER1_LIMIT - ytdAfterMonth.value)
)

// ─── Deposit due dates ────────────────────────────────────────────────────────

const period1DueDate = computed(() => {
  // Period 1 (1st–15th): deposit due the 29th of the same month
  const [y, m] = props.month.split('-').map(Number)
  return new Date(y, m - 1, 29).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const period2DueDate = computed(() => {
  // Period 2 (16th–end): deposit due the 14th of the following month
  const [y, m] = props.month.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return new Date(nextYear, nextMonth - 1, 14).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const now = new Date()
const period1Overdue = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  return now > new Date(y, m - 1, 29) && period1PG.value > 0
})
const period2Overdue = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return now > new Date(nextYear, nextMonth - 1, 14) && period2PG.value > 0
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
          TTB Excise Tax Return
        </h2>
        <span class="text-xs text-parchment/60 print:text-gray-500">Form 5000.24</span>
      </div>
      <p class="text-sm text-parchment/60 print:text-gray-600">
        Reporting Period: {{ monthLabel }}
      </p>
      <p class="text-xs text-parchment/50 mt-1 print:text-gray-500">
        Applied rate: {{ getRateLabel(cbmaRate) }}
      </p>
    </div>

    <!-- Deposit schedule warning boxes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
      <div
        class="rounded-lg border p-4"
        :class="period1Overdue ? 'border-red-500/50 bg-red-900/20' : 'border-brown/30 bg-charcoal'"
      >
        <div class="flex items-start gap-3">
          <UIcon
            :name="period1Overdue ? 'i-lucide-alert-triangle' : 'i-lucide-calendar-check'"
            :class="period1Overdue ? 'text-red-400 text-lg mt-0.5' : 'text-blue-400 text-lg mt-0.5'"
          />
          <div>
            <div class="text-sm font-semibold text-parchment">
              Period 1 Deposit (Days 1–15)
            </div>
            <div class="text-xs text-parchment/60 mt-0.5">
              Due: {{ period1DueDate }}
              <span v-if="period1Overdue" class="text-red-400 font-semibold ml-1">OVERDUE</span>
            </div>
            <div class="text-base font-bold mt-1" :class="period1Overdue ? 'text-red-400' : 'text-gold'">
              ${{ period1Tax.toFixed(2) }}
              <span class="text-xs font-normal text-parchment/50 ml-1">({{ period1PG.toFixed(2) }} PG)</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-lg border p-4"
        :class="period2Overdue ? 'border-red-500/50 bg-red-900/20' : 'border-brown/30 bg-charcoal'"
      >
        <div class="flex items-start gap-3">
          <UIcon
            :name="period2Overdue ? 'i-lucide-alert-triangle' : 'i-lucide-calendar-check'"
            :class="period2Overdue ? 'text-red-400 text-lg mt-0.5' : 'text-blue-400 text-lg mt-0.5'"
          />
          <div>
            <div class="text-sm font-semibold text-parchment">
              Period 2 Deposit (Days 16–End)
            </div>
            <div class="text-xs text-parchment/60 mt-0.5">
              Due: {{ period2DueDate }}
              <span v-if="period2Overdue" class="text-red-400 font-semibold ml-1">OVERDUE</span>
            </div>
            <div class="text-base font-bold mt-1" :class="period2Overdue ? 'text-red-400' : 'text-gold'">
              ${{ period2Tax.toFixed(2) }}
              <span class="text-xs font-normal text-parchment/50 ml-1">({{ period2PG.toFixed(2) }} PG)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ monthlyRemovals.length }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Removal Events</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalWG.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Removed</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-copper print:text-black">{{ totalPG.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons Taxable</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">${{ totalTax.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Total Tax Due</div>
      </div>
    </div>

    <!-- CBMA tier monitoring -->
    <div class="bg-charcoal rounded-xl border border-blue-500/20 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-blue-400 mb-3 print:text-black">CBMA Tier 1 Monitoring</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">YTD Before This Month</div>
          <div class="text-parchment print:text-black font-medium">{{ (ytdProofGallons || 0).toFixed(2) }} PG</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">This Month</div>
          <div class="text-parchment print:text-black font-medium">{{ totalPG.toFixed(2) }} PG</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tier 1 Remaining (100,000 PG limit)</div>
          <div class="font-semibold" :class="cbmaTier1Remaining === 0 ? 'text-red-400' : 'text-green-400'">
            {{ cbmaTier1Remaining > 0 ? cbmaTier1Remaining.toFixed(2) + ' PG' : 'TIER 1 EXHAUSTED' }}
          </div>
        </div>
      </div>
      <p class="text-xs text-parchment/40 mt-3 print:text-gray-500">
        CBMA Tier 1 rate of $2.70/PG applies to the first 100,000 proof gallons domestically produced and removed per calendar year.
        Ensure your annual assignment of CBMA credits to TTB is current before claiming reduced rates.
      </p>
    </div>

    <!-- Tax liability by product -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Tax Liability by Product</h3>
      <div v-if="removalsByProduct.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in removalsByProduct"
              :key="row.product"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ row.product }}</td>
              <td class="py-2 px-3 text-parchment/60 print:text-gray-600">{{ row.spiritType }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.bottles.toLocaleString() }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.wineGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ row.proofGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black font-bold">${{ row.taxDue.toFixed(2) }}</td>
            </tr>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="2">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">
                {{ removalsByProduct.reduce((s, r) => s + r.bottles, 0).toLocaleString() }}
              </td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalWG.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalPG.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">${{ totalTax.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No removals recorded for {{ monthLabel }}
      </div>
    </div>

    <!-- Period 1 detail -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-parchment/70 print:text-black">
          Period 1 Detail — Days 1–15 (Deposit due {{ period1DueDate }})
        </h3>
        <span class="text-xs font-bold text-gold">${{ period1Tax.toFixed(2) }}</span>
      </div>
      <div v-if="period1Lines.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="line in period1Lines"
              :key="line._id"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ line.date }}</td>
              <td class="py-2 px-3 text-parchment print:text-black">{{ line.product }}</td>
              <td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">{{ line.bottleSize }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ line.quantity }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ line.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-copper print:text-black">{{ line.proofGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black font-semibold">${{ line.taxDue.toFixed(2) }}</td>
            </tr>
            <tr class="border-t border-brown/20 font-semibold print:border-gray-300">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="5">Period 1 Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ period1PG.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">${{ period1Tax.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-4 text-parchment/50 text-sm">No removals in Period 1</div>
    </div>

    <!-- Period 2 detail -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-parchment/70 print:text-black">
          Period 2 Detail — Days 16–End (Deposit due {{ period2DueDate }})
        </h3>
        <span class="text-xs font-bold text-gold">${{ period2Tax.toFixed(2) }}</span>
      </div>
      <div v-if="period2Lines.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th>
              <th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="line in period2Lines"
              :key="line._id"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ line.date }}</td>
              <td class="py-2 px-3 text-parchment print:text-black">{{ line.product }}</td>
              <td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">{{ line.bottleSize }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ line.quantity }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">{{ line.abv.toFixed(1) }}%</td>
              <td class="py-2 px-3 text-right text-copper print:text-black">{{ line.proofGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black font-semibold">${{ line.taxDue.toFixed(2) }}</td>
            </tr>
            <tr class="border-t border-brown/20 font-semibold print:border-gray-300">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="5">Period 2 Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ period2PG.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">${{ period2Tax.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-4 text-parchment/50 text-sm">No removals in Period 2</div>
    </div>

    <!-- Compliance notice -->
    <div class="bg-brown/10 rounded-xl border border-brown/20 p-4 print:border-gray-300">
      <p class="text-xs text-parchment/50 leading-relaxed print:text-gray-600">
        <strong class="text-parchment/70 print:text-black">Important:</strong>
        Federal excise tax (FET) applies to all distilled spirits removed from your bonded premises for consumption or sale.
        This report derives removals from bottling/production records. Tasting room pours and any other removals not captured
        as production records must be added manually before filing. File Form 5000.24 electronically via Pay.gov.
        Quarterly returns are available for taxpayers whose FET liability does not exceed $50,000/year (27 CFR 19.235).
        Consult your TTB Specialist or a compliance attorney before filing.
      </p>
    </div>
  </div>
</template>
