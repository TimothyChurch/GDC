# GDC Bottles

A "Bottle" is a finished-good catalog SKU (e.g. "Gulf Coast Gin 750 mL"). Distinct from `Inventory` (point-in-time stock) and `Production` (the act of bottling).

## Schema (`server/models/bottle.schema.ts`)

```
name        String (required, indexed)
class       String (indexed)        — Whiskey, Gin, etc.
type        String (indexed)
abv         Number
price       Number
volume      Number
volumeUnit  String                  — usually 'mL'
img         String                  — Cloudinary URL
description String
recipe      ObjectId → Recipe
inStock     Boolean
archived    Boolean (default false, indexed)
```

Flat structure; one of the simplest schemas in the codebase.

## Public DTO (`types/interfaces/PublicBottle.ts`)

Subset for `/api/bottle/public` — omits `recipe`, `archived`, timestamps. Used by `usePublicBottleStore`.

## Files

| File | Role |
|---|---|
| `server/models/bottle.schema.ts` | Schema |
| `types/interfaces/Bottle.ts`, `PublicBottle.ts` | Interfaces |
| `server/api/bottle/{index,[_id],create}.{get,post,put,delete}.ts` | CRUD (delete checks Production refs) |
| `server/api/bottle/public.get.ts` | 300s SWR; computes `inStock` from latest Inventory aggregation |
| `stores/useBottleStore.ts` (67 LOC) | Admin store; `getName()`, `bottleNameId`, `activeBottles` (non-archived) |
| `stores/usePublicBottleStore.ts` (49 LOC) | Public read-only store |
| `composables/useBottleStock.ts` | 12-month depletion analysis |
| `components/Bottle/BottleCard.vue` | Admin card |
| `components/Bottle/BottleCardGrid.vue` | Admin grid wrapper |
| `components/Bottle/BottleInventorySection.vue` | Per-bottle inventory chart |
| `components/Bottle/BottleProductionHistory.vue` | Which batches produced this bottle |
| `components/Card/CardBottle.vue` | Public-facing presentational card |
| `components/Panel/PanelBottle.vue` | Edit form (slide-over) |
| `components/Table/TableBottles.vue` | List view |
| `pages/admin/bottles/{index,[_id],inventory}.vue` | Admin pages |
| `pages/bottles.vue`, `bottles/{index,[id]}.vue` | Public pages |

## inStock computation

In `bottle/public.get.ts`:
- For each bottle, find latest `Inventory` record where `item` resolves to this bottle (via Production lookups)
- If `quantity * unitSize > 0`, mark `inStock: true`
- Cached for 5 min

Note: this is a heuristic — actual stock depends on Production runs creating Inventory records. See `production.md`.

## Public catalog

`pages/bottles/index.vue` renders `Card/CardBottle.vue` for each bottle in `usePublicBottleStore.bottles`. Filters to non-archived, in-stock by default. Excludes server-side fields like `recipe`.

## Admin grid view

`pages/admin/bottles/index.vue` renders either:
- `Bottle/BottleCardGrid.vue` (visual grid)
- `Table/TableBottles.vue` (data table)

User toggles between views.

## Bottle inventory page

`pages/admin/bottles/inventory.vue` is a dedicated stock view for bottles only — uses `Report/ReportInventoryTable.vue`.

## Archive vs delete

`archived: true` hides from catalog without removing data (preserves Production history). Use archive for discontinued products. Hard delete only if never bottled.

## Common operations

### Adding a new bottle SKU

1. POST `/api/bottle/create` with name, class, type, volume (mL), abv, price
2. Optionally link to source `recipe` (ObjectId)
3. Upload bottle image via `POST /api/upload` → store returned URL in `bottle.img`

### Marking out of stock

Set `inStock: false` manually or wait for `bottle/public.get.ts` to compute it from latest Inventory.

### Discontinuing

Set `archived: true`. Public catalog filters it out automatically; admin views show with badge.
