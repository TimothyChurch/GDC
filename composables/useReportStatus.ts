import type { Transfer } from '~/types/interfaces/Transfer'

export type ReportStatus = 'ready' | 'review' | 'discrepancies' | 'empty'

export interface ReportDiscrepancy {
  id: string
  message: string
  link?: string
}

interface ReportStatusOptions {
  /** YYYY-MM the report covers. Defaults to current period. */
  period?: () => string | null | undefined
  /** Optional list of transfer types to focus on (e.g. ['stage_transition', 'tax_paid_withdrawal']). */
  transferTypes?: string[]
}

/**
 * Derive a "ready to file" / "has discrepancies" status for a TTB or TABC report.
 *
 * Sources of truth (Phase 6 of PLAN-UI-OVERHAUL.md):
 * - Transfer ledger: missing operator names, loss without reason code
 * - Compliance deadlines: due-date proximity
 *
 * The deeper "data sourced from Transfer ledger" question is `PLAN-PIPELINE-REVAMP.md`
 * Phase 9. This composable delivers the visible verify-and-export framing without
 * waiting for that backend rework.
 */
export function useReportStatus(opts: ReportStatusOptions = {}) {
  const transferStore = useTransferStore()

  const period = computed(() => opts.period?.() || getCurrentReportingPeriod())

  const periodTransfers = computed<Transfer[]>(() => {
    if (!period.value) return []
    return transferStore.transfers.filter((t) => {
      if (t.reportingPeriod !== period.value) return false
      if (opts.transferTypes && !opts.transferTypes.includes(t.type)) return false
      return true
    })
  })

  const discrepancies = computed<ReportDiscrepancy[]>(() => {
    const out: ReportDiscrepancy[] = []
    for (const t of periodTransfers.value) {
      // Reversed transfers are skipped — the reversal pair is the audit trail.
      if (t.status === 'reversed') continue

      // Loss > 0 with reason 'no_loss' or missing reason code
      if ((t.totalLossVolume || 0) > 0.001) {
        if (!t.loss?.reasonCode || t.loss.reasonCode === 'no_loss') {
          out.push({
            id: `loss-${t._id}`,
            message: `Transfer #${t._id.slice(-6)} has ${t.totalLossVolume!.toFixed(2)} gal loss without a reason code`,
            link: `/admin/batch/${t.batch}`,
          })
        }
      }

      // Missing operator/createdBy
      if (!t.createdBy?.name) {
        out.push({
          id: `nooperator-${t._id}`,
          message: `Transfer #${t._id.slice(-6)} has no recorded operator`,
          link: `/admin/batch/${t.batch}`,
        })
      }
    }
    return out
  })

  const status = computed<ReportStatus>(() => {
    if (periodTransfers.value.length === 0) return 'empty'
    if (discrepancies.value.length > 0) return 'discrepancies'
    return 'ready'
  })

  const summary = computed(() => ({
    period: period.value,
    transferCount: periodTransfers.value.length,
    discrepancyCount: discrepancies.value.length,
  }))

  return { status, discrepancies, summary, periodTransfers }
}
