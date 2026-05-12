<script setup lang="ts">
import type { Batch } from '~/types'
import {
  STAGE_DISPLAY,
  STAGE_KEY_MAP,
  stageTextColor,
  stageBgColor,
  getStageVolume,
  getActiveStages,
  hasStageVolumes,
  getNextStage,
} from '~/composables/batchPipeline'
import { formatVolume } from '~/utils/formatting'

const props = defineProps<{
  batch: Batch
  // Stages that currently have a valid forward-advance action available.
  advancableStages: string[]
  // Whether Barrel Aging manages its own advancement via linked barrels (if so, suppress generic advance button).
  barrelAgingHasBarrels: boolean
}>()

const emit = defineEmits<{
  selectStage: [stage: string]
  advanced: []
}>()

const vesselStore = useVesselStore()

// Stages to display: every stage that currently holds volume (including
// Upcoming when a batch is partially advanced), plus the next stage the
// batch will advance to. Upcoming gets its own card so split batches can
// be advanced from either side.
const kanbanStages = computed<string[]>(() => {
  const list: string[] = []
  const active = hasStageVolumes(props.batch)
    ? getActiveStages(props.batch)
    : [props.batch.currentStage]

  for (const s of active) if (!list.includes(s)) list.push(s)

  // "Next stage" — from the latest non-Upcoming active stage (by pipeline
  // order), show the first stage after it. (Upcoming's "next" is the first
  // pipeline stage, which we handle separately so it doesn't push past
  // genuine progress on a split batch.)
  const lastActiveProduction = [...props.batch.pipeline]
    .reverse()
    .find(s => list.includes(s)) || props.batch.currentStage
  let next: string | null | undefined = null
  if (lastActiveProduction === 'Upcoming' || (!lastActiveProduction && props.batch.currentStage === 'Upcoming')) {
    next = props.batch.pipeline[0]
  } else if (lastActiveProduction) {
    next = getNextStage(props.batch.pipeline, lastActiveProduction)
  }
  if (next && !list.includes(next)) list.push(next)

  // Sort by pipeline order (Upcoming first, then pipeline order) so the
  // flow reads left-to-right.
  const orderOf = (s: string) =>
    s === 'Upcoming' ? -1 : props.batch.pipeline.indexOf(s)
  return list.sort((a, b) => orderOf(a) - orderOf(b))
})

type CardData = {
  stage: string
  icon: string
  color: string
  isNext: boolean
  vesselName: string | null
  volume: number
  volumeUnit: string
  abv: number | null
  runCount: number | null
  barrelCount: number | null
  startedAt: Date | string | null
  completed: boolean
}

const shortUnit = (u: string) => u.replace(/gallon/i, 'gal').replace(/liter/i, 'L')

// Pull the useful stats off each stage's data blob. Different stages store ABV in different places,
// so we look at the common ones in order.
const getStageStats = (stage: string): CardData => {
  const display = STAGE_DISPLAY[stage] || { icon: 'i-lucide-circle', color: 'neutral' }
  const stageKey = STAGE_KEY_MAP[stage]
  const stageData: any = stageKey ? getStage(props.batch, stageKey) : null

  const volume = getStageVolume(props.batch, stage)
  const volumeUnit = props.batch.batchSizeUnit || 'gallon'

  const vesselId = stageData?.vessel as string | undefined
  const vesselName = vesselId ? (vesselStore.getVesselById(vesselId)?.name ?? null) : null

  let abv: number | null = null
  if (stageData) {
    abv = stageData.abv
      ?? stageData.estimatedAbv
      ?? stageData.exit?.abv
      ?? stageData.entry?.abv
      ?? null
  }

  // Derived: run counts for distillation stages, barrel count for barrel aging.
  let runCount: number | null = null
  if (stage === 'Stripping Run' || stage === 'Spirit Run' || stage === 'Distilling') {
    runCount = stageData?.runs?.length ?? 0
  }

  let barrelCount: number | null = null
  if (stage === 'Barrel Aging') {
    barrelCount = vesselStore.vessels.filter(v =>
      v.type === 'Barrel' && v.contents?.some(c => c.batch === props.batch._id)
    ).length
  }

  const isNext = volume <= 0 && !stageData?.startedAt

  return {
    stage,
    icon: display.icon,
    color: display.color,
    isNext,
    vesselName,
    volume,
    volumeUnit,
    abv: typeof abv === 'number' && abv > 0 ? abv : null,
    runCount,
    barrelCount,
    startedAt: stageData?.startedAt || null,
    completed: !!stageData?.completedAt,
  }
}

