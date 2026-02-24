<script setup lang="ts">
/**
 * Compliance Deadlines Dashboard
 *
 * Displays all upcoming TTB and TABC filing deadlines with urgency indicators.
 * Covers:
 *
 * FEDERAL (TTB):
 *   - Monthly production report (Form 5110.11) — due 15th of following month
 *   - Monthly storage report — due 15th of following month
 *   - Monthly processing report (Form 5110.28) — due 15th of following month
 *   - Federal excise tax, Period 1 (1st–15th) — due 29th same month
 *   - Federal excise tax, Period 2 (16th–end) — due 14th following month
 *   - Annual physical inventory — due January 15th (for prior year)
 *   - CBMA annual report — due January 31st
 *
 * STATE (TABC):
 *   - Monthly production and disposition report — due 15th of following month
 *   - Monthly excise tax remittance — due 15th of following month
 *   - TABC permit renewal — annually (date varies by permit)
 */

const props = defineProps<{
  tabcPermitExpiry?: string  // ISO date string — when TABC permit expires
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type UrgencyLevel = 'overdue' | 'critical' | 'warning' | 'upcoming' | 'ok'

interface Deadline {
  id: string
  agency: 'TTB' | 'TABC'
  title: string
  description: string
  dueDate: Date
  daysUntil: number
  urgency: UrgencyLevel
  route?: string
  formNumber?: string
  period: string
}

function urgencyFromDays(days: number): UrgencyLevel {
  if (days < 0) return 'overdue'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  if (days <= 21) return 'upcoming'
  return 'ok'
}

// ─── Build deadline list ───────────────────────────────────────────────────────

const deadlines = computed((): Deadline[] => {
  const list: Deadline[] = []

  // Look ahead 90 days, look back 30 days
  const windowStart = addDays(today, -30)
  const windowEnd = addDays(today, 90)

  // Iterate over months in window
  const cursor = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1)
  while (cursor <= windowEnd) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()  // 0-indexed

    // Month label for the reporting period (this is the month BEFORE the due date)
    const reportingMonth = new Date(y, m - 1, 1)
    const reportingLabel = reportingMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // ── TTB Monthly Reports (due 15th of month following reporting period) ──
    const ttbMonthlyDue = new Date(y, m, 15)
    if (ttbMonthlyDue >= windowStart && ttbMonthlyDue <= windowEnd) {
      const daysUntilMonthly = daysBetween(today, ttbMonthlyDue)
      const monthReportingKey = `${y}-${String(m).padStart(2, '0')}`

      list.push({
        id: `ttb-production-${monthReportingKey}`,
        agency: 'TTB',
        title: 'TTB Production Report',
        description: `Monthly Report of Production Operations for ${reportingLabel}`,
        dueDate: ttbMonthlyDue,
        daysUntil: daysUntilMonthly,
        urgency: urgencyFromDays(daysUntilMonthly),
        route: '/admin/reports/ttb-production',
        formNumber: 'Form 5110.11',
        period: reportingLabel,
      })
      list.push({
        id: `ttb-storage-${monthReportingKey}`,
        agency: 'TTB',
        title: 'TTB Storage Report',
        description: `Storage Operations Report for ${reportingLabel}`,
        dueDate: ttbMonthlyDue,
        daysUntil: daysUntilMonthly,
        urgency: urgencyFromDays(daysUntilMonthly),
        route: '/admin/reports/ttb-storage',
        formNumber: 'Form 5110.11',
        period: reportingLabel,
      })
      list.push({
        id: `ttb-processing-${monthReportingKey}`,
        agency: 'TTB',
        title: 'TTB Processing Report',
        description: `Monthly Report of Processing Operations for ${reportingLabel}`,
        dueDate: ttbMonthlyDue,
        daysUntil: daysUntilMonthly,
        urgency: urgencyFromDays(daysUntilMonthly),
        route: '/admin/reports/ttb-processing',
        formNumber: 'Form 5110.28',
        period: reportingLabel,
      })

      // ── TABC Monthly Report — same due date as TTB ──
      list.push({
        id: `tabc-monthly-${monthReportingKey}`,
        agency: 'TABC',
        title: 'TABC Monthly Report',
        description: `Texas Monthly Production and Disposition Report for ${reportingLabel}`,
        dueDate: ttbMonthlyDue,
        daysUntil: daysUntilMonthly,
        urgency: urgencyFromDays(daysUntilMonthly),
        route: '/admin/reports/tabc-monthly',
        period: reportingLabel,
      })
      list.push({
        id: `tabc-excise-${monthReportingKey}`,
        agency: 'TABC',
        title: 'TABC Excise Tax Remittance',
        description: `Texas distilled spirits excise tax ($2.40/WG) for ${reportingLabel}`,
        dueDate: ttbMonthlyDue,
        daysUntil: daysUntilMonthly,
        urgency: urgencyFromDays(daysUntilMonthly),
        route: '/admin/reports/tabc-excise-tax',
        period: reportingLabel,
      })
    }

    // ── TTB FET Period 1 deposit: 1st–15th of prior month, due 29th ──
    // The "prior month" is m-1
    const fetPeriod1Month = new Date(y, m - 1, 1)
    const fetPeriod1Label = fetPeriod1Month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const fetPeriod1Due = new Date(y, m - 1, 29)
    if (fetPeriod1Due >= windowStart && fetPeriod1Due <= windowEnd) {
      const daysUntilP1 = daysBetween(today, fetPeriod1Due)
      list.push({
        id: `ttb-fet-p1-${y}-${m}`,
        agency: 'TTB',
        title: 'FET Period 1 Deposit',
        description: `Federal excise tax deposit for ${fetPeriod1Label} days 1–15`,
        dueDate: fetPeriod1Due,
        daysUntil: daysUntilP1,
        urgency: urgencyFromDays(daysUntilP1),
        route: '/admin/reports/ttb-excise-tax',
        formNumber: 'Form 5000.24',
        period: `${fetPeriod1Label} (days 1–15)`,
      })
    }

    // ── TTB FET Period 2 deposit: 16th–end of prior month, due 14th of current month ──
    const fetPeriod2Due = new Date(y, m, 14)
    const fetPeriod2PriorMonth = new Date(y, m - 1, 1)
    const fetPeriod2Label = fetPeriod2PriorMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (fetPeriod2Due >= windowStart && fetPeriod2Due <= windowEnd) {
      const daysUntilP2 = daysBetween(today, fetPeriod2Due)
      list.push({
        id: `ttb-fet-p2-${y}-${m}`,
        agency: 'TTB',
        title: 'FET Period 2 Deposit',
        description: `Federal excise tax deposit for ${fetPeriod2Label} days 16–end`,
        dueDate: fetPeriod2Due,
        daysUntil: daysUntilP2,
        urgency: urgencyFromDays(daysUntilP2),
        route: '/admin/reports/ttb-excise-tax',
        formNumber: 'Form 5000.24',
        period: `${fetPeriod2Label} (days 16–end)`,
      })
    }

    cursor.setMonth(cursor.getMonth() + 1)
  }

  // ── Annual physical inventory: Jan 15 of each year (covering prior year) ──
  for (const yearOffset of [0, 1]) {
    const inventoryDue = new Date(today.getFullYear() + yearOffset, 0, 15)
    if (inventoryDue >= windowStart && inventoryDue <= windowEnd) {
      const daysUntil = daysBetween(today, inventoryDue)
      list.push({
        id: `ttb-inventory-${inventoryDue.getFullYear()}`,
        agency: 'TTB',
        title: 'Annual Physical Inventory',
        description: `Required annual physical inventory of all spirits, wines, and materials (27 CFR 19.618) for ${inventoryDue.getFullYear() - 1}`,
        dueDate: inventoryDue,
        daysUntil,
        urgency: urgencyFromDays(daysUntil),
        period: `Calendar Year ${inventoryDue.getFullYear() - 1}`,
      })
    }
  }

  // ── Annual CBMA claim: Jan 31 ──
  for (const yearOffset of [0, 1]) {
    const cbmaDue = new Date(today.getFullYear() + yearOffset, 0, 31)
    if (cbmaDue >= windowStart && cbmaDue <= windowEnd) {
      const daysUntil = daysBetween(today, cbmaDue)
      list.push({
        id: `ttb-cbma-${cbmaDue.getFullYear()}`,
        agency: 'TTB',
        title: 'CBMA Annual Claim',
        description: `Annual Craft Beverage Modernization Act reduced rate claim for ${cbmaDue.getFullYear() - 1} — must be filed to maintain reduced FET rates`,
        dueDate: cbmaDue,
        daysUntil,
        urgency: urgencyFromDays(daysUntil),
        period: `Calendar Year ${cbmaDue.getFullYear() - 1}`,
      })
    }
  }

  // ── TABC permit renewal ──
  if (props.tabcPermitExpiry) {
    const expiry = new Date(props.tabcPermitExpiry)
    // Warn 90 days before expiry
    const renewalWarning = addDays(expiry, -90)
    if (expiry >= windowStart && expiry <= windowEnd) {
      const daysUntil = daysBetween(today, expiry)
      list.push({
        id: 'tabc-permit-renewal',
        agency: 'TABC',
        title: 'TABC Permit Renewal',
        description: `Distiller's and Rectifier's Permit expires ${formatDate(expiry)} — renew at least 30 days before expiry`,
        dueDate: expiry,
        daysUntil,
        urgency: urgencyFromDays(daysUntil),
        period: formatDate(expiry),
      })
    } else if (renewalWarning >= windowStart && renewalWarning <= windowEnd) {
      const daysUntil = daysBetween(today, expiry)
      list.push({
        id: 'tabc-permit-renewal-warn',
        agency: 'TABC',
        title: 'TABC Permit Renewal (90-day warning)',
        description: `Permit expires ${formatDate(expiry)} — begin renewal process now`,
        dueDate: expiry,
        daysUntil,
        urgency: 'upcoming',
        period: formatDate(expiry),
      })
    }
  }

  // Sort: overdue first, then by due date ascending
  return list.sort((a, b) => {
    if (a.urgency === 'overdue' && b.urgency !== 'overdue') return -1
    if (b.urgency === 'overdue' && a.urgency !== 'overdue') return 1
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
})

// ─── Grouped counts ───────────────────────────────────────────────────────────

const overdueCounts = computed(() => ({
  ttb: deadlines.value.filter(d => d.urgency === 'overdue' && d.agency === 'TTB').length,
  tabc: deadlines.value.filter(d => d.urgency === 'overdue' && d.agency === 'TABC').length,
}))

const criticalCount = computed(() =>
  deadlines.value.filter(d => d.urgency === 'critical').length
)

const upcomingCount = computed(() =>
  deadlines.value.filter(d => d.urgency === 'upcoming' || d.urgency === 'warning').length
)

// ─── Urgency styling ──────────────────────────────────────────────────────────

function urgencyClasses(level: UrgencyLevel) {
  return {
    badge: {
      overdue: 'bg-red-900/30 text-red-400 border-red-500/30',
      critical: 'bg-orange-900/30 text-orange-400 border-orange-500/30',
      warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
      upcoming: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
      ok: 'bg-green-900/20 text-green-400 border-green-500/20',
    }[level],
    row: {
      overdue: 'border-l-2 border-l-red-500',
      critical: 'border-l-2 border-l-orange-500',
      warning: 'border-l-2 border-l-yellow-500',
      upcoming: 'border-l-2 border-l-blue-500',
      ok: 'border-l-0',
    }[level],
    agencyBadge: '',
  }
}

function urgencyLabel(level: UrgencyLevel, days: number): string {
  if (level === 'overdue') return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
  if (days === 0) return 'Due today'
  return `${days} day${days !== 1 ? 's' : ''}`
}
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
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-sm font-semibold text-parchment/70 mb-4">Quick Access — All Compliance Reports</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <NuxtLink to="/admin/reports/ttb-production" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-blue-900/20 border border-transparent hover:border-blue-500/20 transition-all text-center">
          <UIcon name="i-lucide-flask-conical" class="text-blue-400 text-xl" />
          <span class="text-xs text-parchment/70">TTB Production</span>
          <span class="text-[10px] text-parchment/40">5110.11</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports/ttb-storage" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-purple-900/20 border border-transparent hover:border-purple-500/20 transition-all text-center">
          <UIcon name="i-lucide-warehouse" class="text-purple-400 text-xl" />
          <span class="text-xs text-parchment/70">TTB Storage</span>
          <span class="text-[10px] text-parchment/40">5110.11</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports/ttb-processing" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/20 transition-all text-center">
          <UIcon name="i-lucide-package-check" class="text-emerald-400 text-xl" />
          <span class="text-xs text-parchment/70">TTB Processing</span>
          <span class="text-[10px] text-parchment/40">5110.28</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports/ttb-excise-tax" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all text-center">
          <UIcon name="i-lucide-receipt" class="text-gold text-xl" />
          <span class="text-xs text-parchment/70">TTB Excise Tax</span>
          <span class="text-[10px] text-parchment/40">5000.24</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports/tabc-monthly" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center">
          <UIcon name="i-lucide-file-text" class="text-amber-400 text-xl" />
          <span class="text-xs text-parchment/70">TABC Monthly</span>
          <span class="text-[10px] text-parchment/40">TX Production</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports/tabc-excise-tax" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center">
          <UIcon name="i-lucide-landmark" class="text-amber-500 text-xl" />
          <span class="text-xs text-parchment/70">TABC Excise Tax</span>
          <span class="text-[10px] text-parchment/40">§ 201.43</span>
        </NuxtLink>
      </div>
    </div>

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
            <!-- Agency badge -->
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
              <div class="text-xs text-parchment/40 mt-0.5">Due: {{ formatDate(deadline.dueDate) }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Days indicator -->
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full border"
              :class="urgencyClasses(deadline.urgency).badge"
            >
              {{ urgencyLabel(deadline.urgency, deadline.daysUntil) }}
            </span>

            <!-- Go to report button -->
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
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">TTB Filing Reference</h3>
        <div class="space-y-2 text-xs text-parchment/60">
          <div class="flex justify-between gap-2">
            <span>Monthly operational reports</span>
            <span class="text-parchment/40 shrink-0">15th of following month</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>FET deposit — Period 1 (1st–15th)</span>
            <span class="text-parchment/40 shrink-0">29th of same month</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>FET deposit — Period 2 (16th–end)</span>
            <span class="text-parchment/40 shrink-0">14th of following month</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Annual physical inventory</span>
            <span class="text-parchment/40 shrink-0">January 15</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>CBMA annual claim</span>
            <span class="text-parchment/40 shrink-0">January 31</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Record retention</span>
            <span class="text-parchment/40 shrink-0">3 years at premises</span>
          </div>
        </div>
      </div>

      <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
        <h3 class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">TABC Filing Reference</h3>
        <div class="space-y-2 text-xs text-parchment/60">
          <div class="flex justify-between gap-2">
            <span>Monthly production &amp; disposition report</span>
            <span class="text-parchment/40 shrink-0">15th of following month</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Texas excise tax ($2.40/WG)</span>
            <span class="text-parchment/40 shrink-0">15th of following month</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Permit renewal</span>
            <span class="text-parchment/40 shrink-0">Per permit expiry date</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>DTC sales limit</span>
            <span class="text-parchment/40 shrink-0">2 bottles/person/30 days</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Tasting room sample limit</span>
            <span class="text-parchment/40 shrink-0">1 oz/product, 3 oz total</span>
          </div>
          <div class="flex justify-between gap-2">
            <span>Record retention</span>
            <span class="text-parchment/40 shrink-0">3 years</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
