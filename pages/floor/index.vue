<script setup lang="ts">
import { STAGE_DISPLAY } from '~/composables/batchPipeline'

definePageMeta({ layout: 'floor', middleware: ['auth'] })

const router = useRouter()
const { entries, counts } = useVesselBoard()

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

const showInUseOnly = ref(true)

const visibleEntries = computed(() =>
  showInUseOnly.value ? entries.value.filter((e) => e.fillVolume > 0) : entries.value
)

const goVessel = (id: string) => router.push(`/floor/vessel/${id}`)

const fillBarColor = (pct: number) => {
  if (pct === 0) return 'bg-brown/20'
  if (pct < 30) return 'bg-blue-500/60'
  if (pct < 70) return 'bg-copper/60'
  return 'bg-gold/60'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond]">
        Floor
      </h1>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors"
          :class="showInUseOnly ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
          @click="showInUseOnly = !showInUseOnly"
        >
          <UIcon :name="showInUseOnly ? 'i-lucide-eye' : 'i-lucide-eye-off'" />
          {{ showInUseOnly ? `${counts.inUse} in use` : `All ${counts.total}` }}
        </button>
      </div>
    </div>

    <p v-if="counts.needsAttention > 0" class="flex items-center gap-2 text-sm text-red-400">
      <UIcon name="i-lucide-bell-ring" />
      {{ counts.needsAttention }} {{ counts.needsAttention === 1 ? 'vessel needs' : 'vessels need' }} attention
    </p>

    <!-- Vessel tile grid — 2 cols on tablet portrait, single column on phones -->
    <div v-if="visibleEntries.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="entry in visibleEntries"
        :key="entry.vessel._id"
        :class="[
          'flex flex-col items-stretch text-left bg-charcoal rounded-xl border border-brown/30 border-l-4 p-4 active:bg-brown/10 transition-colors min-h-[120px]',
          STAGE_BAND[entry.stageColor] || STAGE_BAND.neutral,
        ]"
        @click="goVessel(entry.vessel._id)"
      >
        <div class="flex items-start justify-between mb-2 gap-2">
          <div class="min-w-0 flex-1">
            <div class="text-base font-semibold text-parchment truncate">{{ entry.vessel.name }}</div>
            <div class="text-xs text-parchment/60">{{ entry.vessel.type }}</div>
          </div>
          <span
            v-if="entry.needsAttention"
            class="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/20 text-red-400"
            :title="entry.attentionReason || ''"
          >
            <UIcon name="i-lucide-bell-ring" class="text-sm" />
          </span>
        </div>

        <div v-if="entry.stage" class="flex items-center gap-1.5 mb-2 text-sm text-parchment/80">
          <UIcon
            v-if="STAGE_DISPLAY[entry.stage]?.icon"
            :name="STAGE_DISPLAY[entry.stage].icon"
            class="text-sm"
          />
          {{ entry.stage }}<span v-if="entry.recipeName" class="text-parchment/50"> · {{ entry.recipeName }}</span>
        </div>
        <div v-else class="text-sm text-parchment/30 mb-2">Empty</div>

        <div class="mt-auto">
          <div class="flex justify-between text-xs text-parchment/50 mb-1 tabular-nums">
            <span>{{ +entry.fillVolume.toFixed(1) }} {{ entry.fillUnit }}</span>
            <span v-if="entry.capacity">/ {{ entry.capacity }}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-brown/20 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="fillBarColor(entry.fillPct)"
              :style="{ width: `${entry.fillPct}%` }"
            />
          </div>
        </div>
      </button>
    </div>

    <BaseEmptyState
      v-else-if="counts.total === 0"
      icon="i-lucide-container"
      title="No vessels yet"
      description="Add vessels in the desktop admin to see them here."
    />
    <BaseEmptyState
      v-else
      icon="i-lucide-eye-off"
      title="No vessels in use"
      :description="`${counts.total} vessels are currently empty. Toggle 'All' above to see them.`"
    />
  </div>
</template>
