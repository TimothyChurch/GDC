# GDC Transfers (partially integrated, NOT 0% as initially documented)

> **Correction (2026-05-07 deep audit):** The first audit incorrectly stated this system was 0% built. The Transfer Engine, routes, and store are all implemented and working. The gap is **integration** — most components still bypass the engine. See `tech-debt.md` §14 for the migration list.

The Transfer ledger is the new immutable system that replaces ad-hoc `vessel.contents[]` mutations and `Batch.transferLog[]` writes. Every liquid movement should funnel through `executeTransfer()` so it's atomic, period-locked, and TTB-auditable.

## What's built and working

### Engine (`server/utils/transferEngine.ts`, 622 lines)

Single atomic primitive: `executeTransfer(input, options)`. Wraps:
- MongoDB multi-document transaction (replica set required — Atlas ✅, local needs `mongodb-memory-server-replset` or `rs.initiate()`)
- Source vessel decrement (greedy slot allocation)
- Destination vessel increment (proof-weighted merge)
- Batch denormalized cache update (`stageVolumes`, `stageProofs`, `currentStage`, `ttbAccount`)
- Transfer doc create
- Period-lock enforcement (auto-creates `ReportingPeriod` if missing)

Plus `reverseTransfer(transferId, notes)` — creates inverse transfer in current period, marks original as `status: 'reversed'`, links them bidirectionally.

Helpers: `server/utils/transferEngineCore.ts` (invariant checks, totals), `server/utils/unitConverter.ts` (strict; throws on unknown units — replaces `utils/conversions.ts.convertUnitRatio` lenient fallback).

### API routes (7 routes, all auth-gated by middleware but missing role checks)

| Method | Path | File |
|---|---|---|
| POST | `/api/transfer/create` | `transfer/create.post.ts` — calls `executeTransfer()` |
| GET | `/api/transfer` | `transfer/index.get.ts` — filter by batch/vessel/period/type/status |
| GET | `/api/transfer/[id]` | `transfer/[id].get.ts` — populates vessel/batch/reversal refs |
| POST | `/api/transfer/[id]/reverse` | `transfer/[id]/reverse.post.ts` |
| GET | `/api/reporting-period` | `reporting-period/index.get.ts` |
| POST | `/api/reporting-period` | `reporting-period/create.post.ts` — auto-create or fetch |
| POST | `/api/reporting-period/[period]/close` | `reporting-period/[period]/close.post.ts` — locks period |

⚠️ **All 7 routes lack RBAC** — see `tech-debt.md` §6. Period closure especially should require Admin.

### Store (`stores/useTransferStore.ts`, 256 lines)

Not a `useCrudStore`-based store (transfers are immutable, append-only).

```ts
const transfers = useTransferStore()
await transfers.list({ batch, vessel, period, type, status, limit })
const t = await transfers.getById(id)
const result = await transfers.create(transferInput)   // {transfer, batch, updatedVessels}
const result = await transfers.reverse(transferId, notes)
```

`syncBatchAndVesselStores(response)` (lines 173-208) keeps `useBatchStore.crud.items` and `useVesselStore.crud.items` in sync after each transfer commit. ⚠️ Reaches into other stores' internals — works but violates SRP (see `tech-debt.md` §48).

Lookups: `transfersByBatch(id)`, `transfersByVessel(id)`, `transfersByPeriod(period)`.

### Schemas

- `server/models/transfer.schema.ts` — full immutable record + 4 compound indexes for TTB reporting
- `server/models/reportingPeriod.schema.ts` — period status (`open` / `closed` / `submitted`)

### Definitions (`composables/transferDefinitions.ts`)

Used by both engine and reports:
- `TRANSFER_TYPES`: stage_transition, vessel_move, split, merge, tib_in/out, tax_paid_withdrawal, destruction, sample, redistillation, reversal
- `LOSS_REASON_CODES`: evaporation, spillage, sampling, measurement_variance, foreshots_heads_tails, etc.
- `TTB_ACCOUNTS`: production, storage, processing, tib_external, tax_paid
- `STAGE_TO_TTB_ACCOUNT`: auto-mapping on stage transitions
- `getCurrentReportingPeriod()`, `proofGallons()`, `abvToProof()`, `RECONCILIATION_EPSILON`

## What's wired

`useBatchStore` already routes through the engine for these actions:
- `startFirstStage()` (line ~136) → `transferStore.create()`
- `advanceToStage()` (line ~193) → `transferStore.create()`
- `revertToPreviousStage()` (line ~276) → `transferStore.reverse()`

## What's NOT wired (the integration gap)

5 distillation components STILL call `useVesselStore.transferBatch*` directly, bypassing the engine. See `tech-debt.md` §14 for full list:

- `BatchAdvanceAction.vue` (lines 209-215, 222-228, 534-536)
- `BatchStrippingRun.vue` (lines 103-108) — Bug 3.1 from plan: "siphons unrelated batches"
- `BatchDistilling.vue` (lines 143-156)
- `BatchSpiritRun.vue` (lines 93-98)
- `PanelVesselTransfer.vue` (lines 70, 72-77)

Bypassing the engine means: no transaction safety, no period locking, no loss attestation, no TTB account routing, lenient unit conversion (silent corruption on unknown units).

**No UI component imports `useTransferStore` directly** — all engine-routed flows go through `useBatchStore`. This is intentional (avoids UI/engine coupling) but creates a bottleneck: any component that bypasses `useBatchStore` (calling `useVesselStore` directly) circumvents the entire engine.

## Migration pattern (when fixing §14)

For each bypassing component, replace e.g.:

```ts
// OLD (bypasses engine)
await vesselStore.transferBatchContents(srcVesselId, destVesselId, batchId, volume)
```

with:

```ts
// NEW (engine-routed)
await transferStore.create({
  type: 'vessel_move',
  batch: batchId,
  fromStage: batch.currentStage,
  toStage: batch.currentStage,
  sources: [{ vessel: srcVesselId, volume, proof: actualProof, gauging: { method: 'volumetric', ... } }],
  destinations: [{ vessel: destVesselId, volume, proof: actualProof }],
  loss: { volume: 0, proof: 0, reasonCode: undefined, notes: 'no loss' },
  ttbAccount: { from: STAGE_TO_TTB_ACCOUNT[batch.currentStage], to: STAGE_TO_TTB_ACCOUNT[batch.currentStage] },
})
```

Note the explicit `proof` values (don't pass `0` — that's the bug in `useBatchStore.ts:219`, see `tech-debt.md` §16) and explicit `loss` (even if zero).

## What NOT to remove

- `Batch.transferLog[]` — DEPRECATED but still readable; remove only after migration sweep
- `Vessel.previousContents` (string field) — DEPRECATED but referenced by some legacy queries
- `Transfer.attachments`, `Transfer.gauging` — schema-supported but no UI yet (Phase 7-8 work)
- `ReportingPeriod.ttbReportSnapshots` — populated when Phase 8 (TTB form generation) lands

## What NOT to extend

- `useVesselStore.transferBatch()`, `transferBatchContents()`, `fullTransfer()` — these are the bypass methods. Don't add features to them; route new code through the engine instead.
- `utils/conversions.ts.convertUnitRatio` — lenient fallback. Use `server/utils/unitConverter.ts.toWineGallons()` server-side and migrate clients off the lenient version.

## Plan reference

`PLAN-PIPELINE-REVAMP.md` — the document is the architectural spec. Phases 4-6 (engine, API, store) are essentially complete. Phase 7 (UI integration) is the §14 migration work. Phases 8-9 (TTB form generation, mobile UX) not started.
