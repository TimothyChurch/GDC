# Outstanding tech debt — captured 2026-05-08

Picks up where the multi-round cleanup session left off. Each item links back to
the numbered finding in `.claude/skills/gdc/tech-debt.md` so context can be
re-loaded. Bug-fix items first, then size-reduction, then long tail.

## ⚡ Test + typecheck baseline (don't regress)

- Vitest: **365 tests across 18 files** must stay green
- Nuxt typecheck: **97 errors**, all pre-existing (mostly Mongoose `defineMongooseModel` schema typing). Do not increase.
- CI: `.github/workflows/ci.yml` — vitest blocks, typecheck advisory.

## 🟡 P1 — last item

### #17 — Hardcoded loss `reasonCode: 'foreshots_heads_tails'`
- **Where**: `stores/useBatchStore.ts` `advanceToStage` and the still-charge components
- **Need**: A loss-reason picker UI surfaced when a transfer has `loss.volume > 0`
- **Why deferred**: requires product/UX call on whether the picker lives in the
  charge modal, the advance modal, or as a separate confirmation step
- **Tracker**: `LOSS_REASON_CODES` in `composables/transferDefinitions.ts`

## 🟠 Big component refactors (#39 / #40 / #50)

### `BatchBarrelAging.vue` — 851 LOC (largest remaining)
Per `tech-debt.md` §39, extract:
- `BarrelAgingCard.vue` (per-barrel collapsible)
- `ModalBarrelExit.vue`
- `ModalBarrelAdvanceConfirm.vue`
- `BarrelCostBreakdown.vue`

### `BatchDistillingRun.vue` — 667 LOC
- `DistillingCutsForm.vue`, `DistillingCutsDisplay.vue`, `DistillingAdditionsForm.vue`
- `useCompleteDistillingRun` composable for completion flow

### `BatchDistilling.vue` — 467 LOC (dropped from 508 this session via `applyChargeResult`)
- Same shape as `BatchDistillingRun` extraction; share components when possible

### #40 Stage-component consolidation
`BatchMashing`, `BatchFermenting`, `BatchBlending`, `BatchStorage`, `BatchProofing`
follow ~identical structure (header + edit toggle + display/edit form + footer).
Extract `BatchStageCard.vue(stageName, fields, schema)` shell; per-stage components
define just the field list + validation. Could collapse 5 components into 1 + 5
schemas.

## 🟠 Server work

### #45 (b) — Atomic bulk-spirit withdrawal
Currently `useBatchStore.withdrawBulkSpirits` calls `bulkSpiritStore.withdraw()`
sequentially. Partial-failure surfacing is in place (toast lists which spirits
failed), but **true atomicity** needs:

1. New `server/api/bulkSpirit/withdraw-bulk.post.ts` — accepts an array of
   `{ bulkSpiritId, batchId, volume, volumeUnit }`, replicates the PG/value
   math from `useBulkSpiritStore.withdraw` server-side, runs all writes inside
   a `mongoose.startSession() + session.withTransaction()` block (same pattern
   used in `inventory/bulk.post.ts`).
2. Add `bulkSpiritStore.withdrawMany(items)` that calls the new endpoint and
   replaces local docs via `upsert`.
3. Update `useBatchStore.withdrawBulkSpirits` to use it; drop the per-item
   loop and the partial-failure handling.

### Mongoose schema typing — ~30 typecheck errors
All look like:
```
Type '{ type: StringConstructor; default: string; ... }' is not assignable to
type 'SchemaDefinitionProperty<...>'
```
Affected files: `server/models/{batch,event,item,recipe,reportingPeriod,transfer,vessel,settings,purchaseOrder}.schema.ts` and the cascade into `server/utils/transferEngine.ts`. Fix is upstream in `defineMongooseModel`'s typing
(or local module augmentation). Skip per-file `as any` casts unless we adopt a
helper like:
```ts
import type { SchemaDefinition } from 'mongoose';
type LooseSchema<T> = SchemaDefinition<T> | Record<string, unknown>;
```

## 🔴 Strategic / blocked

### #38 `.noUnknown()` on yup schemas
13+ schemas accept arbitrary extra fields. To make `.noUnknown()` actually
strip, every route needs to use the `validated` return of `validateBody`
instead of the input `sanitized`. Either commit to that refactor or accept
the current state (sanitization handles `$`/`__proto__` — known fields
through-pass).

### #57 — In-memory rate limiter is per-instance
`server/utils/rateLimit.ts` works for single-Node deploys but resets on every
Netlify Function cold start. Migrate to Upstash Redis or Netlify Edge if/when
moving to serverless. Same for `auth/login` (already uses the shared util).

