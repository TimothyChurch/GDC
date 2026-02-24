# GDC TODO Implementation Plan

> Generated 2026-02-24 based on `TODOS.md` analysis and full codebase exploration.

---

## Overview

22 items organized into 5 phases based on dependency order, complexity, and impact. Each phase groups items that touch similar files/systems to minimize context-switching and maximize coherent progress.

---

## Phase 1: Bug Fixes & Quick Wins

_Fix broken behavior and make small, high-impact changes that don't require schema modifications._

### 1.1 Fix Table Pagination (TODO #18)

**Problem**: All tables show every row despite having pagination controls (page size selector, page numbers). The `UTable` + `TableWrapper` pattern is wired but `getPaginationRowModel()` from TanStack is likely not imported or passed to the table options.

**Files to investigate/modify**:
- `components/Table/TableWrapper.vue` — pagination controls and UPagination wiring
- All 11 table components: `TableBatches`, `TableItems`, `TableBottles`, `TableProductions`, `TableCocktails`, `TableContacts`, `TableInventoryItems`, `TableInventoryBottles`, `TableInventoryCategory`, `TableCocktailExpand`, `TableItems`

**Actions**:
1. Check if `getPaginationRowModel` is imported from `@tanstack/vue-table` and passed in each table
2. Verify `v-model:pagination` is correctly bound between `TableWrapper` and `UTable`
3. Verify the `UPagination` component in `TableWrapper` correctly updates `pagination.pageIndex`
4. Test with >10 rows to confirm rows are correctly paginated
5. Check that search/filter resets `pageIndex` to 0

**Agent**: `pro-debugger`

---

### 1.2 Filter Empty Barrels in Transfer Dropdown (TODO #6)

**Problem**: When selecting a barrel for batch transfer, all barrels show in the dropdown — should only show empty barrels.

**Files**:
- `stores/useVesselStore.ts` — add `emptyBarrels` computed getter
- `components/Batch/BatchBarrelAging.vue` or barrel selection UI — use filtered list
- `components/Modal/ModalDistillingCharge.vue` — if barrel selection happens here too

