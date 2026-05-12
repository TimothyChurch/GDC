# UI Overhaul — Phase 3 Complete

**Date:** 2026-05-07
**Plan:** `PLAN-UI-OVERHAUL.md`

## Shipped

1. **`utils/gaugeCalc.ts`** — pure-function distillery gauging helpers: `fToC`, `cToF`, `brixToSg`, `sgToBrix`, `convertVolume`, `gaugeProofGallons`, `asGallons`. Defers ABV↔proof to the existing `composables/transferDefinitions.ts` exports (which auto-import globally) to avoid name collisions.

2. **`components/Base/NumberInputWithCalc.vue`** — UInput wrapper with an inline `≈ X unit` companion line below the field. Supports `kind="abv" | "proof" | "temperature-f" | "temperature-c" | "brix" | "sg" | "volume-gal"`. The volume-gal kind composes with `fromUnit` and `abv` to render proof-gallons inline.

3. **`composables/usePanelDraft.ts`** — generic localStorage draft persistence keyed by `gdc:panelDraft:${panelName}:${entityId || 'new'}`. Watches the data ref deeply, debounces saves to 500ms, restores on mount, persists on `beforeunload`, and exposes `clearDraft`, `restoredAt`, `isDirty`. Field-whitelist support to skip sensitive props (e.g. passwords).

4. **`composables/useFormPanel.ts`** — extended to accept an optional `draft: { key, id, fields? }` config. When present, `usePanelDraft` is wired automatically; `save()` clears the draft after success; `discardDraft()` restores the original snapshot AND clears localStorage. Returns `draftRestoredAt` for the UI banner.

5. **`components/Panel/PanelProduction.vue`** — opted into draft persistence keyed on `production._id || batch-${batchId}`. Added a "Draft restored from a previous session" banner with a Discard button immediately below the panel header. The existing wizard step indicator already covers Phase 3's step-indicator deliverable.

6. **`components/Panel/PanelBatch.vue`** — opted into draft persistence. Added two preview blocks:
   - **Stage-volume rescaling preview** (existing batch, size changed): shows old → new for each stage volume in a 3-column grid, plus the resize ratio.
   - **Recipe pipeline inheritance preview** (new batch, recipe selected): shows the pipeline chips that will be inherited.
   Plus the same draft-restored banner.

7. **`components/Transfer/TransferActionForm.vue`** — redesigned to a two-column layout on `lg` and above. Sources column on the left (with a vertical divider), Destinations column on the right. Loss + Reconciliation panels moved into a sticky strip just above the footer (`bg-black/20 backdrop-blur-sm` band with two-column inner grid) so the balance check stays visible regardless of source/destination scroll position. Wider max-width (`lg:max-w-5xl`).

8. **`components/Batch/BatchDistillingRun.vue`** — four ABV inputs (charge, addition, output, cut) swapped to `<NumberInputWithCalc kind="abv">`. Operators see "≈ X proof" inline as they type.

9. **`components/Transfer/TransferQuickAction.vue`** — single "Move…" button entry point. Opens `LazyModalTransferAction` with smart-default prefill (sources auto-populated from every vessel currently holding the batch; type left for the user to pick in the form). Preserves the post-transfer bookkeeping from `ShortcutAdvanceStage` for distillation stages: stub `DistillingRun` on enter, `lowWines` aggregation on exit Stripping → Low Wines. Existing `Shortcut*` buttons stay live for now — call sites can swap incrementally.

10. **All 13 Panel/* components** (`PanelBottle`, `PanelBulkSpirit`, `PanelCocktail`, `PanelContact`, `PanelEvent`, `PanelInventory`, `PanelItem`, `PanelPurchaseOrder`, `PanelRecipe`, `PanelUser`, `PanelVessel`, plus the already-wired `PanelBatch` and `PanelProduction`) — opted into draft persistence with a one-line `draft: { key, id }` option on the existing `useFormPanel` call. PanelUser uses a `fields` whitelist to skip the password field.

## Tests

- `npm run test` → 303/303 passing.
- Dev server compiles clean (Square BigInt warnings are pre-existing and unrelated).
- `/admin`, `/admin/dashboard`, `/admin/batch` all return 200.

## Surprising / discovered

- **`composables/useUnitConversion.ts` already exists** for ingredient pricing (purchase-price ÷ inventory-units math). My new helpers are a different domain (field measurements). Resolved by putting mine in `utils/gaugeCalc.ts` rather than overwriting.
- **`abvToProof` / `proofToAbv` already live in `composables/transferDefinitions.ts`** and are auto-imported. Initially duplicated them in `gaugeCalc.ts` and got a Vite duplicate-import warning. Removed from `gaugeCalc.ts` and the components import directly from `transferDefinitions.ts` instead.
- **`PanelProduction` already had a step indicator** — it was just gated on `v-if="isNew"` (only visible in wizard mode). The "missing step indicator" friction in the audit was inaccurate; the wizard already shows numbered circles + connectors + step labels (Source / Product / Costs / Review).
- **`useFormPanel` was the right injection point for drafts.** Wiring `usePanelDraft` directly in 13 panels would have been ~50 lines of boilerplate; baking it into the wrapper made each panel's opt-in a single line.

## Deferred / not in this phase

- **"Draft restored" banner on the other 11 panels.** Persistence works everywhere, but only `PanelProduction` and `PanelBatch` show the visible banner. Add to the rest as a follow-up sweep.
- **Inline calculators on volume inputs.** `NumberInputWithCalc kind="volume-gal"` is implemented and ready, but the volume inputs in `BatchDistillingRun` weren't swapped — the `{ volume, abv, volumeUnit }` triplet would need a small wrapper to feed into the calc. ABV inputs were the higher-leverage target and are done.
- **Removing the four `Shortcut*` buttons.** `TransferQuickAction` is built but call sites haven't been swapped yet (DashboardBatchCard, BatchStageKanban still reference the per-action shortcuts). Plan said "delete in cleanup pass." Defer.
- **Real-time yup validation on form fields.** All panels still validate at submit. Phase 3 scope was step indicator + draft state; per-field validation can be a follow-up.

## Next phase

Phase 4 — Mobile/tablet floor surface (`/floor`). 2 days. Depends on Phase 2 (✅ done).