### #64 — Stores swallow errors instead of re-throwing
8–10 store actions catch + toast but don't propagate. Components can't tell
if the action failed; downstream logic continues. Add `throw error` after
the toast (or change return to `Promise<boolean>`). Behavior change for every
caller — needs an audit.

### #52 — Page-store coupling not extreme but worth a pass
A `useBatchWorkflow(batchId)` composable that aggregates stores into a unified
API (`{ batch, vessels, production, advance, save }`) would simplify components.
Lower priority.

## 🔵 Code quality long tail

| # | Item | Notes |
|---|---|---|
| #37 | Response-shape inconsistency | `createCreateHandler` returns doc; `createDeleteHandler` returns `{ message }`; transfer/create returns `{ transfer, batch, updatedVessels }`. Pick one envelope and apply. Lower priority — clients handle the variance today |
| #44 | `Dollar` formatter imported per-file | ~30 places. Either provide via `useDollar()` plugin or accept |
| #53 | `validateObjectId()` placement inconsistent | Some routes call inline before query; factory routes call inside `findById`. Auto-validate inside `extractId()` |
| #56 | Mongoose `.lean()` audit | `bottle/public.get.ts` aggregates inventory per bottle without `.lean()`. Profile at scale |
| #59 | `BulkSpirit` ObjectId vs string typing | Cosmetic |
| #63 | Magic numbers | Already extracted: CBMA tier rates + ceilings (in `utils/federalExciseTax.ts`), TABC rate (in `utils/tabcCalculations.ts`). Still scattered: `'gdc:batch-detail-view'` localStorage key, page sizes 20/50/100, `REORDER_SAFETY_MULTIPLE` in `useItemStore.ts:153` |
| #66 | Structured logger | `console.log/warn` in production paths. Wait for scale; use a wrapper composable so the swap is single-file |

## 🆕 New work surfaced 2026-05-08

### Display-unit migration
A global `useSettingsStore.units` system was added (gallon/ABV%/°F/lb canonical;
UI converts via `useDisplayUnits()`). Migration is per-component — any `.vue`
hardcoding `'gal'`, `'%'`, `'°F'`, `'lb'` should switch to the composable.
Pattern documented at the bottom of `.claude/CLAUDE.md`.

Suggested order:
1. Public marketing components (small surface, low risk)
2. Report components (`Report/*`) — user-facing numbers
3. Stage components (`Batch/*`) — most form inputs
4. Modals + Panels last (forms are sensitive)

## 🟢 Known false positives (already investigated, won't-do)

- **#29** — `inventoryCategoryDefSchema` IS used at `validation.ts:518`
- **#31** — `runtimeConfig.public.wsUrl` IS used by `pages/admin/controls.vue`
- **#41** — Form primitives (`FormFooter`, `DataRow`, `FormVolumeInput`) — patterns
  largely gone post `BatchAdvanceAction.vue` deletion
- **#42** — Card duplicates: `Bottle/BottleCard` (admin) and `Card/CardBottle`
  (public) have different layouts and data types; merge would force compromise
- **#43** — `SiteDatePicker` callsites are now identical (13 places, all
  `<SiteDatePicker v-model="..." />`)

## 🧰 Patterns established this session — reuse them

- **Pure-helper extraction + integration test**: `utils/tabcCalculations.ts`,
  `utils/federalExciseTax.ts`, `utils/productionInventory.ts`,
  `utils/distillingRunCalc.ts`, `utils/batchStages.ts`. Each has a focused
  test file in `tests/utils/`.
- **Reusable composables for page extractions**: `useStillCharge`,
  `useEquipmentLogging`, `useRecipeCostCalculator`, `useBatchDetail`,
  `useSourceVesselOptions`, `useStillOptions`.
- **Cross-store sync via factory**: `useCrudStore.upsert(doc)` instead of
  reaching into `.crud.items.value`.
- **Migration guards**: `runOnceMigration(name, fn)` from
  `server/utils/migrationGuard.ts` — `Settings.migrationsRun: string[]`
  tracks applied migrations atomically.
- **Atomic server bulk writes**: `mongoose.startSession() +
  session.withTransaction()` (see `server/api/inventory/bulk.post.ts`).
- **Stage data accessor**: `getStage(batch, key)` instead of
  `(batch.stages as any).key` — typed for known keys, falls back to dynamic
  string lookup.
- **Typed table handlers**: `Row<T>` from `@tanstack/vue-table` instead of
  `(_e: Event, row: any)`.