const cards = computed<CardData[]>(() => kanbanStages.value.map(getStageStats))

const formatDate = (d: Date | string | null) => {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div v-if="cards.length === 0" class="text-sm text-parchment/50 italic py-6 text-center">
    No active stages yet.
  </div>
  <div
    v-else
    class="grid gap-4"
    :style="{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }"
  >
    <div
      v-for="card in cards"
      :key="card.stage"
      :class="[
        'flex flex-col rounded-xl border p-6 transition-all cursor-pointer hover:shadow-lg hover:border-opacity-60',
        stageBgColor(card.color),
        card.isNext ? 'opacity-60 border-dashed' : '',
      ]"
      @click="emit('selectStage', card.stage)"
    >
      <!-- Header -->
      <div class="flex items-center gap-2.5 mb-4">
        <UIcon :name="card.icon" :class="['text-xl', stageTextColor(card.color)]" />
        <h4 class="text-base font-bold text-parchment font-[Cormorant_Garamond] flex-1 truncate">
          {{ card.stage }}
        </h4>
        <UBadge v-if="card.isNext" variant="subtle" color="neutral" size="xs">Next</UBadge>
        <UBadge v-else-if="card.completed" variant="subtle" color="success" size="xs">Done</UBadge>
        <UBadge v-else variant="subtle" color="primary" size="xs">Active</UBadge>
      </div>

      <!-- Body: stats grow to fill, footer anchored to bottom via mt-auto. -->
      <div class="flex-1">
        <div v-if="!card.isNext">
          <!-- Volume + ABV -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Volume</div>
              <div class="text-xl font-bold text-parchment">
                <template v-if="card.volume > 0">
                  {{ formatVolume(card.volume) }}
                  <span class="text-sm font-normal text-parchment/50">{{ shortUnit(card.volumeUnit) }}</span>
                </template>
                <span v-else class="text-parchment/40">—</span>
              </div>
            </div>
            <div>
              <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">ABV</div>
              <div class="text-xl font-bold text-parchment">
                <template v-if="card.abv != null">{{ card.abv.toFixed(1) }}%</template>
                <span v-else class="text-parchment/40">—</span>
              </div>
            </div>
          </div>

          <!-- Meta: vessel / run count / barrel count / start date -->
          <div class="space-y-1.5 text-sm">
            <div v-if="card.vesselName" class="flex items-center gap-2 text-parchment/80">
              <UIcon name="i-lucide-box" class="shrink-0 text-base" />
              <span class="truncate">{{ card.vesselName }}</span>
            </div>
            <div v-if="card.runCount != null" class="flex items-center gap-2 text-parchment/80">
              <UIcon name="i-lucide-rotate-cw" class="shrink-0 text-base" />
              <span>{{ card.runCount }} {{ card.runCount === 1 ? 'run' : 'runs' }}</span>
            </div>
            <div v-if="card.barrelCount != null" class="flex items-center gap-2 text-parchment/80">
              <UIcon name="i-lucide-cylinder" class="shrink-0 text-base" />
              <span>{{ card.barrelCount }} {{ card.barrelCount === 1 ? 'barrel' : 'barrels' }}</span>
            </div>
            <div v-if="card.startedAt" class="flex items-center gap-2 text-parchment/60">
              <UIcon name="i-lucide-calendar" class="shrink-0 text-base" />
              <span>Since {{ formatDate(card.startedAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <UIcon name="i-lucide-arrow-right-circle" :class="['text-3xl mb-2', stageTextColor(card.color)]" />
          <div class="text-sm text-parchment/60 italic">Advance to begin</div>
        </div>
      </div>

      <!-- Footer: Details link on the left, Advance button on the right.
           mt-auto pins this to the bottom regardless of card body content length. -->
      <div class="mt-auto pt-4 border-t border-brown/20 flex items-center justify-between gap-2">
        <span :class="['text-xs font-medium', stageTextColor(card.color)]">Details →</span>
        <div
          v-if="!card.isNext && advancableStages.includes(card.stage) && (card.stage !== 'Barrel Aging' || !barrelAgingHasBarrels)"
          @click.stop
        >
          <TransferShortcutAdvanceStage
            :batch="batch"
            :source-stage="card.stage"
            @advanced="emit('advanced')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