**Actions**:
1. Add `emptyBarrels` computed to `useVesselStore`: filter `barrels` where `current.volume === 0` or `contents.length === 0`
2. Replace barrel dropdown data source with `emptyBarrels` in all transfer/assignment UIs
3. For the batch barrel assignment specifically, also include the barrel already assigned to this batch (so editing doesn't hide the current selection)

**Agent**: `distillery-admin-builder`

---

### 1.3 Remove Inventory Record List from Bottle Page (TODO #13)

**Problem**: Bottle detail page shows both a graph AND a full list of inventory records. Only the graph is needed.

**Files**:
- `pages/admin/bottles/[_id].vue` — remove the inventory records table/list section

**Actions**:
1. Remove the reverse-sorted inventory records list section
2. Keep the inventory chart (Chart.js Line), add-entry form, and stock summary stats
3. Verify the chart alone provides sufficient data visibility

**Agent**: `distillery-admin-builder`

---

### 1.4 Edit Barrel Entry Date and Proof (TODO #1)

**Problem**: Barrel entry date and proof fields are not editable after initial entry.

**Files**:
- `components/Batch/BatchBarrelAging.vue` — barrel entry form fields
- `pages/admin/batch/[_id].vue` — batch detail page

**Current state**: `BatchBarrelAging.vue` has `entry: { date, volume, volumeUnit, abv, proofGallons }` fields. The `date` and `abv` fields may be read-only or auto-calculated. Need to make them editable with proper save action.

**Actions**:
1. Ensure `entry.date` and `entry.abv` fields are editable `UInput`/`UDatePicker` components (not just display text)
2. Add a save/update mechanism that calls `batchStore.updateBatch()` with the modified barrel entry data
3. Recalculate `entry.proofGallons` when ABV changes (PG = volume * ABV / 100 in wine gallons)
4. Add validation: date must be valid, ABV between 0-100

**Agent**: `distillery-admin-builder`

---

## Phase 2: Data Model Enhancements

_Extend schemas, interfaces, and types. These changes lay the groundwork for Phase 3 features._

### 2.1 Spirit Run Cuts Enhancement (TODO #2)

**Problem**: Spirit runs need dedicated fields for heads, late heads, hearts, and tails — each with volume, ABV, and vessel assignment.

**Current state**: The schema already has `stages.distilling.runs[].collected` with `foreshots`, `heads`, `hearts`, `tails` — each having `vessel`, `volume`, `volumeUnit`, `abv`. However:
- There is no `lateHeads` cut (between heads and hearts)
- The UI (`BatchDistillingRun.vue`) may not expose all fields

**Files**:
- `types/interfaces/Batch.ts` — add `lateHeads` to `DistillingCollected` interface
- `server/models/batch.schema.ts` — add `lateHeads` subdocument to `collected` in distilling runs
- `components/Batch/BatchDistillingRun.vue` — update UI to show all cut fields with volume, ABV, and vessel selector
- `components/Batch/BatchDistilling.vue` — ensure parent passes data correctly

**Actions**:
1. Add `lateHeads: { vessel, volume, volumeUnit, abv }` to both the Mongoose schema and TypeScript interface alongside existing cuts
2. Update `BatchDistillingRun.vue` to show a clear section for each cut: foreshots, heads, late heads, hearts, tails
3. Each cut row needs: volume input, volume unit select, ABV input, vessel selector (from `vesselStore.tanks` or appropriate vessel type)
4. Auto-calculate proof gallons per cut and run total
5. Ensure the `total` field aggregates all cuts including late heads
6. Update TTB report logic if it references distilling cuts (check `ReportTTBProduction.vue`)

**Agent**: `distillery-admin-builder` + `ttb-tabc-compliance` (for report impact)

---

### 2.2 Used Barrel Tag (TODO #8)

**Problem**: When a barrel is dumped, it should be tagged as "used". This tag should also be manually settable for purchasing pre-used barrels.

**Files**:
- `types/interfaces/Vessel.ts` — add `isUsed: boolean` and `previousUse?: string` fields
- `server/models/vessel.schema.ts` — add fields to schema
- `stores/useVesselStore.ts` — update barrel dump logic to set `isUsed = true`
- `components/Panel/PanelVessel.vue` — add "Used" toggle and `previousUse` field to barrel form
- `pages/admin/vessels/[_id].vue` — show used/new badge on vessel detail

**Actions**:
1. Add `isUsed` (Boolean, default false) and `previousUse` (String, optional) to vessel schema and interface
2. When batch moves from "Barreled" to "Bottled" (barrel dump), automatically set `vessel.isUsed = true` and `vessel.previousUse` to the spirit type of the batch
3. Add editable toggle in `PanelVessel.vue` for manually marking barrels as used (for purchased used barrels)
4. Add `previousUse` text input when `isUsed` is true
5. Display a "Used" / "New" badge on the vessel detail page and in barrel lists
6. Update server-side validation for the new fields

**Agent**: `distillery-admin-builder`

---

### 2.3 Item Notes Section (TODO #16)

**Problem**: Items need a notes section for miscellaneous details (e.g., average weight per unit).

**Files**:
- `types/interfaces/Item.ts` — add `notes?: string` field
- `server/models/item.schema.ts` — add `notes` field
- `components/Panel/PanelItem.vue` or `components/Form/FormItem.vue` — add notes textarea
- `pages/admin/items/[_id].vue` — display notes on detail page

**Actions**:
1. Add `notes: String` to item schema (optional, trimmed)
2. Add `notes?: string` to Item interface
3. Add `UTextarea` for notes in the item form/panel
4. Display notes on the item detail page in a dedicated section
5. Update server-side item validation to include optional notes string

**Agent**: `distillery-admin-builder`

---

### 2.4 Barrel Age Goals with Size-Based Defaults (TODO #3)

**Problem**: Barrels need individual age goals. Defaults should be based on barrel size: 12 months (5 gal), 15 months (10 gal), 18 months (15 gal), 24 months (30 gal). Defaults should be configurable.

**Current state**: `batch.stages.barrelAging.targetAge` exists (number, in months) but there are no size-based defaults and no way to configure them globally.

**Files**:
- `types/interfaces/Vessel.ts` — add `targetAge?: number` to vessel schema
- `server/models/vessel.schema.ts` — add `targetAge` field
- `composables/definitions.ts` or new `composables/barrelDefaults.ts` — default age-goal map
- `components/Batch/BatchBarrelAging.vue` — auto-populate targetAge from barrel size defaults
- `pages/admin/vessels/[_id].vue` — show/edit age goal per barrel
- Future: admin settings page will allow editing the defaults (Phase 5)

**Actions**:
1. Create a barrel age defaults map: `{ '5 gal': 12, '10 gal': 15, '15 gal': 18, '30 gal': 24 }` in `composables/definitions.ts`
2. Add `targetAge` to vessel schema/interface for per-barrel override
3. When a batch enters the "Barreled" stage and a barrel is selected, auto-populate `barrelAging.targetAge` from the barrel's `targetAge` or fall back to the size-based default
4. Show progress toward target on the barrel aging card (e.g., "8 / 24 months — 33%")
5. Make the target editable on both the batch barrel aging section and the individual vessel detail page
6. Store the defaults in a way that the admin settings page (Phase 5) can later modify them — consider a `settings` collection in MongoDB or a simple config document

**Agent**: `distillery-admin-builder`

---

### 2.5 Batch Tasting Notes Section (TODO #7)

**Problem**: Batch page should have a space for tasting notes with date, sample ABV, and notes.

**Current state**: `barrelAging.samplings[]` already has `{ date, abv, volume, volumeUnit, notes }`. However, this only applies during barrel aging. A more general tasting notes system is needed that works across all stages.

**Files**:
- `types/interfaces/Batch.ts` — add `tastingNotes: TastingNote[]` array to batch root
- `server/models/batch.schema.ts` — add `tastingNotes` subdocument array
- `stores/useBatchStore.ts` — add `addTastingNote()` action
- `pages/admin/batch/[_id].vue` — add tasting notes section
- New `components/Batch/BatchTastingNotes.vue` — tasting notes list + add form

**Actions**:
1. Define `TastingNote` interface: `{ date: string, abv?: number, notes: string, addedBy?: string }`
2. Add `tastingNotes: TastingNote[]` to batch schema and interface
3. Create `BatchTastingNotes.vue` component:
   - Display list of notes (sorted newest-first) with date, ABV, and notes text
   - Inline add form: date picker (default today), ABV input (optional), notes textarea, add button
4. Add `addTastingNote(batchId, note)` store action that pushes to the array
5. Place the tasting notes component on the batch detail page — visible on all stages, below the stage-specific card
6. Consider merging/migrating existing `barrelAging.samplings` into this unified system, or keep both with a note that samplings are barrel-specific measurements and tasting notes are general

**Agent**: `distillery-admin-builder`

---

### 2.6 Item Inventory Opt-Out (TODO #19)

**Problem**: Items should have the ability to opt out of inventory tracking.

**Files**:
- `types/interfaces/Item.ts` — add `trackInventory: boolean` (default true)
- `server/models/item.schema.ts` — add field
- `components/Panel/PanelItem.vue` / `components/Form/FormItem.vue` — add toggle
- `pages/admin/items/[_id].vue` — show/hide inventory section based on flag
- `composables/useInventoryCategories.ts` — filter out non-tracked items
- `composables/useSidebarBadges.ts` — exclude non-tracked from low-stock count

**Actions**:
1. Add `trackInventory: { type: Boolean, default: true }` to item schema
2. Add `trackInventory: boolean` to Item interface (default true)
3. Add a toggle switch in the item form: "Track inventory for this item"
4. When `trackInventory` is false:
   - Hide inventory section on item detail page
   - Exclude from inventory reports and sheets
   - Exclude from low-stock/out-of-stock counts
   - Exclude from shopping list (Phase 4)
5. Add filter to `useInventoryCategories` and sidebar badge computations

**Agent**: `distillery-admin-builder`

---

## Phase 3: Cost Tracking & Production Flow

_Build out cost accounting and the batch-to-production pipeline. Depends on Phase 2 schema changes._

### 3.1 Barrel Cost in Batch Cost (TODO #9)

**Problem**: When a batch is barreled, the barrel's cost should be added to the overall batch cost and visible on the batch page next to recipe cost.

**Current state**: Batch has `recipeCost` and `batchCost` (ingredient-based). Vessel has `barrel.cost`. There is no `barrelCost` on the batch.

**Files**:
- `types/interfaces/Batch.ts` — add `barrelCost?: number`
- `server/models/batch.schema.ts` — add `barrelCost` field
- `stores/useBatchStore.ts` — set `barrelCost` when barrel is assigned
- `components/Batch/BatchHeader.vue` — display barrel cost alongside recipe/batch cost
- `components/Batch/BatchBarrelAging.vue` — auto-populate barrel cost from vessel

**Actions**:
1. Add `barrelCost: Number` to batch schema (optional, default 0)
2. When a batch enters "Barreled" stage and a vessel is assigned, look up `vessel.barrel.cost` and set `batch.barrelCost`
3. Display on batch header: "Recipe Cost: $X | Barrel Cost: $Y | Total: $Z"
4. Make barrel cost editable (in case the auto-populated value needs adjustment)
5. Compute `totalBatchCost = batchCost + barrelCost` as a derived value

**Agent**: `distillery-admin-builder`

---

### 3.2 Production Cost Breakdown (TODO #12)

**Problem**: Production costs should be broken out: Batch cost, Barrel cost, Bottling cost, Taxes, etc.

**Current state**: Production only has `productionCost` (total) and `bottleCost` (per-bottle) — both manually entered.

**Files**:
- `types/interfaces/Production.ts` — add cost breakdown fields
- `server/models/production.schema.ts` — add cost subdocument
- `components/Form/FormProduction.vue` — add cost breakdown inputs
- `stores/useProductionStore.ts` — handle new fields

**Actions**:
1. Add cost breakdown to production schema/interface:
   ```ts
   costs: {
     batch: number      // pulled from batch.batchCost
     barrel: number     // pulled from batch.barrelCost
     bottling: number   // materials: glass, caps, labels
     labor: number      // optional manual entry
     taxes: number      // excise tax calculation
     other: number      // miscellaneous
   }
   ```
2. Auto-calculate `productionCost` as sum of all cost fields
3. Auto-calculate `bottleCost` as `productionCost / quantity`
4. In FormProduction: auto-populate batch and barrel costs from the linked batch, allow manual entry for bottling, labor, taxes, other
5. Display cost breakdown on production detail and batch bottled stage
6. For bottling materials cost: if `bottling.glassware`, `bottling.cap`, `bottling.label` items have prices, auto-calculate from `latestPrice * quantity`

**Agent**: `distillery-admin-builder`

---

### 3.3 Batch-to-Production Flow (TODO #10)

**Problem**: When moving a batch to "Bottled" / production stage, it should create a new production record automatically.

**Current state**: `batch.stages.bottled.productionRecord` is an ObjectId ref, but the production record must be created separately. There is no automated flow.

**Files**:
- `stores/useBatchStore.ts` — modify `advanceBatchStatus` for Bottled transition
- `stores/useProductionStore.ts` — ensure `create` returns the new record ID
- `components/Batch/BatchAdvanceAction.vue` — trigger production creation
- `components/Batch/BatchBottled.vue` — show linked production record

**Actions**:
1. When batch advances to "Bottled" stage:
   a. Open a production creation form/modal pre-filled with batch data (vessel, date, costs from batch)
   b. User fills in: bottle selection, quantity, bottling materials, lot number, labeled ABV
   c. On form submit: create the production record, then update batch with `stages.bottled.productionRecord = newProductionId`
2. Alternative: navigate to a pre-filled production creation page with batch ID as query param
3. The production form should auto-populate: date (today), costs (from batch), vessels (from batch's current vessel)
4. After production is created, link it back to the batch
5. Show the linked production record on the batch detail page (Bottled stage card)

**Agent**: `distillery-admin-builder`

---

### 3.4 Production Date Adjustment (TODO #11)

**Problem**: Should be able to input or adjust the production date on the product portion of the wizard.

**Current state**: Production `date` is initialized to `new Date()` in the store. The form may or may not expose it for editing.

**Files**:
- `components/Form/FormProduction.vue` — ensure date field is an editable date picker
- `stores/useProductionStore.ts` — verify date is included in create/update payloads

**Actions**:
1. Verify `FormProduction.vue` has a `UInput[type="date"]` or `UDatePicker` for the production date
2. If missing, add it with default value of today
3. Ensure the date is editable both during creation and when editing an existing production
4. Validate date is not in the future (optional, based on business rules)

**Agent**: `distillery-admin-builder`

---

### 3.5 Production Records on Bottle Page (TODO #14)

**Problem**: Production records of a bottle should appear on the bottle page, with the most recent used for cost/bottle.

**Current state**: Bottle detail page shows inventory chart and entries. Production records exist but aren't displayed on the bottle page. Cost per bottle is manually entered on production, not derived.

**Files**:
- `pages/admin/bottles/[_id].vue` — add production records section
- `stores/useProductionStore.ts` — add getter to filter productions by bottle ID

**Actions**:
1. Add `getProductionsByBottle(bottleId)` computed or method to production store
2. On bottle detail page, add a "Production History" section showing:
   - Production date, quantity, batch link, lot number, cost per bottle
   - Sorted most recent first
3. Display the most recent production's `bottleCost` as the current "Cost per Bottle" metric
4. Make each production entry clickable to navigate to the full production detail
5. If no productions exist, show empty state: "No production records for this bottle"

**Agent**: `distillery-admin-builder`

---

## Phase 4: Inventory Intelligence

_Build the automated inventory management pipeline. Depends on Phase 2 (item opt-out) and Phase 3 (production flow)._

### 4.1 Out-of-Stock Items Excluded from Inventory Sheets (TODO #20)

**Problem**: Items marked out of stock should not appear on inventory report sheets.

**Files**:
- `components/Report/ReportInventoryTable.vue` — filter out out-of-stock items
- `composables/useInventoryCategories.ts` — add filter option
- Any other inventory report components

**Actions**:
1. In inventory report components, filter out items where latest inventory quantity <= 0 AND `trackInventory !== false`
2. Add a toggle on the report page: "Show out-of-stock items" (default off) so users can optionally include them
3. Ensure items with `trackInventory: false` (from Phase 2) are always excluded

**Agent**: `distillery-admin-builder`

---

### 4.2 Auto-Update Inventory from PO/Production (TODO #21)

**Problem**: When a PO is marked "Received" or a Production is completed, item inventory should automatically update.

**Current state**: PO status changes and inventory entries are completely manual and disconnected.

**Files**:
- `stores/usePurchaseOrderStore.ts` — add `receivePO()` action
- `stores/useInventoryStore.ts` — add `adjustQuantity()` or `addEntry()` action
- `stores/useProductionStore.ts` — hook into production creation to adjust bottle inventory
- `stores/useItemStore.ts` — update stock status
- Server-side: potentially new API endpoint or enhanced PO update logic

**Actions**:
1. **PO Received flow**:
   a. When PO status changes to "Received", iterate through PO line items
   b. For each item: create an inventory record with the received quantity added to current stock
   c. Update item's stock status based on new quantity
   d. Show confirmation toast with summary of inventory adjustments
2. **Production Completed flow**:
   a. When a production record is created, increase the linked bottle's inventory by `quantity`
   b. Optionally decrease raw material inventory for bottling materials (glassware, caps, labels) by `quantity`
   c. Update stock statuses accordingly
3. Add server-side logic to handle these cascading updates atomically (consider a transaction or at least sequential writes)
4. Add visual feedback: "Inventory updated: +24 Glass Bottles, +24 Caps, +24 Labels"

**Agent**: `distillery-admin-builder` + `nuxt-server-specialist` (for server transaction logic)

---

### 4.3 Generated Shopping List (TODO #22)

**Problem**: Need a shopping list showing all low and out-of-stock items that need purchasing. Items without inventory history should be excluded.

**Files**:
- New `pages/admin/inventory/shopping-list.vue` — shopping list page
- New `components/Inventory/ShoppingList.vue` or similar — list component
- `stores/useItemStore.ts` — add `shoppingListItems` computed
- `composables/useSidebarBadges.ts` — potentially link badge to shopping list

**Actions**:
1. Add `shoppingListItems` computed to item store:
   - Filter items where `trackInventory !== false`
   - Filter items that have at least one inventory history record (exclude items never tracked)
   - Filter to items that are "Low Stock" or "Out of Stock" (quantity <= reorderPoint)
   - Include: item name, category, current stock, reorder point, vendor/contact, last price
2. Create shopping list page at `/admin/inventory/shopping-list`
3. Display as a table grouped by category or vendor
4. Include columns: item name, current stock, reorder point, suggested order qty (reorderPoint - current + buffer), vendor, estimated cost
5. Add "Create PO" action that can generate a purchase order from selected shopping list items
6. Add route to admin sidebar under Inventory section
7. Link the sidebar low-inventory badge to this page

**Agent**: `distillery-admin-builder`

---

## Phase 5: UX Improvements & Admin Settings

_Polish and configuration features. Can be done in parallel with other phases where noted._

### 5.1 Inline Recipe Ingredient Editing (TODO #15)

**Problem**: Currently must delete an ingredient and re-add it to change amounts. Need inline editing.

**Files**:
- `components/Panel/PanelRecipe.vue` — refactor ingredient list to be editable
- Potentially `pages/admin/recipes/[_id].vue` — if ingredient editing is on detail page

**Actions**:
1. Replace the static ingredient display rows with inline-editable fields:
   - Amount: `UInput` (number, small width)
   - Unit: `USelect` or `USelectMenu` (unit options)
   - Each row has: save (check) and delete (trash) action buttons
2. Clicking on an ingredient row enters "edit mode" for that row (or all rows are always editable)
3. Recommended approach: make amount and unit always-editable inline (no separate edit mode). Each row shows the item name (read-only, since changing the item is effectively a different ingredient), editable amount, editable unit, and delete button
4. Changes are tracked in the local `localData.value.items` array and saved when the overall form is submitted
5. Add visual indication of unsaved changes

**Agent**: `distillery-admin-builder`

---

### 5.2 Admin Settings Page (TODO #17)

**Problem**: Need a centralized admin settings page for: item categories, theme colors, processing stages, barrel age defaults, and future settings.

**Files**:
- New `pages/admin/settings.vue` — settings page
- New `server/models/settings.schema.ts` — settings document
- New `types/interfaces/Settings.ts` — settings interface
- New `stores/useSettingsStore.ts` — settings state management
- New `server/api/settings/` — CRUD endpoints
- `composables/definitions.ts` — read categories/stages from settings instead of hardcoded arrays
- `components/Admin/AdminSidebar.vue` — add Settings link

**Actions**:
1. **Data model**: Create a `Settings` MongoDB document (singleton pattern — one document for the whole app):
   ```ts
   {
     itemCategories: string[]           // ["Bottling", "Base Ingredient", "Botanical", "Bar Supplies", "Other"]
     batchStages: string[]              // ["Upcoming", "Brewing", "Fermenting", "Distilling", "Storage", "Barreled", "Bottled"]
     barrelAgeDefaults: {               // size → months mapping
       [size: string]: number
     }
     theme: {
       primaryColor: string             // Nuxt UI primary color name
       // future: logo, company name, etc.
     }
     distillery: {
       name: string
       address: string
       permitNumbers: { ttb: string, tabc: string }
       // future: business info for reports
     }
   }
   ```
2. **API**: Single GET/PUT endpoint (`/api/settings`) — get current settings, update settings
3. **Store**: `useSettingsStore` with `fetchSettings()` called in admin layout, exposes reactive settings
4. **Settings page** with tabbed sections:
   - **Categories**: Add/remove/reorder item categories
   - **Batch Stages**: View stages (editing stages is complex — future feature)
   - **Barrel Defaults**: Edit size → age goal mappings
   - **Theme**: Color picker for primary color
   - **Distillery Info**: Name, address, permit numbers (used in TTB reports)
5. Update `composables/definitions.ts` to read from settings store instead of hardcoded values, with hardcoded values as fallbacks
6. Add "Settings" to admin sidebar under Admin section (gear icon)

**Agent**: `distillery-admin-builder` + `nuxt-server-specialist` (for settings API)

---

## Dependency Map

```
Phase 1 (no dependencies — start immediately)
├── 1.1 Fix Pagination
├── 1.2 Filter Empty Barrels
├── 1.3 Remove Bottle Inventory List
└── 1.4 Edit Barrel Entry Date/Proof

Phase 2 (can start after Phase 1, or in parallel)
├── 2.1 Spirit Run Cuts
├── 2.2 Used Barrel Tag
├── 2.3 Item Notes
├── 2.4 Barrel Age Goals ──────────────────────┐
├── 2.5 Batch Tasting Notes                    │
└── 2.6 Item Inventory Opt-Out ────────┐       │
                                       │       │
Phase 3 (depends on Phase 2 schema)    │       │
├── 3.1 Barrel Cost in Batch ──────────│───────┘
├── 3.2 Production Cost Breakdown      │
├── 3.3 Batch-to-Production Flow       │
├── 3.4 Production Date Adjustment     │
└── 3.5 Productions on Bottle Page     │
                                       │
Phase 4 (depends on 2.6 + Phase 3)    │
├── 4.1 Exclude OOS from Sheets ◄─────┘
├── 4.2 Auto-Update Inventory (depends on 3.3)
└── 4.3 Shopping List (depends on 4.1, 4.2)

Phase 5 (can start in parallel)
├── 5.1 Inline Recipe Editing (independent)
└── 5.2 Admin Settings (barrel defaults depend on 2.4)
```

---

## Effort Estimates

| Item | Complexity | Schema Change | Files Touched |
|------|-----------|---------------|---------------|
| 1.1 Fix Pagination | Medium | No | ~12 |
| 1.2 Filter Empty Barrels | Low | No | 2-3 |
| 1.3 Remove Bottle Inventory List | Low | No | 1 |
| 1.4 Edit Barrel Entry Date/Proof | Low | No | 1-2 |
| 2.1 Spirit Run Cuts | Medium | Yes | 4-5 |
| 2.2 Used Barrel Tag | Medium | Yes | 5-6 |
| 2.3 Item Notes | Low | Yes | 4 |
| 2.4 Barrel Age Goals | Medium | Yes | 5-6 |
| 2.5 Batch Tasting Notes | Medium | Yes | 5 |
| 2.6 Item Inventory Opt-Out | Medium | Yes | 6-7 |
| 3.1 Barrel Cost in Batch | Medium | Yes | 4-5 |
| 3.2 Production Cost Breakdown | High | Yes | 5-6 |
| 3.3 Batch-to-Production Flow | High | No | 4-5 |
| 3.4 Production Date Adjustment | Low | No | 1-2 |
| 3.5 Productions on Bottle Page | Medium | No | 2-3 |
| 4.1 Exclude OOS from Sheets | Low | No | 2-3 |
| 4.2 Auto-Update Inventory | High | No | 4-5 |
| 4.3 Shopping List | High | No | 5-6 |
| 5.1 Inline Recipe Editing | Medium | No | 1-2 |
| 5.2 Admin Settings | High | Yes | 8-10 |

---

## Agent Assignments

| Agent | Primary Tasks |
|-------|--------------|
| **pro-debugger** | 1.1 (pagination bug) |
| **distillery-admin-builder** | 1.2, 1.3, 1.4, 2.1-2.6, 3.1-3.5, 4.1-4.3, 5.1, 5.2 |
| **nuxt-server-specialist** | 4.2 (transaction logic), 5.2 (settings API) |
| **ttb-tabc-compliance** | 2.1 (verify cut reporting impact) |

---

## Implementation Notes

### Schema Change Strategy
Phases 2 and 3 involve many schema changes. To avoid migration headaches:
- All new fields should be **optional** with sensible defaults
- Existing documents will not break — they simply won't have the new fields until edited
- No destructive migrations needed — purely additive changes
- Run `npm run test` after each schema change to catch type mismatches

### Testing Approach
- After each item, verify manually in the dev environment
- For schema changes, verify both creation of new documents and loading of existing documents without the new fields
- Run `npm run test` to catch regressions in validation tests

### Commit Strategy
- One commit per TODO item (or logical sub-task)
- Commit message format: `feat: [TODO #X] short description`
- Group schema + interface + store changes in the same commit
