<script setup lang="ts">
import { calculateProofGallons, toGallons } from '~/utils/proofGallons'
import { normalizeDistillingRuns } from '~/utils/distillingMigration'

/**
 * TABC Excise Tax Report
 *
 * Texas imposes excise tax on distilled spirits at $2.40 per gallon (wine gallons).
 * This is separate from the federal FET and is based on PRODUCTION (gallons produced),
 * not on removals like the federal tax.
 *
 * Tax Code § 201.43: Distiller's excise tax is $2.40 per gallon of distilled spirits
 * manufactured in Texas.
 *
 * Due date: 15th of the month following the reporting period.
 * Filed with TABC via the Compliance Portal along with the monthly production report.
 *
 * This report covers a calendar QUARTER for the quarterly excise tax filing option,
 * though monthly filing is also accepted. Most small distilleries file monthly.
 */

const props = defineProps<{
  month: string  // 'YYYY-MM'
}>()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

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

const TABC_TAX_RATE = 2.40 // $2.40 per wine gallon produced

// ─── Batches distilled this month ─────────────────────────────────────────────

const distilledBatches = computed(() =>
  batchStore.batches.filter(b => {
    const distDate = (b.stages as any)?.distilling?.startedAt
      ? new Date((b.stages as any).distilling.startedAt)
      : null
    return distDate && distDate >= monthStart.value && distDate <= monthEnd.value
  })
)

// ─── Production volume detail ─────────────────────────────────────────────────

interface TaxLine {
  batchId: string
  batchNumber: string
  recipe: string
  spiritType: string
  date: string
  heartsWineGallons: number
  headsWineGallons: number
  tailsWineGallons: number
  totalWineGallons: number
  taxableWineGallons: number  // hearts only — beverage spirits subject to tax
  taxDue: number
}

const taxLines = computed((): TaxLine[] => {
  return distilledBatches.value.map(batch => {
    const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    const runs = normalizeDistillingRuns((batch.stages as any)?.distilling)

    let heartsVol = 0, headsVol = 0, lateHeadsVol = 0, tailsVol = 0

    for (const run of runs) {
      if (run.runType !== 'spirit' || !run.collected) continue
      if (run.collected.hearts) {
        const h = run.collected.hearts
        heartsVol += toGallons(h.volume || 0, h.volumeUnit || 'gallon')
      }
      if (run.collected.heads) {
        const h = run.collected.heads
        headsVol += toGallons(h.volume || 0, h.volumeUnit || 'gallon')
      }
      if (run.collected.lateHeads) {
        const lh = run.collected.lateHeads
        lateHeadsVol += toGallons(lh.volume || 0, lh.volumeUnit || 'gallon')
      }
      if (run.collected.tails) {
        const t = run.collected.tails
        tailsVol += toGallons(t.volume || 0, t.volumeUnit || 'gallon')
      }
    }

    const totalWG = heartsVol + headsVol + lateHeadsVol + tailsVol
    const taxable = heartsVol  // only beverage spirits (hearts) are taxed
    return {
      batchId: batch._id,
      batchNumber: batch.batchNumber || batch._id.slice(-6).toUpperCase(),
      recipe: recipe?.name || 'Unknown',
      spiritType: recipe?.class || recipe?.type || 'Unknown',
      date: (batch.stages as any)?.distilling?.startedAt
        ? new Date((batch.stages as any).distilling.startedAt).toLocaleDateString()
        : '--',
      heartsWineGallons: heartsVol,
      headsWineGallons: headsVol,
      tailsWineGallons: tailsVol,
      totalWineGallons: totalWG,
      taxableWineGallons: taxable,
      taxDue: taxable * TABC_TAX_RATE,
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
})

// ─── Totals ────────────────────────────────────────────────────────────────────

const totalHeartsWG = computed(() => taxLines.value.reduce((s, l) => s + l.heartsWineGallons, 0))
const totalHeadsWG = computed(() => taxLines.value.reduce((s, l) => s + l.headsWineGallons, 0))
const totalTailsWG = computed(() => taxLines.value.reduce((s, l) => s + l.tailsWineGallons, 0))
const totalTaxableWG = computed(() => taxLines.value.reduce((s, l) => s + l.taxableWineGallons, 0))
const totalTaxDue = computed(() => totalTaxableWG.value * TABC_TAX_RATE)

// ─── Tax summary by spirit type ───────────────────────────────────────────────

const taxByType = computed(() => {
  const map = new Map<string, { wineGallons: number; taxDue: number; batches: number }>()
  taxLines.value.forEach(line => {
    const existing = map.get(line.spiritType) || { wineGallons: 0, taxDue: 0, batches: 0 }
    existing.wineGallons += line.taxableWineGallons
    existing.taxDue += line.taxDue
    existing.batches += 1
    map.set(line.spiritType, existing)
  })
  return Array.from(map.entries())
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.taxDue - a.taxDue)
})

// ─── Due date ─────────────────────────────────────────────────────────────────

const dueDate = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return new Date(nextYear, nextMonth - 1, 15).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
})

