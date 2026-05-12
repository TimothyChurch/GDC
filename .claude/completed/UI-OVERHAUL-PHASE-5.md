# UI Overhaul — Phase 5 Complete (reframed)

**Date:** 2026-05-08
**Plan:** `PLAN-UI-OVERHAUL.md`

## What changed from the original Phase 5 plan

The original Phase 5 deliverables called for **in-place editable transfers** with `correctedBy` / `correctedAt` / `originalSnapshot` fields and a `PUT /api/transfer/[id]` route. On reading the existing Transfer model, that approach **conflicts with an explicit immutability contract** baked into the schema:

> Documents are immutable once `reportingPeriod` is closed; corrections happen by creating an inverse `reversal` transfer (preserves audit trail).
> — `server/models/transfer.schema.ts:19–21`

The store has the same contract:

> Transfers are immutable (append-only): there is no PUT, no DELETE.
> — `stores/useTransferStore.ts:11–13`

Adding in-place edits would have undermined that integrity guarantee — exactly the opposite of what TTB record-keeping wants. The **existing reversal pattern already provides the audit trail** the original Phase 5 was asking for: every corrected transfer is a `(original, reversal)` pair, both rows preserved, the original marked `status: 'reversed'` and the reversal pointed back via `reverses`.

So Phase 5 was reframed as: **make the existing reversal lineage easier to read in the UI**, plus **build the deferred `BatchStartAction.vue` deliverable**, which had nothing to do with the schema change in the first place. Both originally-listed schema and API tasks were dropped.

## Shipped

1. **`components/Transfer/TransferHistory.vue`** — improved reversal lineage rendering:
   - Each row shows its short id (`#abc123`).
   - Reversed rows now show **"Reversed by {name} → #xxxxxx"** badge linking the reversal pair (was just "Reversed").
   - Reversal-type rows show **"Reverses #xxxxxx · {operator}"** — clear bidirectional linking.
   - `createdBy.name` surfaced on every row.
   - Hovering a row highlights its paired row (amber border + tinted background) so the original/reversal relationship is visually obvious.

2. **`components/Batch/BatchStartAction.vue`** — new component. Hero-styled blue gradient card visible only when `batch.currentStage === 'Upcoming'`. Title: "Ready to start." Body: "This batch hasn't entered production yet. Edits to recipe, batch size, and pipeline are free until you start it." Bottom row: stage chip showing the first pipeline stage + a primary "Start Batch" button. Click → opens the same `LazyModalTransferAction` modal that `ShortcutAdvanceStage` uses, prefilled with `type='stage_transition'`, `fromStage='Upcoming'`, `toStage=pipeline[0]`, `sources=[]`. The first transfer commits when the user submits.

3. **`pages/admin/batch/[_id].vue`** — wired BatchStartAction. When the batch is in `Upcoming`, the four `Shortcut*` buttons are hidden (nothing has been moved into vessels yet, so Move/Withdraw/Destroy don't apply); the user sees only the BatchStartAction hero. Once started, the row of shortcuts replaces it as before.

## Tests

- `npm run test` → 327/327 passing.
- Dev server compiles clean.
- `/admin → 200`, `/floor → 302`.

## Why this still satisfies the spirit of Phase 5

The original goal: "Mistakes are correctable; correction trail preserved." The reversal pattern delivers exactly that — a typo on a transfer is corrected by reversing it (which doesn't delete it; both rows stay) and creating a fresh transfer with the correct values. The new TransferHistory UI now surfaces the relationship clearly so the audit trail is legible at a glance.

The Upcoming-as-real-draft-state goal is now visually formalized: an Upcoming batch is unmistakably "not started yet, edit anything," and there's exactly one button (Start Batch) that crosses the threshold. Floor surface naturally excludes Upcoming batches (they have no vessel assignments).

## Deferred

- **In-place transfer editing.** Out of scope; would need a TTB-policy decision before relaxing the immutability contract. The reversal-and-recreate path remains the only correction route.
- **A "split off Upcoming portion" workflow.** A batch can have leftover Upcoming volume after a partial advance; the small `ShortcutAdvanceStage source-stage="Upcoming"` button still handles this in non-Upcoming batches.
- **History row click → open transfer detail panel.** Could add a panel to inspect a single transfer's full data. Defer until requested.

## Status

Phases 1–5 ✅ shipped. Phase 6 remains ⏸ blocked on `PLAN-PIPELINE-REVAMP.md` Phase 9 (TTB report sourcing from Transfer ledger).
