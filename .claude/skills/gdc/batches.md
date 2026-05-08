# GDC Batches

The most complex domain. Tracks every spirit production lifecycle from grain to bottle.

> ⚠️ **Active refactor** — `PLAN-PIPELINE-REVAMP.md` (created 2026-05-07, 0% implemented) will rewrite the transfer mechanics. Don't suggest restructuring `useBatchStore.advanceToStage()`, `transferBatch()`, or stage transitions until that plan starts. See `transfers.md`.

## Schema (`server/models/batch.schema.ts`)

```
recipe          ObjectId → Recipe (required, indexed)
batchNumber     String
pipeline        String[] (required) — e.g. ['Mashing', 'Fermenting', 'Distilling', 'Storage', 'Proofing', 'Bottled']
currentStage    String (required, indexed)
status          enum: 'active' | 'completed' | 'cancelled' (default 'active', indexed)
batchSize       Number (required)
batchSizeUnit   String (required)
recipeCost      Number (required)
batchCost       Number
barrelCost      Number
notes           String
ttbAccount      enum: 'production' | 'storage' | 'processing' | 'tib_external' | 'tax_paid' (default 'production', indexed)

stages          { mashing, fermenting, strippingRun, lowWines, spiritRun, distilling,
                  maceration, filtering, barrelAging, storage, blending, proofing, bottled }
                Each stage: stageBase (startedAt, completedAt, vessel, notes) + stage-specific fields

stageVolumes    Map<string, number>      — denormalized cache, recomputable
stageProofs     Map<string, number>      — denormalized cache, recomputable
cacheVersion    Number (default 0)       — bumped by Transfer engine
cachedAt        Date

tastingNotes    [{ date, abv, notes, addedBy }]
log             [{ date, action, user, details }] — activity log
transferLog     ⚠️ DEPRECATED — replaced by Transfer collection (kept readable during migration)
```

## TypeScript interface (`types/interfaces/Batch.ts`)

Mirrors schema exactly. Extra typed sub-shapes: `BatchStages`, `TastingNote`, `DistillingRun`. No drift.

## Pipeline (the 13 stages)

Defined in `composables/batchPipeline.ts`:

```
ALL_STAGES = ['Upcoming', 'Mashing', 'Fermenting', 'Stripping Run', 'Low Wines',
              'Spirit Run', 'Distilling', 'Maceration', 'Filtering', 'Barrel Aging',
              'Storage', 'Blending', 'Proofing', 'Bottled']
```

Each recipe has its own `pipeline` (subset of these stages, in order). Pre-built templates in `PIPELINE_TEMPLATES` (e.g. "Grain Spirit Barreled", "Redistilled Gin", "Neutral Spirit", etc.).

`STAGE_KEY_MAP` maps display name → batch.stages key (e.g. "Stripping Run" → `strippingRun`).
`STAGE_VESSEL_TYPE` maps each stage → required vessel type (e.g. Mashing → mash tun, Distilling → still).
`STAGE_DISPLAY` provides icon + color for UI.

## Stage-specific data

| Stage | Fields |
|---|---|
| `mashing` | gravity readings, pH, ingredients (linked Items + amounts) |
| `fermenting` | temperature curve, gravity over time, yeast pitched |
| `strippingRun`, `lowWines`, `spiritRun` | distillation cuts (foreshots/heads/lateHeads/hearts/tails), vessel, runs[] |
| `distilling` | legacy single-run fields + new `runs[]` array (use `utils/distillingMigration.ts` to normalize) |
| `maceration` | start/end dates, botanicals, notes |
| `filtering` | filter type, abv before/after |
| `barrelAging` | entry/exit volumes + ABV, sampling notes |
| `storage` | volume, vessel |
| `blending` | source vessels, ratios |
| `proofing` | water added, target ABV, weight readings |
| `bottled` | productionRecord (→ Production), bottle (→ Bottle), quantity |

## Files involved

| File | Role |
|---|---|
| `server/models/batch.schema.ts` | Schema |
| `types/interfaces/Batch.ts` | TS interface |
| `server/api/batch/index.get.ts`, `[id].{get,put,delete}.ts`, `create.post.ts` | CRUD |
| `server/api/batch/deduplicate-pipelines.post.ts` | Admin migration: remove duplicate stages |
| `server/api/batch/migrate-distilling-stages.post.ts` | Admin migration: split old Distilling → Stripping/Low Wines/Spirit |
| `stores/useBatchStore.ts` (815 LOC) | All client logic — see below |
| `composables/batchPipeline.ts` | Stage definitions + helpers |
| `composables/transferDefinitions.ts` | TTB enums + reporting period math |
| `utils/distillingMigration.ts` | `normalizeDistillingRuns()` for legacy data |
| `components/Batch/*.vue` (27 components) | Per-stage UI + Kanban + Stepper |
| `components/Panel/PanelBatch.vue` | Edit form (slide-over) |
| `components/Modal/ModalBarrelFill.vue`, `ModalDistillingCharge.vue` | Stage-action modals |
| `components/Table/TableBatches.vue` | List view |
| `pages/admin/batch/index.vue`, `[_id].vue` | List & detail pages |

## Store actions (selected highlights)

```ts
const batchStore = useBatchStore()

batchStore.startFirstStage(batchId)                  // moves Upcoming → first pipeline stage
batchStore.advanceToStage(batchId, 'Storage')        // ⚠️ mid-revamp; uses sequential PUTs
batchStore.updateStageData(batchId, 'fermenting', {...})
batchStore.revertToPreviousStage(batchId)            // ⚠️ mid-revamp; vessel handling broken
batchStore.withdrawMashIngredients(batchId)          // deduct mash items from Inventory
batchStore.withdrawBulkSpirits(batchId)              // deduct from BulkSpirit ledger
batchStore.addTastingNote(batchId, { abv, notes })
// distilling/stripping/spirit run CRUD: addDistillingRun, updateDistillingRun, removeDistillingRun
```

## Relationships

- Batch → Recipe (1:1 ref)
- Batch → Vessel (many: each stage records vessel used)
- Batch → Bottle (via `stages.bottled.bottle` after bottling)
- Batch → Production (via `stages.bottled.productionRecord`)
- Batch ← BulkSpirit (deposits/withdrawals reference batch)
- Batch ← EquipmentLog (each log entry refs a batch)
- Batch ← Transfer (NEW, sources/destinations reference batch)

## Common operations

### Adding a new stage type

1. Add to `ALL_STAGES` in `composables/batchPipeline.ts`
2. Add to `STAGE_KEY_MAP`, `STAGE_DISPLAY`, `STAGE_VESSEL_TYPE`
3. Add stage-specific fields to `BatchStages` in schema and interface
4. Add UI: `components/Batch/Batch{StageName}.vue`
5. Update `pipeline` defaults (recipes that should include this stage)
6. ⚠️ Existing batches won't have the field — handle `undefined` gracefully or write a migration script

### Adding a field to an existing stage

Use **data-model-specialist** subagent — touches 5 layers (schema, interface, validation, store, component).

## Dashboard widget

`Dashboard/DashboardBatchPipeline.vue` shows all active batches by stage. Pulls from `useBatchStore.items` filtered by `status === 'active'`.
