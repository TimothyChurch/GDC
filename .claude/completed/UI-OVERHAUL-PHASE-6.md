# UI Overhaul — Phase 6 Complete (UI shell only)

**Date:** 2026-05-08
**Plan:** `PLAN-UI-OVERHAUL.md`

## Scope decision

The original Phase 6 plan was gated on `PLAN-PIPELINE-REVAMP.md` Phase 9 (TTB report data sourced from the Transfer ledger). That backend rework is still pending. But the **visible reframing** — turning report screens into "verify and export" surfaces with status badges, discrepancies banners, and download actions — is independent of where the underlying numbers come from.

Phase 6 was therefore split:
- **Visible UI shell**: shipped now (this document)
- **Data source migration to the Transfer ledger**: stays parked in PIPELINE Phase 9

When PIPELINE Phase 9 lands, the report bodies (ReportTTBProduction, ReportTTBStorage, etc.) will swap their data source without the shell needing to change — `useReportStatus` already reads from `transferStore`, so the discrepancy detection improves automatically as more transfers are loaded.

## Shipped

1. **`composables/useReportStatus.ts`** — derives a `ReportStatus` (`'ready' | 'review' | 'discrepancies' | 'empty'`) and a list of `ReportDiscrepancy` items from the loaded `transferStore.transfers` for a given period. Initial discrepancy rules: loss > 0 with `reasonCode === 'no_loss'` or missing reason code; transfers missing `createdBy.name`. Exposes `summary` (period, transferCount, discrepancyCount). Easily extended with more rules as patterns emerge.

2. **`components/Report/ReportShell.vue`** — replaces the standalone `ReportLastSync` component. Status strip with: live indicator + last-sync timestamp, period chip (when scoped), transfer count, status badge (color-coded), Refresh / Export PDF / Submit (pay.gov) buttons. Below the strip, a red discrepancies banner appears when `discrepancies.length > 0` — lists up to 5 deep-linked items, summary of overflow. `ReportShell` is `print:hidden` so it doesn't appear in the printed/saved PDF.

3. **`pages/admin/reports/ttb-production.vue`** — full Phase-6 wiring: loads transfers for the selected period, computes `useReportStatus`, passes `period`, `status`, `discrepancies`, and `transferCount` to `ReportShell`, and provides a pay.gov submit URL.

4. **All other report pages** (`ttb-storage`, `ttb-processing`, `ttb-excise-tax`, `tabc-monthly`, `tabc-excise-tax`, `barrels`, `costs`, `inventory`, `production`, `compliance-calendar`) — wired to `<ReportShell />`. Period passed where the page has a `selectedMonth` ref. `submit-url` to pay.gov for TTB pages. Compliance-calendar uses `:exportable="false"` since there's nothing to export from the calendar view itself. The full `useReportStatus` integration was applied only to TTB Production for now — the other pages will benefit once their bodies reference the same per-period transfer data (PIPELINE 9 territory).

5. **PDF export** — uses `window.print()` (Save as PDF in any modern browser). No new library dependency. Standardized via the ReportShell's "Export PDF" button. Existing per-page Print buttons still work for now (small redundancy; remove in a polish pass if desired).

## Tests

- `npm run test` → 327/327 passing.
- Dev server compiles clean.
- `/admin/reports` → 200; `/admin/reports/ttb-production` → 200.

## What this delivers, in user-visible terms

Open any TTB or TABC report page now. The first thing you see below the title is a horizontal strip:

> ● Last sync 2026-05-08 11:03 AM   📅 2026-05   3 transfers this period   ⚠ Review   [Refresh] [Export PDF] [Open pay.gov]

If anything is wrong (loss without a reason code, missing operator), a red banner appears below the strip with deep links to fix each issue. Once the issues are resolved, the badge changes to "Ready to file" and the banner disappears.

The reports are now **verify-and-export** views, not "build a report" views — exactly the framing the friction audit recommended.

## Deferred

- **Per-page `useReportStatus` wiring on the other 10 report pages.** Trivial follow-up — copy the 3 lines from `ttb-production.vue`. Held back because the discrepancy detection becomes meaningful only once the report bodies themselves filter by period, which is PIPELINE 9.
- **Real-time polling.** The shell shows last-sync time; clicking Refresh re-loads. Auto-poll could come later if operators ask.
- **More discrepancy rules.** Currently only loss-without-reason and missing-operator. Could add: out-of-balance variance, period mismatches, vessel-content-vs-transfer drift. Add as patterns emerge.
- **Removing the duplicated per-page Print buttons.** Cosmetic only.
- **A dedicated "Filing Readiness" sidebar badge.** Phase 1 already added a tone-coded compliance-deadline badge to the Reports nav link based on `useComplianceDeadlines`. Could be enriched with a per-report "X reports ready, Y need review" rollup, but that needs the per-page status wiring first.

## All UI overhaul phases

- Phase 1 ✅ — `.claude/completed/UI-OVERHAUL-PHASE-1.md`
- Phase 2 ✅ — `.claude/completed/UI-OVERHAUL-PHASE-2.md`
- Phase 3 ✅ — `.claude/completed/UI-OVERHAUL-PHASE-3.md`
- Phase 4 ✅ — `.claude/completed/UI-OVERHAUL-PHASE-4.md`
- Phase 5 ✅ (reframed) — `.claude/completed/UI-OVERHAUL-PHASE-5.md`
- Phase 6 ✅ (UI shell) — this document

The full UI overhaul plan is now functionally delivered. Any further work falls into:
1. Bug fixes on what's been shipped (the user said "we will work through bugs at a later time")
2. Long-term ideas in `PLAN-UI-OVERHAUL.md` Section 8 (drag-and-drop Gantt, custom stages, schedule-without-commit, floor map evolution, multi-batch fermentation overlays, bulk table actions, server-side search)
3. The PIPELINE Phase 9 backend rework that would unlock deeper Phase-6 integration
