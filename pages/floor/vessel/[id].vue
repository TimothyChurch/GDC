<script setup lang="ts">
import { LazyModalTransferAction } from '#components'
import { STAGE_DISPLAY } from '~/composables/batchPipeline'
import type { TransferInput } from '~/types/interfaces/Transfer'

definePageMeta({ layout: 'floor', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const overlay = useOverlay()
const transferModal = overlay.create(LazyModalTransferAction)

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const vesselId = computed(() => route.params.id as string)
const vessel = computed(() => vesselStore.getVesselById(vesselId.value))

const primaryContent = computed(() => {
  const c = vessel.value?.contents || []
  if (c.length === 0) return null
  return [...c].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0]
})

const primaryBatch = computed(() => {
  if (!primaryContent.value?.batch) return null
  return batchStore.getBatchById(primaryContent.value.batch as unknown as string)
})

const recipeName = computed(() => {
  if (!primaryBatch.value?.recipe) return null
  return recipeStore.getRecipeById(primaryBatch.value.recipe as unknown as string)?.name || null
})

const stageColor = computed(() => {
  const stage = primaryBatch.value?.currentStage
  if (!stage) return 'neutral'
  return STAGE_DISPLAY[stage]?.color || 'neutral'
})

const STAGE_BAND: Record<string, string> = {
  blue: 'border-l-blue-500/70',
  orange: 'border-l-orange-500/70',
  yellow: 'border-l-yellow-500/70',
  copper: 'border-l-copper/70',
  emerald: 'border-l-emerald-500/70',
  sky: 'border-l-sky-500/70',
  amber: 'border-l-amber-500/70',
  purple: 'border-l-purple-500/70',
  pink: 'border-l-pink-500/70',
  cyan: 'border-l-cyan-500/70',
  rose: 'border-l-rose-500/70',
  green: 'border-l-green-500/70',
  neutral: 'border-l-brown/30',
}

const isFermenting = computed(() => primaryBatch.value?.currentStage === 'Fermenting')

function findSourcesForBatch(batchId: string) {
  const out: { vessel: string; volume: number; proof: number }[] = []
  for (const v of vesselStore.items) {
    const slot = (v.contents || []).find((c: any) => String(c.batch) === batchId)
    if (slot && slot.volume > 0) {
      const proof = (slot as any).proof ?? (slot.abv != null ? slot.abv * 2 : 0)
      out.push({ vessel: v._id, volume: slot.volume, proof })
    }
  }
  return out
}

async function openTransfer(prefill: Partial<TransferInput>) {
  await transferModal.open({ prefill })
}

async function moveAction() {
  if (!primaryBatch.value) return
  const sources = findSourcesForBatch(primaryBatch.value._id)
  await openTransfer({
    batch: primaryBatch.value._id,
    fromStage: primaryBatch.value.currentStage,
    sources,
    destinations: [],
    loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
  })
}

async function withdrawAction() {
  if (!primaryBatch.value) return
  const sources = findSourcesForBatch(primaryBatch.value._id)
  const totalVol = sources.reduce((s, x) => s + x.volume, 0)
  const totalPG = sources.reduce((s, x) => s + (x.volume * x.proof), 0)
  const avgProof = totalVol > 0 ? totalPG / totalVol : 0
  await openTransfer({
    type: 'tax_paid_withdrawal',
    batch: primaryBatch.value._id,
    fromStage: primaryBatch.value.currentStage,
    toStage: null,
    sources,
    destinations: totalVol > 0 ? [{ vessel: null, stage: null, volume: totalVol, proof: avgProof }] : [],
    loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
    ttbAccount: { from: null, to: 'tax_paid' },
  })
}

const goLogReading = () => {
  if (!primaryBatch.value) return
  router.push(`/floor/action/log-reading/${primaryBatch.value._id}`)
}

const fillBarColor = computed(() => {
  if (!vessel.value?.stats?.volume || !vessel.value?.current?.volume) return 'bg-brown/20'
  const pct = (vessel.value.current.volume / vessel.value.stats.volume) * 100
  if (pct < 30) return 'bg-blue-500/60'
  if (pct < 70) return 'bg-copper/60'
  return 'bg-gold/60'
})
const fillPct = computed(() => {
  if (!vessel.value?.stats?.volume || !vessel.value?.current?.volume) return 0
  return Math.min(100, (vessel.value.current.volume / vessel.value.stats.volume) * 100)
})
</script>

<template>
  <div v-if="!vessel" class="py-12 text-center text-parchment/50">
    <UIcon name="i-lucide-loader-2" class="text-3xl animate-spin mx-auto mb-2" />
    <p>Loading vessel…</p>
  </div>

  <div v-else class="space-y-4">
    <!-- Vessel header -->
    <div
      :class="[
        'bg-charcoal rounded-xl border border-brown/30 border-l-4 p-4',
        STAGE_BAND[stageColor] || STAGE_BAND.neutral,
      ]"
    >
      <div class="flex items-start justify-between mb-3 gap-2">
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond] truncate">
            {{ vessel.name }}
          </h1>
          <div class="text-sm text-parchment/60">{{ vessel.type }}</div>
        </div>
      </div>

      <div v-if="primaryBatch" class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-parchment/80">
          <UIcon
            v-if="STAGE_DISPLAY[primaryBatch.currentStage]?.icon"
            :name="STAGE_DISPLAY[primaryBatch.currentStage].icon"
          />
          <span class="font-medium">{{ primaryBatch.currentStage }}</span>
          <span v-if="recipeName" class="text-parchment/50">· {{ recipeName }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-parchment/40">Empty</div>

      <!-- Fill bar -->
      <div class="mt-3">
        <div class="flex justify-between text-xs text-parchment/50 mb-1 tabular-nums">
          <span>{{ +(vessel.current?.volume || 0).toFixed(1) }} {{ vessel.current?.volumeUnit || 'gal' }}</span>
          <span v-if="vessel.stats?.volume">/ {{ vessel.stats.volume }} {{ vessel.stats.volumeUnit || 'gal' }}</span>
        </div>
        <div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="fillBarColor"
            :style="{ width: `${fillPct}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Action menu -->
    <div class="space-y-2">
      <h2 class="text-sm font-semibold uppercase tracking-wider text-parchment/50 mb-2">
        Actions
      </h2>

      <FloorActionCard
        v-if="isFermenting"
        icon="i-lucide-thermometer"
        label="Log Reading"
        description="Record a gravity, ABV, or temperature reading"
        @click="goLogReading"
      />

      <FloorActionCard
        v-if="primaryBatch"
        icon="i-lucide-arrow-right-left"
        label="Move"
        description="Transfer between vessels or advance stage"
        @click="moveAction"
      />

      <FloorActionCard
        v-if="primaryBatch && primaryBatch.currentStage !== 'Bottled'"
        icon="i-lucide-package-check"
        label="Tax-Paid Withdrawal"
        description="Spirit leaves the bond"
        tone="success"
        @click="withdrawAction"
      />

      <FloorActionCard
        v-if="!primaryBatch"
        icon="i-lucide-info"
        label="Vessel is empty"
        description="Move spirit into this vessel from another vessel's detail screen."
        disabled
      />

      <NuxtLink :to="`/admin/vessels/${vessel._id}`" class="block">
        <FloorActionCard
          icon="i-lucide-monitor"
          label="Open in Desktop"
          description="View full vessel details and history"
        />
      </NuxtLink>
    </div>
  </div>
</template>
