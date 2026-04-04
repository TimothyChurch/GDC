<script setup lang="ts">
import type { Batch, LowWinesStage, StrippingRunStage } from '~/types'
import { calculateProofGallons } from '~/utils/proofGallons'

const props = defineProps<{
  batch: Batch
  editing: boolean
}>()

const stage = computed(() => props.batch.stages?.lowWines as LowWinesStage | undefined)

// Also pull data from stripping run stage to show accumulated output
const strippingStage = computed(() => props.batch.stages?.strippingRun as StrippingRunStage | undefined)
const strippingRuns = computed(() => strippingStage.value?.runs || [])

// Low wines volume: from stage data (populated on advancement) or calculated from stripping output
const volume = computed(() => {
  if (stage.value?.volume) return stage.value.volume
  return strippingRuns.value.reduce((sum, r) => sum + (r.output?.volume || r.total?.volume || 0), 0)
})

const volumeUnit = computed(() => {
  if (stage.value?.volumeUnit) return stage.value.volumeUnit
  return strippingRuns.value[0]?.output?.volumeUnit || strippingRuns.value[0]?.total?.volumeUnit || 'gallon'
})

const abv = computed(() => {
  if (stage.value?.abv) return stage.value.abv
  const runsWithOutput = strippingRuns.value.filter(r => (r.output?.volume || r.total?.volume) && (r.output?.abv || r.total?.abv))
  if (runsWithOutput.length === 0) return 0
  const totalVol = runsWithOutput.reduce((s, r) => s + (r.output?.volume || r.total?.volume || 0), 0)
  if (totalVol === 0) return 0
  return runsWithOutput.reduce((s, r) => {
    const vol = r.output?.volume || r.total?.volume || 0
    const a = r.output?.abv || r.total?.abv || 0
    return s + vol * a
  }, 0) / totalVol
})

const proofGallons = computed(() => {
  if (stage.value?.proofGallons) return stage.value.proofGallons
  if (volume.value > 0 && abv.value > 0) {
    return calculateProofGallons(volume.value, volumeUnit.value, abv.value)
  }
  return 0
})

const sourceRunCount = computed(() => {
  return stage.value?.sourceRuns || strippingRuns.value.length
})

const startDate = computed(() => {
  if (!stage.value?.startedAt) return 'Not set'
  return new Date(stage.value.startedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
})

const shortUnit = computed(() => volumeUnit.value.replace(/gallon/i, 'gal').replace(/liter/i, 'L'))
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-amber-500/30 p-5">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-beaker" class="text-lg text-amber-400" />
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Low Wines</h3>
      <UBadge variant="subtle" color="warning" size="xs">Holding</UBadge>
    </div>

    <!-- Info -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
        <div class="text-sm text-parchment">{{ startDate }}</div>
      </div>
      <div>
        <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Source</div>
        <div class="text-sm text-parchment">{{ sourceRunCount }} stripping {{ sourceRunCount === 1 ? 'run' : 'runs' }}</div>
      </div>
    </div>

    <!-- Accumulated volume display -->
    <div class="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-3">Accumulated Low Wines</div>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-amber-400">
            {{ volume > 0 ? volume.toFixed(1) : '---' }}
          </div>
          <div class="text-xs text-parchment/50">{{ shortUnit }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-parchment">
            {{ abv > 0 ? abv.toFixed(1) + '%' : '---' }}
          </div>
          <div class="text-xs text-parchment/50">ABV</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-parchment">
            {{ proofGallons > 0 ? proofGallons.toFixed(2) : '---' }}
          </div>
          <div class="text-xs text-parchment/50">Proof Gallons</div>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="stage?.notes" class="mt-4">
      <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div>
      <div class="text-sm text-parchment/60">{{ stage.notes }}</div>
    </div>

    <!-- Empty state -->
    <div v-if="volume === 0" class="text-center py-4 text-parchment/50 text-sm mt-4">
      No low wines accumulated yet. Complete stripping runs to populate this stage.
    </div>
  </div>
</template>
