<script setup lang="ts">
import type { ReportStatus, ReportDiscrepancy } from '~/composables/useReportStatus'

const props = withDefaults(defineProps<{
  /** YYYY-MM the report covers. Optional — undefined means "live, not period-scoped". */
  period?: string
  /** Override status from outside if the parent already computes it. */
  status?: ReportStatus
  /** Discrepancy list. Pass-through if the parent has a custom calculation. */
  discrepancies?: ReportDiscrepancy[]
  /** Transfer count for the period (purely informational). */
  transferCount?: number
  /** Whether this report has a downloadable file (enables Export PDF). */
  exportable?: boolean
  /** Optional pay.gov / TABC submission URL to surface on the strip. */
  submitUrl?: string
  submitLabel?: string
}>(), {
  exportable: true,
})

const loadedAt = ref(new Date())

const formattedDate = computed(() =>
  loadedAt.value.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
)

function refresh() {
  loadedAt.value = new Date()
}

function exportPdf() {
  if (typeof window !== 'undefined') window.print()
}

defineExpose({ refresh })

const STATUS_COPY: Record<ReportStatus, { label: string; classes: string; icon: string }> = {
  ready: {
    label: 'Ready to file',
    classes: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: 'i-lucide-check-circle-2',
  },
  review: {
    label: 'Review',
    classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    icon: 'i-lucide-eye',
  },
  discrepancies: {
    label: 'Discrepancies',
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: 'i-lucide-alert-triangle',
  },
  empty: {
    label: 'No data',
    classes: 'bg-brown/15 text-parchment/50 border-brown/25',
    icon: 'i-lucide-circle-dashed',
  },
}

const statusMeta = computed(() => STATUS_COPY[props.status || 'review'])
</script>

<template>
  <div class="space-y-3 mb-5 print:hidden">
    <!-- Status strip -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border border-brown/30 bg-charcoal/60">
      <!-- Live indicator + sync time -->
      <div class="flex items-center gap-2 text-xs text-parchment/50">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full rounded-full bg-green-400/40 animate-ping" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400/70" />
        </span>
        <span>Last sync</span>
        <span class="font-mono text-parchment/70">{{ formattedDate }}</span>
      </div>

      <!-- Period -->
      <div v-if="period" class="text-xs text-parchment/50 flex items-center gap-1.5">
        <UIcon name="i-lucide-calendar" />
        <span class="font-mono text-parchment/70">{{ period }}</span>
      </div>

      <!-- Transfer count -->
      <div v-if="transferCount !== undefined" class="text-xs text-parchment/50">
        <span class="text-parchment/70 font-medium">{{ transferCount }}</span>
        transfer{{ transferCount === 1 ? '' : 's' }} this period
      </div>

      <!-- Status badge -->
      <span
        v-if="status"
        :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', statusMeta.classes]"
      >
        <UIcon :name="statusMeta.icon" class="text-[12px]" />
        {{ statusMeta.label }}
      </span>

      <!-- Spacer + actions -->
      <div class="ml-auto flex items-center gap-2">
        <UButton
          variant="ghost"
          size="xs"
          icon="i-lucide-refresh-cw"
          color="neutral"
          @click="refresh"
        >
          Refresh
        </UButton>
        <UButton
          v-if="exportable"
          variant="outline"
          size="xs"
          icon="i-lucide-file-down"
          @click="exportPdf"
        >
          Export PDF
        </UButton>
        <a
          v-if="submitUrl"
          :href="submitUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <UButton size="xs" icon="i-lucide-external-link" color="primary">
            {{ submitLabel || 'Submit' }}
          </UButton>
        </a>
        <slot name="actions" />
      </div>
    </div>

    <!-- Discrepancies banner -->
    <div
      v-if="discrepancies && discrepancies.length > 0"
      class="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
    >
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-alert-triangle" class="text-red-400 text-xl shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-red-300 mb-2">
            {{ discrepancies.length }} {{ discrepancies.length === 1 ? 'item needs' : 'items need' }} review before filing
          </div>
          <ul class="space-y-1">
            <li
              v-for="d in discrepancies.slice(0, 5)"
              :key="d.id"
              class="text-xs text-red-200/80 flex items-start gap-2"
            >
              <span class="text-red-400/60">·</span>
              <NuxtLink
                v-if="d.link"
                :to="d.link"
                class="hover:text-red-200 underline-offset-2 hover:underline"
              >
                {{ d.message }}
              </NuxtLink>
              <span v-else>{{ d.message }}</span>
            </li>
            <li v-if="discrepancies.length > 5" class="text-xs text-red-300/50 italic ml-3">
              +{{ discrepancies.length - 5 }} more …
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
