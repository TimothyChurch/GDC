<script setup lang="ts">
/**
 * TABC Monthly Production and Disposition Report
 *
 * Texas Alcoholic Beverage Commission requires Distiller's and Rectifier's
 * permit holders to file monthly reports covering:
 *
 * PRODUCTION: Gallons of distilled spirits produced by spirit type (WG and PG)
 * DISPOSITION: How spirits left the DSP (bottled, sold, transferred)
 * INVENTORY: On-hand at beginning/end of period
 *
 * TABC reports in WINE GALLONS (not proof gallons like TTB).
 * Texas excise tax is $2.40 per wine gallon of spirits produced.
 * Reports due by the 15th of the following month.
 */

const props = defineProps<{
  month: string  // 'YYYY-MM'
}>()

const monthRef = computed(() => props.month)

const {
  monthLabel,
  dueDate,
  isOverdue,
  distilledBatches,
  productionByType,
  totalProductionWG,
  totalProductionPG,
  headsAndTails,
  materialsUsed,
  dispositionByProduct,
  totalDispositionWG,
  totalDispositionBottles,
  barreledThisMonth,
  barreledWG,
  onHandBarrelWG,
  tabcTaxDue,
  vesselStore,
} = useTABCCalculations(monthRef)
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
            <tr v-for="row in productionByType" :key="row.type" class="border-b border-brown/10 print:border-gray-200">
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
            <tr v-for="mat in materialsUsed" :key="mat.name" class="border-b border-brown/10 print:border-gray-200">
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
            <tr v-for="row in dispositionByProduct" :key="row.product" class="border-b border-brown/10 print:border-gray-200">
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
