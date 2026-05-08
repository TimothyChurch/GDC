# GDC Inventory & Items

Two related resources: **Item** (master record for a SKU/material) and **Inventory** (point-in-time stock count).

## Item schema (`server/models/item.schema.ts`)

```
name              String (required)
type              String (indexed)
inventoryUnit     String        — display unit (oz, lb, count, etc.)
purchaseHistory   [ObjectId → PurchaseOrder]
inventoryHistory  [ObjectId → Inventory]
category          String (default 'Other', indexed)
trackInventory    Boolean (default true)
unitSize          Number        — units per package (e.g. 50 lb / bag)
unitLabel         String        — package label (e.g. "bag")
minStock          Number (default 0)
reorderPoint      Number (default 0)
usePerMonth       Number (default 0)
baseCostPrice     Number        — manual cost fallback when no PO history
baseCostSize      Number
baseCostUnit      String
notes             String
```

**Categories** (`ITEM_CATEGORIES` constant): `Bottling`, `Base Ingredient`, `Botanical`, `Bar Supplies`, `Other`. Configurable via `useSettingsStore` (`InventoryCategoryDef[]` with icon strings).

## Inventory schema (`server/models/inventory.schema.ts`)

```
date          Date (required)
item          ObjectId → Item (required, indexed)
location      ObjectId → Vessel (optional)   — for finished bottles in tasting room, etc.
quantity      Number (required)
unitSize      Number   — denormalized at write time for accurate historical stock
unitSizeUnit  String
```

Compound indexes: `{item, date: -1}` (per-item history), `{date: -1}` (range queries).

**Stock model**: latest record per item is treated as current stock. To compute current quantity, sum the last record's `quantity * unitSize` (if unitSize present). The store does this in `getCurrentStock()` and `getTotalQuantity()`.

## Files

| File | Role |
|---|---|
| `server/models/item.schema.ts`, `inventory.schema.ts` | Schemas |
| `types/interfaces/Item.ts`, `Inventory.ts` | Interfaces |
| `server/api/item/{index,[_id],create}.{get,post,put,delete}.ts` | CRUD (delete checks Recipe + PurchaseOrder + Cocktail + Production) |
| `server/api/inventory/{index,by-item/[item],bulk,create,[_id]}.{get,post,put,delete}.ts` | CRUD + bulk create + per-item history |
| `stores/useItemStore.ts` (197 LOC) | `shoppingListItems`, `latestPrice()`, `getVendorName()` |
| `stores/useInventoryStore.ts` (163 LOC) | `loadItemHistory()`, `getCurrentStock()`, `getTotalQuantity()`, `createBulk()` |
| `composables/useInventoryCategories.ts` | Category lookup; `getStockStatus()` (in/low/out) |
| `composables/useItemCategories.ts` | Slim wrapper around settings store |
| `composables/useBottleStock.ts` | 12-month trailing depletion analysis (months-remaining) |
| `utils/inventory.ts` | `bottleStockCheck()`, `currentStock()` — ⚠️ likely superseded |
| `components/Item/ItemInventory.vue` | Per-item chart + table |
| `components/Panel/PanelItem.vue`, `PanelInventory.vue` | Edit forms (item master vs single-record inventory entry) |
| `components/Table/TableItems.vue`, `TableInventoryCategory.vue` | List views |
| `pages/admin/items/{index,[_id]}.vue` | List + detail |
| `pages/admin/inventory/{index,[slug],input,print,shopping-list}.vue` | Multiple inventory views |
| `pages/admin/inventory/{bar-supplies,botanicals,bottling,ingredients,other}.vue` | ⚠️ 5 hardcoded category pages — duplicates `[slug].vue`. See tech-debt. |
| `components/Dashboard/DashboardLowInventory.vue` | Reorder-point alerts widget |

## Special: bulk inventory writes

`POST /api/inventory/bulk` accepts an array of inventory records (1–100). Used by the spreadsheet-style input page (`pages/admin/inventory/input.vue`). Each record is sanitized + yup-validated individually.

## Stock status logic (`useInventoryCategories.getStockStatus`)

```ts
if (qty <= 0) → 'out'
if (qty < reorderPoint) → 'low'
else → 'in'
```

Reactive in stores; ⚠️ status computed values don't always re-fetch when inventory is added — see `tech-debt.md` (TODOS.md outstanding item).

## Receiving a Purchase Order → Inventory

`usePurchaseOrderStore.receivePurchaseOrder(po)`:
1. For each PO line item, compute equivalent inventory units (unit-aware: `useUnitConversion`)
2. Create an `Inventory` record per line item (POST /api/inventory/create)
3. Update Item.inventoryHistory and Item.purchaseHistory backrefs

## Cost lookups

Two parallel implementations of "what does this item cost?":
- `useItemStore.latestPrice(itemId)` — uses store cache
- `utils/helpers.ts.latestPrice(item, purchaseOrders)` — pure function

Both check PO history first, fall back to `baseCostPrice / baseCostSize` manual fields. ⚠️ Consolidate eventually.

## Inventory-related composables

- `useInventoryCategories` — categories + stock status helpers
- `useItemCategories` — categories from settings store
- `useBottleStock` — sophisticated depletion analysis for finished bottles
- `useUnitConversion` — wraps `utils/conversions.ts` for cross-unit math

## Reports

- `Report/ReportInventoryTable.vue` → `pages/admin/reports/inventory.vue`
- Inventory levels feed into TTB/TABC reports (raw materials consumed)
