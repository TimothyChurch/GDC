export type UrgencyLevel = 'overdue' | 'critical' | 'warning' | 'upcoming' | 'ok'

export interface ComplianceDeadline {
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

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function formatDeadlineDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function urgencyFromDays(days: number): UrgencyLevel {
  if (days < 0) return 'overdue'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  if (days <= 21) return 'upcoming'
  return 'ok'
}

export function urgencyLabel(level: UrgencyLevel, days: number): string {
  if (level === 'overdue') return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`
  if (days === 0) return 'Due today'
  return `${days} day${days !== 1 ? 's' : ''}`
}

export function urgencyClasses(level: UrgencyLevel) {
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
  }
}

export function useComplianceDeadlines(tabcPermitExpiry?: Ref<string | undefined> | ComputedRef<string | undefined>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlines = computed((): ComplianceDeadline[] => {
    const list: ComplianceDeadline[] = []

    const windowStart = addDays(today, -30)
    const windowEnd = addDays(today, 90)

    const cursor = new Date(windowStart.getFullYear(), windowStart.getMonth(), 1)
    while (cursor <= windowEnd) {
      const y = cursor.getFullYear()
      const m = cursor.getMonth()

      const reportingMonth = new Date(y, m - 1, 1)
      const reportingLabel = reportingMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      // ── TTB Monthly Reports (due 15th of month following reporting period) ──
      const ttbMonthlyDue = new Date(y, m, 15)
      if (ttbMonthlyDue >= windowStart && ttbMonthlyDue <= windowEnd) {
        const daysUntilMonthly = daysBetween(today, ttbMonthlyDue)
        const monthReportingKey = `${y}-${String(m).padStart(2, '0')}`

        list.push({
          id: `ttb-production-${monthReportingKey}`, agency: 'TTB',
          title: 'TTB Production Report',
          description: `Monthly Report of Production Operations for ${reportingLabel}`,
          dueDate: ttbMonthlyDue, daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: '/admin/reports/ttb-production', formNumber: 'Form 5110.11',
          period: reportingLabel,
        })
        list.push({
          id: `ttb-storage-${monthReportingKey}`, agency: 'TTB',
          title: 'TTB Storage Report',
          description: `Storage Operations Report for ${reportingLabel}`,
          dueDate: ttbMonthlyDue, daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: '/admin/reports/ttb-storage', formNumber: 'Form 5110.11',
          period: reportingLabel,
        })
        list.push({
          id: `ttb-processing-${monthReportingKey}`, agency: 'TTB',
          title: 'TTB Processing Report',
          description: `Monthly Report of Processing Operations for ${reportingLabel}`,
          dueDate: ttbMonthlyDue, daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: '/admin/reports/ttb-processing', formNumber: 'Form 5110.28',
          period: reportingLabel,
        })

        // ── TABC Monthly Report ──
        list.push({
          id: `tabc-monthly-${monthReportingKey}`, agency: 'TABC',
          title: 'TABC Monthly Report',
          description: `Texas Monthly Production and Disposition Report for ${reportingLabel}`,
          dueDate: ttbMonthlyDue, daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: '/admin/reports/tabc-monthly',
          period: reportingLabel,
        })
        list.push({
          id: `tabc-excise-${monthReportingKey}`, agency: 'TABC',
          title: 'TABC Excise Tax Remittance',
          description: `Texas distilled spirits excise tax ($2.40/WG) for ${reportingLabel}`,
          dueDate: ttbMonthlyDue, daysUntil: daysUntilMonthly,
          urgency: urgencyFromDays(daysUntilMonthly),
          route: '/admin/reports/tabc-excise-tax',
          period: reportingLabel,
        })
      }

      // ── TTB FET Period 1 deposit ──
      const fetPeriod1Month = new Date(y, m - 1, 1)
      const fetPeriod1Label = fetPeriod1Month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      const fetPeriod1Due = new Date(y, m - 1, 29)
      if (fetPeriod1Due >= windowStart && fetPeriod1Due <= windowEnd) {
        const daysUntilP1 = daysBetween(today, fetPeriod1Due)
        list.push({
          id: `ttb-fet-p1-${y}-${m}`, agency: 'TTB',
          title: 'FET Period 1 Deposit',
          description: `Federal excise tax deposit for ${fetPeriod1Label} days 1-15`,
          dueDate: fetPeriod1Due, daysUntil: daysUntilP1,
          urgency: urgencyFromDays(daysUntilP1),
          route: '/admin/reports/ttb-excise-tax', formNumber: 'Form 5000.24',
          period: `${fetPeriod1Label} (days 1-15)`,
        })
      }

      // ── TTB FET Period 2 deposit ──
      const fetPeriod2Due = new Date(y, m, 14)
      const fetPeriod2PriorMonth = new Date(y, m - 1, 1)
      const fetPeriod2Label = fetPeriod2PriorMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (fetPeriod2Due >= windowStart && fetPeriod2Due <= windowEnd) {
        const daysUntilP2 = daysBetween(today, fetPeriod2Due)
        list.push({
          id: `ttb-fet-p2-${y}-${m}`, agency: 'TTB',
          title: 'FET Period 2 Deposit',
          description: `Federal excise tax deposit for ${fetPeriod2Label} days 16-end`,
          dueDate: fetPeriod2Due, daysUntil: daysUntilP2,
          urgency: urgencyFromDays(daysUntilP2),
          route: '/admin/reports/ttb-excise-tax', formNumber: 'Form 5000.24',
          period: `${fetPeriod2Label} (days 16-end)`,
        })
      }

      cursor.setMonth(cursor.getMonth() + 1)
    }

    // ── Annual physical inventory: Jan 15 ──
    for (const yearOffset of [0, 1]) {
      const inventoryDue = new Date(today.getFullYear() + yearOffset, 0, 15)
      if (inventoryDue >= windowStart && inventoryDue <= windowEnd) {
        const daysUntil = daysBetween(today, inventoryDue)
        list.push({
          id: `ttb-inventory-${inventoryDue.getFullYear()}`, agency: 'TTB',
          title: 'Annual Physical Inventory',
          description: `Required annual physical inventory of all spirits, wines, and materials (27 CFR 19.618) for ${inventoryDue.getFullYear() - 1}`,
          dueDate: inventoryDue, daysUntil,
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
          id: `ttb-cbma-${cbmaDue.getFullYear()}`, agency: 'TTB',
          title: 'CBMA Annual Claim',
          description: `Annual Craft Beverage Modernization Act reduced rate claim for ${cbmaDue.getFullYear() - 1} — must be filed to maintain reduced FET rates`,
          dueDate: cbmaDue, daysUntil,
          urgency: urgencyFromDays(daysUntil),
          period: `Calendar Year ${cbmaDue.getFullYear() - 1}`,
        })
      }
    }

    // ── TABC permit renewal ──
    if (tabcPermitExpiry?.value) {
      const expiry = new Date(tabcPermitExpiry.value)
      const renewalWarning = addDays(expiry, -90)
      if (expiry >= windowStart && expiry <= windowEnd) {
        const daysUntil = daysBetween(today, expiry)
        list.push({
          id: 'tabc-permit-renewal', agency: 'TABC',
          title: 'TABC Permit Renewal',
          description: `Distiller's and Rectifier's Permit expires ${formatDeadlineDate(expiry)} — renew at least 30 days before expiry`,
          dueDate: expiry, daysUntil,
          urgency: urgencyFromDays(daysUntil),
          period: formatDeadlineDate(expiry),
        })
      } else if (renewalWarning >= windowStart && renewalWarning <= windowEnd) {
        const daysUntil = daysBetween(today, expiry)
        list.push({
          id: 'tabc-permit-renewal-warn', agency: 'TABC',
          title: 'TABC Permit Renewal (90-day warning)',
          description: `Permit expires ${formatDeadlineDate(expiry)} — begin renewal process now`,
          dueDate: expiry, daysUntil,
          urgency: 'upcoming' as UrgencyLevel,
          period: formatDeadlineDate(expiry),
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

  return {
    deadlines,
    overdueCounts,
    criticalCount,
    upcomingCount,
  }
}
