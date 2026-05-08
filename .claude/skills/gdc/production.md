# GDC Production

A Production record is one bottling/packaging run — turns finished spirit (in vessels) into Bottle inventory.

## Schema (`server/models/production.schema.ts`)

```
date            Date (required, indexed)
vessel          [ObjectId → Vessel]                    — sources (can split a single batch across vessels)
bottle          ObjectId → Bottle (required, indexed)  — finished SKU
bottling        { glassware: ObjectId→Item,
                  cap: ObjectId→Item,
                  label: ObjectId→Item }
quantity        Number (required)                      — bottles produced
costs           { batch, barrel, bottling, labor, ttbTax, tabcTax, other }
productionCost  Number (required, min 0)
bottleCost      Number (required, min 0)               — productionCost / quantity
```

Compound index `{bottle, date: -1}` for per-bottle production history queries.

## TypeScript interface (`types/interfaces/Production.ts`)

Mirrors schema; defines `ProductionCosts` sub-interface.

## Files

| File | Role |
|---|---|
| `server/models/production.schema.ts` | Schema |
| `types/interfaces/Production.ts` | TS interface |
| `server/api/production/{index,[id],create}.{get,post,put,delete}.ts` | CRUD; create has custom cleanup of empty bottling fields; delete checks Batch refs |
| `stores/useProductionStore.ts` (192 LOC) | `createAndReturnId()`, `adjustInventoryForProduction()` (+bottle stock, -materials stock, updates Bottle.inStock) |
| `composables/useProductionCosts.ts` (198 LOC) | Multi-component cost breakdown (batch + barrel + bottling + TTB excise + TABC excise + bottle cost calc) |
| `components/Panel/PanelProduction.vue` | Edit form |
| `components/Production/ProductionWizard.vue` | Multi-step create wizard |
| `components/Production/ProductionCostBreakdown.vue` | Display cost summary |
| `components/Table/TableProductions.vue` | List view |
| `components/Dashboard/DashboardRecentProductions.vue` | Recent runs widget |
| `components/Report/ReportTTBProcessing.vue` | TTB Form 5110.28 (uses production records) |
| `components/Report/ReportProductionChart.vue` | Trends over time |
| `pages/admin/production/{index,[_id]}.vue` | List + detail |

## Cost calculation flow

`useProductionCosts.ts` reactively computes:

```
batchCost       = sum(vessel.contents.value) for source vessels OR linked batch.batchCost
barrelCost      = sum(vessel.barrel.cost) for any barrel sources
bottlingCost    = glassware.latestPrice + cap.latestPrice + label.latestPrice (per bottle)
ttbTax          = proofGallons × $2.70  (Federal CBMA Tier 1, $2.70/PG)
tabcTax         = wineGallons × $2.40   (Texas excise)
total           = batchCost + barrelCost + bottlingCost + ttbTax + tabcTax + other
bottleCost      = total / quantity
```

`bottleToWineGallons(bottle)` handles unit conversion (default 750 mL → wine gallons).

## Side effects on create (`useProductionStore.adjustInventoryForProduction`)

1. Create `Inventory` record for the Bottle (positive quantity)
2. Decrement `Inventory` for each bottling material (glassware, cap, label) by `quantity`
3. If new bottle stock > 0, set `Bottle.inStock = true`

This happens client-side after successful create — ⚠️ not atomic with the production save.

## Tie-in to Batch

When a batch reaches the `Bottled` stage:
- The `batch.stages.bottled.productionRecord` field is set to this Production._id
- The `batch.stages.bottled.bottle` field is set to the produced Bottle._id
- The batch `status` flips to `'completed'`

`server/api/production/[id].delete.ts` checks Batch refs before allowing delete to prevent dangling references.

## TTB tax line tracking

Production has separate `costs.ttbTax` and `costs.tabcTax` fields — these flow into:
- `Report/ReportTTBExciseTax.vue` (federal, monthly)
- `Report/ReportTABCExciseTax.vue` (Texas, monthly)
- `Report/ReportTTBProcessing.vue` (5110.28 form)

See `compliance.md` for the full reporting flow.

## Common operations

### Recording a bottling run

1. Open `Production/ProductionWizard.vue` from `/admin/production` or batch detail page
2. Wizard pre-fills source vessels from a chosen batch
3. Cost breakdown auto-computes via `useProductionCosts`
4. On submit: POST `/api/production/create` → adjust inventory deltas → flip Batch to `Bottled` stage if linked

### Editing costs after the fact

PUT `/api/production/[id]` allows full edit. Re-saving recomputes `bottleCost`. ⚠️ Doesn't re-adjust inventory; quantity changes after the fact create drift.