const isOverdue = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : m + 1
  const nextYear = m === 12 ? y + 1 : y
  return new Date() > new Date(nextYear, nextMonth - 1, 15)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Report header -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black">
            TABC Distilled Spirits Excise Tax Report
          </h2>
          <p class="text-xs text-parchment/60 mt-0.5 print:text-gray-500">
            Texas Tax Code § 201.43 — $2.40 per wine gallon produced
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

    <!-- Tax due highlight box -->
    <div
      class="rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      :class="isOverdue ? 'border-red-500/40 bg-red-900/10' : 'border-gold/30 bg-gold/5'"
    >
      <div>
        <div class="text-sm text-parchment/70 print:text-gray-600">Texas Excise Tax Due</div>
        <div class="text-3xl font-bold font-[Cormorant_Garamond] mt-1" :class="isOverdue ? 'text-red-400' : 'text-gold'">
          ${{ totalTaxDue.toFixed(2) }}
        </div>
        <div class="text-xs text-parchment/50 mt-1 print:text-gray-500">
          {{ totalTaxableWG.toFixed(4) }} wine gallons x ${{ TABC_TAX_RATE.toFixed(2) }}/gallon
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Due Date</div>
        <div class="text-sm font-semibold" :class="isOverdue ? 'text-red-400' : 'text-parchment print:text-black'">
          {{ dueDate }}
        </div>
        <div v-if="isOverdue" class="text-xs text-red-400 font-bold mt-1">OVERDUE — FILE IMMEDIATELY</div>
      </div>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ distilledBatches.length }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Distillation Batches</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment print:text-black">{{ totalHeartsWG.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Taxable WG (Hearts)</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-parchment/50 print:text-black">
          {{ (totalHeadsWG + totalTailsWG).toFixed(2) }}
        </div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Non-Taxable WG (H&amp;T)</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300">
        <div class="text-2xl font-bold text-gold print:text-black">${{ totalTaxDue.toFixed(2) }}</div>
        <div class="text-xs text-parchment/60 mt-1 print:text-gray-500">TX Excise Tax Due</div>
      </div>
    </div>

    <!-- Tax by spirit type -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Tax Liability by Spirit Type</h3>
      <div v-if="taxByType.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Batches</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Taxable WG</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Rate</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in taxByType"
              :key="row.type"
              class="border-b border-brown/10 print:border-gray-200"
            >
              <td class="py-2 px-3 text-parchment print:text-black font-medium">{{ row.type }}</td>
              <td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">{{ row.batches }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ row.wineGallons.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${{ TABC_TAX_RATE.toFixed(2) }}/gal</td>
              <td class="py-2 px-3 text-right text-gold print:text-black font-bold">${{ row.taxDue.toFixed(2) }}</td>
            </tr>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ distilledBatches.length }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalTaxableWG.toFixed(4) }}</td>
              <td class="py-2 px-3"></td>
              <td class="py-2 px-3 text-right text-gold print:text-black">${{ totalTaxDue.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No distillation batches in {{ monthLabel }}
      </div>
    </div>

    <!-- Batch-level detail -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300">
      <h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Batch Detail</h3>
      <div v-if="taxLines.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-brown/20 print:border-gray-300">
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Batch #</th>
              <th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Recipe / Spirit</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Hearts WG</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Heads WG</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tails WG</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Taxable WG</th>
              <th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th>
            </tr>
          </thead>
          <tbody>
            <NuxtLink
              v-for="line in taxLines"
              :key="line.batchId"
              :to="`/admin/batch/${line.batchId}`"
              custom
              v-slot="{ navigate }"
            >
              <tr
                class="border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200"
                @click="navigate"
              >
                <td class="py-2 px-3 text-parchment/70 print:text-gray-700">{{ line.date }}</td>
                <td class="py-2 px-3 text-parchment/60 print:text-gray-600 font-mono text-xs">{{ line.batchNumber }}</td>
                <td class="py-2 px-3 text-parchment print:text-black">
                  {{ line.recipe }}
                  <span class="text-parchment/50 text-xs ml-1 print:text-gray-500">({{ line.spiritType }})</span>
                </td>
                <td class="py-2 px-3 text-right text-parchment print:text-black">{{ line.heartsWineGallons.toFixed(3) }}</td>
                <td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">{{ line.headsWineGallons.toFixed(3) }}</td>
                <td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">{{ line.tailsWineGallons.toFixed(3) }}</td>
                <td class="py-2 px-3 text-right text-copper print:text-black font-semibold">{{ line.taxableWineGallons.toFixed(4) }}</td>
                <td class="py-2 px-3 text-right text-gold print:text-black font-bold">${{ line.taxDue.toFixed(2) }}</td>
              </tr>
            </NuxtLink>
            <tr class="border-t-2 border-brown/30 font-bold print:border-gray-400">
              <td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalHeartsWG.toFixed(3) }}</td>
              <td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">{{ totalHeadsWG.toFixed(3) }}</td>
              <td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">{{ totalTailsWG.toFixed(3) }}</td>
              <td class="py-2 px-3 text-right text-parchment print:text-black">{{ totalTaxableWG.toFixed(4) }}</td>
              <td class="py-2 px-3 text-right text-gold print:text-black">${{ totalTaxDue.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-6 text-parchment/50 text-sm">
        No distillation batches recorded for {{ monthLabel }}
      </div>
    </div>

    <!-- Compliance notice -->
    <div class="bg-brown/10 rounded-xl border border-brown/20 p-4 print:border-gray-300">
      <p class="text-xs text-parchment/50 leading-relaxed print:text-gray-600">
        <strong class="text-parchment/70 print:text-black">Note:</strong>
        Texas Tax Code § 201.43 imposes a $2.40 per gallon (wine gallon) excise tax on distilled spirits manufactured
        in Texas. Only beverage spirits (hearts cut) are subject to tax; non-potable fractions (heads and tails)
        are excluded provided they are properly documented. This report must reconcile with your TABC Monthly
        Production Report (same filing period). Remit payment with your monthly report via the TABC Compliance Portal.
      </p>
    </div>
  </div>
</template>
