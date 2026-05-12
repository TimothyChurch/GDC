<script setup lang="ts">
import { stageTextColor, STAGE_DISPLAY } from '~/composables/batchPipeline'
import type { VesselBoardEntry } from '~/composables/useVesselBoard'

const props = defineProps<{ entry: VesselBoardEntry }>()

const router = useRouter()

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

const STAGE_PILL: Record<string, string> = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  copper: 'bg-copper/15 text-copper border-copper/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  sky: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  neutral: 'bg-brown/15 text-parchment/60 border-brown/30',
}

const bandClass = computed(() => STAGE_BAND[props.entry.stageColor] || STAGE_BAND.neutral)
const pillClass = computed(() => STAGE_PILL[props.entry.stageColor] || STAGE_PILL.neutral)
const stageIcon = computed(() => {
  const stage = props.entry.stage
  if (!stage) return null
  return STAGE_DISPLAY[stage]?.icon || null
})

const fillBarColor = computed(() => {
  if (props.entry.fillPct === 0) return 'bg-brown/20'
  if (props.entry.fillPct < 30) return 'bg-blue-500/60'
  if (props.entry.fillPct < 70) return 'bg-copper/60'
  return 'bg-gold/60'
})

const goToVessel = () => router.push(`/admin/vessels/${props.entry.vessel._id}`)
const goToBatch = (e: Event) => {
  e.stopPropagation()
  if (props.entry.primaryBatch?._id) {
    router.push(`/admin/batch/${props.entry.primaryBatch._id}`)
  }
}
</script>

<template>
  <div
    :class="[
      'bg-charcoal rounded-xl border border-brown/30 border-l-4 p-4 cursor-pointer transition-colors hover:border-brown/50',
      bandClass,
    ]"
    @click="goToVessel"
  >
    <!-- Header: vessel name + type, attention badge -->
    <div class="flex items-start justify-between mb-2 gap-2">
      <div class="min-w-0">
        <div class="text-sm font-medium text-parchment truncate">{{ entry.vessel.name }}</div>
        <div class="text-xs text-parchment/60">{{ entry.vessel.type || 'Vessel' }}</div>
      </div>
      <span
        v-if="entry.needsAttention"
        class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/15 text-red-400 border-red-500/30"
        :title="entry.attentionReason || 'Needs attention'"
      >
        <UIcon name="i-lucide-bell-ring" class="text-[11px]" />
        Attention
      </span>
    </div>

    <!-- Stage badge -->
    <div v-if="entry.stage" class="mb-3">
      <span
        :class="[
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
          pillClass,
        ]"
      >
        <UIcon v-if="stageIcon" :name="stageIcon" class="text-[11px]" />
        {{ entry.stage }}
      </span>
    </div>
    <div v-else class="mb-3">
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/15 text-parchment/40 border-brown/30">
        Empty
      </span>
    </div>

    <!-- Fill level bar -->
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-parchment/60">Fill</span>
        <span class="text-parchment/60">
          {{ +entry.fillVolume.toFixed(2) }} {{ entry.fillUnit }}<span v-if="entry.capacity" class="text-parchment/40"> / {{ entry.capacity }} {{ entry.fillUnit }}</span>
        </span>
      </div>
      <div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="fillBarColor"
          :style="{ width: `${entry.fillPct}%` }"
        />
      </div>
    </div>

    <!-- Contents: batch link -->
    <div v-if="entry.recipeName && entry.primaryBatch" class="flex items-center gap-1.5 mb-3 min-w-0">
      <UIcon name="i-lucide-flask-conical" class="text-xs text-parchment/40 shrink-0" />
      <button
        type="button"
        class="text-xs text-copper hover:text-gold transition-colors truncate underline-offset-2 hover:underline"
        :title="`Open batch: ${entry.recipeName}`"
        @click="goToBatch"
      >
        {{ entry.recipeName }}
      </button>
    </div>

    <!-- Primary action -->
    <div class="flex items-center justify-end gap-1">
      <UButton
        v-if="entry.primaryBatch"
        size="xs"
        variant="ghost"
        icon="i-lucide-arrow-right-left"
        color="neutral"
        class="text-copper hover:text-gold hover:bg-copper/10"
        @click.stop="goToBatch"
      >
        Open batch
      </UButton>
      <UButton
        v-else
        size="xs"
        variant="ghost"
        icon="i-lucide-eye"
        color="neutral"
        class="text-parchment/50 hover:text-parchment"
        @click.stop="goToVessel"
      >
        Details
      </UButton>
    </div>
  </div>
</template>
