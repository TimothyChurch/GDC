# GDC Vessels

Vessels = mash tuns, fermenters, stills, holding tanks, barrels. The "physical container" data model.

> ⚠️ **Mid-revamp** — `vessel.contents[]` mutation patterns are being rewritten in `PLAN-PIPELINE-REVAMP.md`. Don't suggest restructuring the contents array logic until that plan begins.

## Schema (`server/models/vessel.schema.ts`)

```
name                       String (required)
type                       String (required, indexed)   — fermenter | mash tun | still | tank | barrel
stats                      { weight, weightUnit, volume, volumeUnit }
barrel                     { size, char, cost }                                — only for barrels
contents                   [{ batch: ObjectId→Batch, volume, volumeUnit, abv,
                              proof (optional, 2×ABV fallback),
                              value, addedAt, lastTransferId: ObjectId→Transfer }]
current                    { volume, volumeUnit, abv, value }   — denormalized snapshot
cost                       Number
location                   String
status                     String (indexed)                                    — 'Active' | 'Empty' | 'In Use' | etc
isUsed                     Boolean (default false)                              — has the barrel been filled at least once?
previousContents           String  ⚠️ DEPRECATED — replaced by previousContentsHistory
previousContentsHistory    [{ batchRecipeName, batchId: ObjectId→Batch, departedAt, transferId: ObjectId→Transfer }]
targetAge                  Number   — months (for barrels)
contentsVersion            Number (default 0)              — bumped by Transfer engine (optimistic lock)
cachedAt                   Date
```

### Key idea: `contents[]` is multi-slot

A vessel can hold multiple batches simultaneously (co-aging in a barrel, blending in a tank). Each entry is a "slot" referencing one batch. `current` is the denormalized aggregate (sum/avg) of all slots.

## TypeScript interface (`types/interfaces/Vessel.ts`)

Mirrors schema with `Contents` (in `types/interfaces/Contents.ts`) and `PreviousContentsEntry` sub-interfaces.

## Files

| File | Role |
|---|---|
| `server/models/vessel.schema.ts` | Schema |
| `types/interfaces/Vessel.ts`, `Contents.ts` | Interfaces |
| `server/api/vessel/{index,[id],create}.{get,post,put,delete}.ts` | CRUD; delete pre-check requires `contents.length === 0` |
| `stores/useVesselStore.ts` (353 LOC) | `emptyVessel()`, `disposeBarrel()`, `fullTransfer()`, `transferBatch()`, `transferBatchContents()`, `addContents()`. Computed: `fermenters`, `mashTuns`, `stills`, `tanks`, `barrels`, `emptyBarrels` |
| `utils/vesselTransfer.ts` (60 LOC) | ⚠️ **Unused duplicate** — useVesselStore is canonical. Dead code. |
| `composables/definitions.ts` | `BARREL_SIZES`, `CHAR_LEVELS` constants |
| `components/Vessel/VesselCard.vue`, `VesselGrid.vue` | List view |
| `components/Barrel/BarrelCard.vue`, `BarrelWarehouse.vue` | Barrel-specific views |
| `components/Panel/PanelVessel.vue`, `PanelVesselTransfer.vue` | Edit form + transfer form |
| `components/Modal/ModalBarrelFill.vue` | Fill empty barrel from a batch |
| `components/Dashboard/DashboardVesselOverview.vue` | Utilization widget |
| `pages/admin/vessels/{index,[_id]}.vue` | List + detail |
| `pages/admin/barrels.vue` | Barrel-specific page |

## Vessel types

| `type` | Notes |
|---|---|
| `fermenter` | Holds wash during Fermenting stage |
| `mash tun` | Holds mash during Mashing stage |
| `still` | Used during Stripping/Spirit/Distilling stages |
| `tank` | General-purpose holding (Storage, Blending, Proofing) |
| `barrel` | Aging container; tracks `barrel.size`, `barrel.char`, `targetAge`, `previousContentsHistory` |

`STAGE_VESSEL_TYPE` in `composables/batchPipeline.ts` maps each batch stage to the required vessel type.

## Slot operations (current — being replaced)

```ts
const vessels = useVesselStore()

vessels.addContents(vesselId, { batch, volume, volumeUnit, abv, value })   // add new slot
vessels.transferBatch(srcVesselId, destVesselId, { batch, volume })         // partial move
vessels.fullTransfer(srcVesselId, destVesselId)                             // entire contents
vessels.transferBatchContents(srcVesselId, destVesselId, batchId)           // one slot's contents
vessels.emptyVessel(vesselId)                                               // dump (audit-trail issue, see plan)
vessels.disposeBarrel(barrelId)                                             // mark as out-of-service
```

⚠️ Each of these issues sequential PUT calls to `/api/vessel/[id]` with no transactional guarantee. The Transfer revamp will replace them with a single atomic `POST /api/transfer/create`.

## Barrel-specific behavior

- `previousContentsHistory[]` accumulates a record every time a batch leaves the barrel — enables "this 53-gal bourbon barrel previously held 3 batches over 4 years" tracking
- `previousContents` (string) is the legacy field — readers fall back to it if history is empty
- `isUsed: true` flips the first time a batch is added (used for "fresh barrel" inventory filtering)
- `targetAge` (months) drives barrel-aging deadline calculations in compliance reports

## Co-aging / blending

The `contents[]` array supports multiple batch slots in one vessel:
- Barrels with mixed batch fills (rare but happens)
- Blending tanks with multiple source batches
- Proofing tanks with water added (water isn't a batch — TBD how the Transfer revamp handles non-batch additions)

`current` is a denormalized roll-up (total volume, weighted-avg ABV, total value). Components prefer `current` for display.

## Common operations

### Adding a new vessel

POST `/api/vessel/create` with `name`, `type`, `stats.volume`, `stats.volumeUnit`. Initial `contents: []`, `status: 'Empty'`.

### Filling a barrel

`Modal/ModalBarrelFill.vue` — pick batch, volume, then writes:
1. `addContents(barrelId, ...)` 
2. Optionally update batch stage to `'Barrel Aging'`
3. Set `barrel.isUsed = true`

### Emptying

`emptyVessel(id)` — clears contents + appends to `previousContentsHistory`. ⚠️ Currently records "departure" as a side effect; Transfer revamp will make this an explicit Transfer record.

## Reports

- `Dashboard/DashboardVesselOverview.vue` — utilization snapshot
- `Report/ReportBarrelAging.vue` — barrel age distribution + warnings on overdue
