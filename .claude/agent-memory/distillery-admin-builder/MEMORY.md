# GDC Distillery Admin Builder - Agent Memory

## Current Admin Architecture (as of Feb 2026)

### Two Incompatible Modal Patterns
- **Legacy**: `ModalForms.vue` uses `formSelection` string + `toggleFormModal()` from `composables/modalStatus.ts`. Used by: Batches, Contacts, Vessels, Productions, Purchase Orders.
- **New**: Individual `Modal*.vue` components via `useOverlay()`. Used by: Bottles, Cocktails, Items, Recipes.
- The redesign plan calls for replacing BOTH with `USlideover` panels in `components/Panel/`.

### Two Incompatible Table Patterns
- **Legacy UTable**: `:rows`, `:columns`, `#column-data` slots, `UDropdown`. Used by: Batches, Vessels, Contacts, Productions, Purchase Orders.
- **TanStack UTable**: `:data`, `TableColumn<T>[]`, render functions, `UDropdownMenu`, `v-model:pagination`. Used by: Bottles, Cocktails, Recipes, Items.
- Plan: Standardize everything on TanStack pattern.

### Form Component Inconsistency
- Mix of `UFormGroup` (v2) and `UFormField` (v3). Plan: all `UFormField`.
- Some forms mutate store singletons directly; plan calls for local copies.

### Unfinished Pages
- `/admin/index.vue` renders "test" - should redirect to dashboard
- `/admin/recipes/[_id]` renders raw JSON `{{ recipeStore.recipe }}`
- `/admin/recipe.vue` is a duplicate of `/admin/recipes/index.vue`
- No user management page exists
- No inventory dashboard page exists
- No reporting pages exist

### Key Domain Insights
- Batch lifecycle: Upcoming -> Brewing -> Fermenting -> Distilling -> Storage -> Barreled -> Bottled
- Vessel types: Mash Tun, Fermenter, Still, Tank, Barrel
- Batch data model is deeply nested: brewing/fermenting/distilling/barreled/bottled stages each have their own sub-objects
- The `DashboardBatchPipeline.vue` component exists but is NOT used in the dashboard - it's a nice compact pipeline view that should replace the four separate widgets
- The Bottle interface has an `img` field but nothing uses it - no upload capability exists

### Competitor Intelligence
- **Barrel Clarity**: Best fit model for craft distillery, TTB compliance focus, automated 5110.11/5110.28 reports, barrel-as-first-class-entity
- **Brewfather**: Gold standard UX - clean, responsive, mobile-first, recipe scaling
- **Ekos**: Drag-and-drop scheduling, floorplan vessel view, sales dashboard
- **DRAMS**: Warehouse visualization with rack-level barrel tracking
- **Crafted ERP**: NetSuite-based, full lifecycle, drag-and-drop production boards

### Comprehensive Redesign Plan
Written to `/home/timothy/Coding/GDC/ADMIN_REDESIGN_PLAN.md` with 7 implementation phases covering 22 sections. Key architectural decisions:
1. Slide-over panels replace all modals for editing
2. Rich detail pages for every major entity
3. Cloudinary for file/photo uploads
4. Dashboard becomes actionable command center with KPIs and alerts
5. Reporting section with production, inventory, cost, and barrel reports

See `patterns.md` for reusable component patterns discovered.

### Settings System (Feb 2026)
- Singleton MongoDB document via `server/models/settings.schema.ts` (auto-created on first GET)
- API: `GET /PUT /api/settings` (no create/delete -- singleton pattern)
- Store: `useSettingsStore` with `ensureLoaded()`, loaded in admin layout alongside other stores
- Settings page: `/admin/settings` with UTabs (Categories, Barrel Defaults, Theme, Distillery Info)
- `composables/useItemCategories.ts` returns dynamic categories from settings (falls back to ITEM_CATEGORIES constant)
- `composables/definitions.ts` BARREL_AGE_DEFAULTS uses Proxy to check settings store first, hardcoded fallback second
- Item Mongoose schema `category` field has no `enum` constraint (accepts any string for custom categories)
- Server validation schemas for items also removed `oneOf` constraint on category

### Batch-to-Production Flow (Feb 2026)
- When advancing a batch to "Bottled", the production panel auto-opens pre-filled with batch vessels and date
- `PanelProduction.vue` accepts `prefill` prop (`{ batchId, vessels, date }`) via `useOverlay().create(LazyPanelProduction).open({ prefill })`
- `useProductionStore.createAndReturnId()` creates a production and returns the `_id` for batch linking
- The batch-linked wizard save path bypasses `useFormPanel.save()` to avoid double-emit of `close` event
- `BatchBottled.vue` shows "Record Bottling Run" button (both in editing mode header and in the empty state) to create+link productions after the fact
- Production record link in BatchBottled navigates to `/admin/production/${id}` (not just `/admin/production`)
- Pattern: pre-populate store singleton before opening panel, pass `prefill` prop for metadata only (batchId for linking)

### Auto-Inventory Updates (Feb 2026)
- **PO Received flow**: When PO status changes to "Delivered", `receivePurchaseOrder()` in PO store creates inventory records for each line item
  - Converts PO quantities (qty x size in sizeUnit) to item's inventoryUnit via `useUnitConversion().convertQuantity()`
  - Adds to current stock (from `getCurrentStock()`), creates new inventory record with new total
  - Skips items with `trackInventory === false`
  - Shows summary toast: "Inventory updated from PO: +24 each Glass Bottles, +24 each Caps..."
- **Production completed flow**: `adjustInventoryForProduction()` in production store
  - Increases linked bottle inventory by quantity
  - Decreases bottling materials (glassware, cap, label) by quantity (one per bottle)
  - Auto-syncs bottle's `inStock` flag based on resulting stock level
  - Only triggers on NEW productions (not edits) -- captured via `isNewProduction` flag before store reset
- **Key API**: `POST /api/inventory/bulk` -- creates multiple inventory records in one call (max 100)
- **Key store methods**: `useInventoryStore.createBulk()`, `useInventoryStore.getCurrentStock()`
- **UI touches**: PO panel shows green notice when switching to "Delivered", button label changes to "Save & Update Inventory"
- **Quick action**: PO detail page has "Mark as Received" button (green), PO table has dropdown option
- **Important**: `updateProduction()` calls `resetProduction()` after save, so production data for inventory adjustment must be captured BEFORE the update call

### Shopping List Feature (Feb 2026)
- `ShoppingListItem` interface exported from `stores/useItemStore.ts` (item, currentStock, reorderPoint, usePerMonth, suggestedOrderQty, status)
- `shoppingListItems` computed in useItemStore: filters tracked items with inventory history that are low/out of stock
- Suggested order qty formula: `usePerMonth * 2 - currentStock` (falls back to `reorderPoint * 2 - currentStock`), min of `minStock` or 1
- Uses `getStockStatus()` and `getStockStatusColor()` from `composables/useInventoryCategories.ts`
- Page at `/admin/inventory/shopping-list` with TanStack UTable, summary cards, mobile card view
- Sidebar badge shows count of shopping list items (computed in AdminSidebar)
- Dashboard "Inventory Health" widget has "Shopping List" link alongside "Manage"
- Inventory index page has "Shopping List" button in header actions
