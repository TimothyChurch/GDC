<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const now = new Date()
const selectedMonth = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
)

// CBMA rate tier — in production this would come from a settings store or user input
// Most small craft distilleries qualify for Tier 1 ($2.70/PG for first 100,000 PG)
const cbmaRate = ref<'tier1' | 'tier2' | 'standard'>('tier1')

const cbmaRateOptions = [
  { label: 'CBMA Tier 1 — $2.70/PG (first 100,000 PG)', value: 'tier1' },
  { label: 'CBMA Tier 2 — $13.34/PG (100,001–22,230,000 PG)', value: 'tier2' },
  { label: 'Standard Rate — $13.50/PG', value: 'standard' },
]

// YTD proof gallons removed BEFORE the selected month — needed for CBMA tier monitoring
// This value must be entered by the user for accurate tier tracking
const ytdProofGallons = ref<number>(0)

const months = computed(() => {
  const result: { label: string; value: string }[] = []
  const d = new Date()
  for (let i = 0; i < 12; i++) {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    result.push({
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `${y}-${String(m).padStart(2, '0')}`,
    })
    d.setMonth(d.getMonth() - 1)
  }
  return result
})
</script>

<template>
  <div>
    <AdminPageHeader
      title="TTB Excise Tax Return"
      subtitle="Federal Excise Tax on Distilled Spirits Removed for Consumption (Form 5000.24)"
      icon="i-lucide-receipt"
    >
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="(window as any).print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <!-- Controls -->
    <div class="flex flex-wrap items-end gap-4 mb-6 print:hidden">
      <!-- Month selector -->
      <div>
        <div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider">Reporting Period</div>
        <div class="flex flex-wrap items-center gap-1.5 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit">
          <button
            v-for="m in months"
            :key="m.value"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            :class="selectedMonth === m.value
              ? 'bg-gold/15 text-gold border border-gold/20'
              : 'text-parchment/50 hover:text-parchment/70 border border-transparent'"
            @click="selectedMonth = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- CBMA rate selector -->
      <div class="min-w-64">
        <div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider">CBMA Tax Rate</div>
        <USelect
          v-model="cbmaRate"
          :items="cbmaRateOptions"
          value-key="value"
          placeholder="Select CBMA rate tier"
          class="text-sm"
        />
      </div>

      <!-- YTD PG input -->
      <div>
        <div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider">
          YTD Proof Gallons Removed (before this month)
        </div>
        <UInput
          v-model.number="ytdProofGallons"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          class="w-40 text-sm"
        />
      </div>
    </div>

    <ReportTTBExciseTax
      :month="selectedMonth"
      :cbma-rate="cbmaRate"
      :ytd-proof-gallons="ytdProofGallons"
    />
  </div>
</template>
