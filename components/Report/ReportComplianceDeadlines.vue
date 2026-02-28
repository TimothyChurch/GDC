<script setup lang="ts">
/**
 * Compliance Deadlines Dashboard
 *
 * Displays all upcoming TTB and TABC filing deadlines with urgency indicators.
 * All deadline generation logic lives in composables/useComplianceDeadlines.ts
 */
import {
  urgencyClasses,
  urgencyLabel,
  formatDeadlineDate,
} from '~/composables/useComplianceDeadlines'

const props = defineProps<{
  tabcPermitExpiry?: string
}>()

const tabcPermitExpiryRef = computed(() => props.tabcPermitExpiry)

const {
  deadlines,
  overdueCounts,
  criticalCount,
  upcomingCount,
} = useComplianceDeadlines(tabcPermitExpiryRef)
</script>

<template>
  <div class="space-y-6">
    <!-- Header summary -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="rounded-xl border p-4 flex items-center gap-3"
        :class="(overdueCounts.ttb + overdueCounts.tabc) > 0
          ? 'border-red-500/40 bg-red-900/10'
          : 'border-green-500/20 bg-green-900/10'"
      >
        <UIcon
          :name="(overdueCounts.ttb + overdueCounts.tabc) > 0 ? 'i-lucide-alert-circle' : 'i-lucide-check-circle'"
          :class="(overdueCounts.ttb + overdueCounts.tabc) > 0 ? 'text-red-400 text-2xl' : 'text-green-400 text-2xl'"
        />
        <div>
          <div class="text-sm font-semibold" :class="(overdueCounts.ttb + overdueCounts.tabc) > 0 ? 'text-red-400' : 'text-green-400'">
            {{ overdueCounts.ttb + overdueCounts.tabc > 0
              ? `${overdueCounts.ttb + overdueCounts.tabc} Overdue`
              : 'Nothing Overdue' }}
          </div>
          <div class="text-xs text-parchment/50">
            <span v-if="overdueCounts.ttb > 0">TTB: {{ overdueCounts.ttb }} </span>
            <span v-if="overdueCounts.tabc > 0">TABC: {{ overdueCounts.tabc }}</span>
            <span v-if="overdueCounts.ttb + overdueCounts.tabc === 0">All filings current</span>
          </div>
        </div>
      </div>

      <div
        class="rounded-xl border p-4 flex items-center gap-3"
        :class="criticalCount > 0 ? 'border-orange-500/30 bg-orange-900/10' : 'border-brown/30 bg-charcoal'"
      >
        <UIcon
          name="i-lucide-clock"
          :class="criticalCount > 0 ? 'text-orange-400 text-2xl' : 'text-parchment/30 text-2xl'"
        />
        <div>
          <div class="text-sm font-semibold" :class="criticalCount > 0 ? 'text-orange-400' : 'text-parchment/50'">
            {{ criticalCount }} Due Within 3 Days
          </div>
          <div class="text-xs text-parchment/50">Requires immediate action</div>
        </div>
      </div>

      <div class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3">
        <UIcon name="i-lucide-calendar" class="text-blue-400 text-2xl" />
        <div>
          <div class="text-sm font-semibold text-parchment">{{ upcomingCount }} Upcoming</div>
          <div class="text-xs text-parchment/50">Within 21 days</div>
        </div>
      </div>
    </div>

    <!-- Quick navigation -->
    <ReportComplianceQuickLinks />

    <!-- Deadline list -->
    <div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
      <div class="p-4 border-b border-brown/20">
        <h3 class="text-sm font-semibold text-parchment/70">Filing Deadlines — 90 Day Window</h3>
        <p class="text-xs text-parchment/40 mt-0.5">Showing deadlines from 30 days ago through 90 days ahead</p>
      </div>

      <div v-if="deadlines.length > 0">
        <div
          v-for="deadline in deadlines"
          :key="deadline.id"
          class="flex items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-brown/10 last:border-0 transition-colors"
          :class="[urgencyClasses(deadline.urgency).row,
            deadline.urgency !== 'ok' ? 'pl-3' : 'pl-4']"
        >
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <span
              class="shrink-0 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mt-0.5"
              :class="deadline.agency === 'TTB'
                ? 'text-blue-400 bg-blue-900/20 border-blue-500/30'
                : 'text-amber-400 bg-amber-900/20 border-amber-500/30'"
            >
              {{ deadline.agency }}
            </span>

            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-parchment truncate">{{ deadline.title }}</span>
                <span v-if="deadline.formNumber" class="text-[10px] text-parchment/40 shrink-0">
                  {{ deadline.formNumber }}
                </span>
              </div>
              <div class="text-xs text-parchment/50 mt-0.5 truncate">{{ deadline.description }}</div>
              <div class="text-xs text-parchment/40 mt-0.5">Due: {{ formatDeadlineDate(deadline.dueDate) }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full border"
              :class="urgencyClasses(deadline.urgency).badge"
            >
              {{ urgencyLabel(deadline.urgency, deadline.daysUntil) }}
            </span>

            <NuxtLink v-if="deadline.route" :to="deadline.route">
              <UButton size="xs" variant="ghost" icon="i-lucide-arrow-right" class="text-parchment/50 hover:text-parchment" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-10 text-parchment/50 text-sm">
        No deadlines in window
      </div>
    </div>

    <!-- Reference information -->
    <ReportComplianceReference />
  </div>
</template>
