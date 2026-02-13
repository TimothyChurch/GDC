# GDC Admin Redesign Plan

A comprehensive, step-by-step plan to redesign the Galveston Distilling Co admin interface into a best-in-class distillery operations management tool.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Global Architecture Changes](#2-global-architecture-changes)
3. [Navigation Redesign](#3-navigation-redesign)
4. [Dashboard Redesign](#4-dashboard-redesign)
5. [Batch Lifecycle View](#5-batch-lifecycle-view)
6. [Recipes Section](#6-recipes-section)
7. [Vessels Section](#7-vessels-section)
8. [Productions Section](#8-productions-section)
9. [Bottles Section](#9-bottles-section)
10. [Cocktails Section](#10-cocktails-section)
11. [Inventory Items Section](#11-inventory-items-section)
12. [Inventory Inputs Section](#12-inventory-inputs-section)
13. [Contacts Section](#13-contacts-section)
14. [Purchase Orders Section](#14-purchase-orders-section)
15. [Users Section](#15-users-section)
16. [Proofing Calculator](#16-proofing-calculator)
17. [Controls (Equipment)](#17-controls-equipment)
18. [File/Photo Upload Strategy](#18-filephoto-upload-strategy)
19. [Mobile Responsiveness Strategy](#19-mobile-responsiveness-strategy)
20. [Reporting and Analytics](#20-reporting-and-analytics)
21. [Inspiration from Competitors](#21-inspiration-from-competitors)
22. [Implementation Phases](#22-implementation-phases)

---

## 1. Executive Summary

### Vision

Transform the GDC admin from a collection of basic CRUD table-and-modal pages into an **operations command center** -- a tool that distillery operators open first thing in the morning and rely on throughout the day. Every screen should answer: "What needs my attention right now?" and make the most common actions achievable in one or two clicks.

### Core Problems Today

1. **Modal soup**: Most editing happens inside a shared `ModalForms.vue` that conditionally renders different forms via a string variable (`formSelection`). This is fragile, untypeable, and limits form size. Some resources have migrated to `useOverlay()` modals (bottles, cocktails, items, recipes) while others still use the legacy system (batches, contacts, vessels, productions, purchase orders). Two incompatible patterns coexist.
2. **Flat data tables**: Every section is essentially "search box + table + modal form." There is no visual hierarchy, no quick-glance status, no inline actions. Users must click into dropdown menus to do anything.
3. **Disconnected detail pages**: Batch detail (`/admin/batch/[_id]`), bottle detail, item detail, and recipe detail pages exist but are sparse, unstyled, and do not provide a full picture of the entity.
4. **No file/photo uploads**: No images for bottles, cocktails, recipes, barrels, or production records. The Bottle interface has an `img` field but nothing uses it.
5. **Dashboard is informational only**: The dashboard shows pipeline status but does not surface actionable alerts, low-inventory warnings, upcoming tasks, or KPIs.
6. **No reporting**: No production reports, cost analysis, inventory trends, or TTB-style compliance summaries.
7. **Inconsistent component patterns**: Mix of Nuxt UI v2 legacy `UTable` (with `:rows` and `:columns`) and v3 TanStack `UTable` (with `:data` and `TableColumn<T>[]`). Two different pagination patterns. Some forms use `UFormGroup`, others `UFormField`.

### Design Principles for the Redesign

- **Slide-over panels for editing, not modals**: Replace the global `ModalForms.vue` and per-resource modals with `USlideover` side panels. This preserves the table/list context behind the panel, reduces disorientation, and allows larger, more comfortable forms.
- **Rich detail pages**: Each major entity (batch, recipe, bottle, vessel, item, contact, purchase order) gets a proper detail page with tabs, related data, and inline editing.
- **Progressive disclosure**: Summary cards and tables show essential info; clicking drills into detail; editing happens in-context.
- **Consistent component library**: Standardize all tables on Nuxt UI v3 TanStack pattern, all forms on `UFormField` with Yup, all side panels on `USlideover`.
- **Photo-first where it matters**: Bottles, cocktails, and recipes should prominently feature images.
- **Actionable dashboard**: Surface alerts, not just status.

---

## 2. Global Architecture Changes

### 2.1 Replace Modal Forms with Slide-Over Panels

**Current state**: `composables/modalStatus.ts` exports `formModalStatus`, `toggleFormModal`, and `formSelection` (a string). `components/ModalForms.vue` wraps a `UModal` with `v-if` chains. Some resources (bottles, cocktails, items, recipes) have migrated to individual `Modal*.vue` components using `useOverlay()`.

**Proposed change**:

1. Create a new `components/Panel/` directory for slide-over form panels.
2. For each resource, create `Panel{Resource}Form.vue` using `USlideover`:
   - `PanelBatchForm.vue`
   - `PanelRecipeForm.vue`
   - `PanelBottleForm.vue`
   - `PanelCocktailForm.vue`
   - `PanelContactForm.vue`
   - `PanelVesselForm.vue`
   - `PanelProductionForm.vue`
   - `PanelPurchaseOrderForm.vue`
   - `PanelItemForm.vue`
   - `PanelInventoryForm.vue`
   - `PanelUserForm.vue`
3. Each panel is opened via `useOverlay().create(PanelComponent)` from the table/page that needs it.
4. The panel slides in from the right, occupying approximately 480-640px on desktop, full-width on mobile.
5. The form inside the panel operates on a local copy of the data (not directly on the store singleton), and commits changes on save.
6. Delete the legacy `ModalForms.vue`, `composables/modalStatus.ts` exports (`formModalStatus`, `toggleFormModal`, `formSelection`), and individual `Modal*.vue` wrappers.

**Files to create**: `components/Panel/Panel*.vue` (11 files)
**Files to delete**: `components/ModalForms.vue`, `components/Modal/ModalBottle.vue`, `components/Modal/ModalCocktail.vue`, `components/Modal/ModalItem.vue`, `components/Modal/ModalRecipe.vue`
**Files to modify**: `composables/modalStatus.ts` (remove legacy exports), all Table components, all admin pages that use `formSelection`

### 2.2 Standardize Table Component Pattern

**Current state**: Two patterns coexist:
- Legacy: `UTable` with `:rows`, `:columns`, `#column-data` template slots, `UDropdown` for actions, manual pagination with `UPagination`. Used in: `TableBatches`, `TableVessels`, `TableContacts`, `TableProductions`, `TablePurchaseOrders`.
- TanStack: `UTable` with `:data`, `TableColumn<T>[]` with render functions, `UDropdownMenu` for actions, `v-model:pagination`. Used in: `TableBottles`, `TableCocktails`, `TableRecipes`, `TableItems`.

**Proposed change**:

1. Migrate all tables to the Nuxt UI v3 TanStack pattern (`:data`, `TableColumn<T>[]`, `v-model:pagination`, `v-model:global-filter`).
2. Create a shared `components/Table/TableWrapper.vue` component that provides:
   - A consistent header bar with search input, filter dropdowns, and "Add New" button
   - Pagination controls (page size selector + pagination component)
   - Loading and empty states
   - Responsive scroll wrapper
3. All table components use `TableWrapper` to reduce boilerplate.
4. Standardize the action column pattern: each row gets a `UDropdownMenu` with Edit, Delete, and resource-specific actions (e.g., "View Details" for batches).

**Files to create**: `components/Table/TableWrapper.vue`
**Files to modify**: `TableBatches.vue`, `TableVessels.vue`, `TableContacts.vue`, `TableProductions.vue`, `TablePurchaseOrders.vue` (migrate to TanStack), plus all other tables (adopt `TableWrapper`)

### 2.3 Standardize Form Pattern

**Current state**: Forms use a mix of `UFormGroup` (Nuxt UI v2) and `UFormField` (Nuxt UI v3). Some forms operate directly on the store singleton (`batchStore.batch`), some use local state.

**Proposed change**:

1. All forms use `UFormField` exclusively (remove all `UFormGroup` usage).
2. All forms receive their initial data via props and emit changes, or use a local reactive copy.
3. All forms include Yup validation schemas.
4. Create a `composables/useFormPanel.ts` composable that standardizes:
   - Creating a local copy of entity data
   - Tracking dirty state
   - Handling save/cancel with confirmation if dirty
   - Loading state during save

**Files to create**: `composables/useFormPanel.ts`
**Files to modify**: All `Form*.vue` components (replace `UFormGroup` with `UFormField`, adopt local copy pattern)

### 2.4 Consistent Page Layout Pattern

**Current state**: Admin pages are mostly single-component wrappers (e.g., `<TableBatches />`). Some have page headers, some do not. Styling is inconsistent.

**Proposed change**:

Create a reusable page layout pattern. Each admin page should have:

```vue
<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond]">
          Page Title
        </h1>
        <p class="text-sm text-parchment/50 mt-1">Brief description</p>
      </div>
      <div class="flex gap-2">
        <!-- Page-level action buttons -->
      </div>
    </div>
    <!-- Page Content -->
  </div>
</template>
```

Create `components/Admin/AdminPageHeader.vue` to standardize this.

**Files to create**: `components/Admin/AdminPageHeader.vue`
**Files to modify**: All `pages/admin/*.vue`

---

## 3. Navigation Redesign

### Current State

`AdminSidebar.vue` has four sections (Production, Products, Inventory, Admin) with 14 links. `AdminHeader.vue` shows logo, date, user email, calculator modal trigger, and logout. `AdminSearch.vue` exists but is incomplete (only searches contacts and items, outputs raw data).

### Proposed Changes

#### 3.1 Sidebar Enhancements

Keep the current four-section grouping but add:

1. **Badge counts on key items**: Show counts of actionable items next to sidebar links.
   - Batches: count of active batches (non-Upcoming, non-Bottled)
   - Purchase Orders: count of pending/confirmed POs
   - Contacts: total count (subtle, informational)
2. **Quick-add buttons**: Small "+" icons next to section headers (Production, Products, Inventory) that open the relevant slide-over panel for the most common create action in that section.
3. **Favorites/pinning**: Allow users to pin their most-used pages to the top of the sidebar for faster access.

#### 3.2 Header Enhancements

1. **Global search (Command Palette)**: Replace the broken `AdminSearch.vue` with a proper `UCommandPalette` or custom command-palette component triggered by a search icon in the header and by `Cmd+K` / `Ctrl+K` keyboard shortcut. It should search across:
   - Batches (by recipe name, status)
   - Recipes (by name)
   - Bottles (by name)
   - Cocktails (by name)
   - Contacts (by name, business)
   - Items (by name, type)
   - Vessels (by name, type)
   - Purchase Orders (by vendor, status)
   Each result links to the relevant detail page or opens the edit panel.
2. **Quick actions dropdown**: A "+" button in the header that shows a dropdown with "New Batch," "New Recipe," "New Contact," "New Purchase Order," etc.
3. **Notification area**: Show a bell icon with a badge count for items needing attention (low inventory items, batches ready for next stage, overdue POs). Initially this can be computed client-side from store data.
4. **Breadcrumbs**: Add breadcrumb navigation below the header for detail pages (e.g., "Batches > Bourbon Batch #47").

#### 3.3 Admin Index Page

**Current state**: `/admin/index.vue` renders the text "test."

**Proposed change**: Redirect `/admin` to `/admin/dashboard` via a `navigateTo('/admin/dashboard')` in the page setup, or make index.vue render the dashboard.

**Files to create**: `components/Admin/AdminCommandPalette.vue`, `components/Admin/AdminBreadcrumbs.vue`
**Files to modify**: `AdminSidebar.vue`, `AdminHeader.vue`, `AdminSearch.vue` (replace), `pages/admin/index.vue`, `layouts/admin.vue`

---

## 4. Dashboard Redesign

### Current State

`AdminDashboard.vue` shows:
- Batch pipeline (4 cards: Upcoming, Brewing, Fermenters, Distilling)
- Storage and Barrels sections (side by side)
- Recent Productions list

The `DashboardBatchPipeline.vue` component exists but is not used in the dashboard -- it provides a compact 6-stage pipeline overview with counts and batch previews.

### Proposed Layout

Reorganize the dashboard into a purpose-driven layout with three tiers:

#### Tier 1: Key Metrics Bar (top row)

A row of `DashboardStatCard` components showing at-a-glance KPIs:

| Card | Data Source | Color |
|------|------------|-------|
| Active Batches | Count of batches not in Upcoming or Bottled status | gold |
| Bottles in Stock | Sum of latest inventory quantities for all in-stock bottles | copper |
| Pending POs | Count of purchase orders with status "Pending" or "Confirmed" | amber |
| Low Inventory Alerts | Count of items below a configurable threshold | red |
| Month's Productions | Count of production records in current month | green |

**Files to create**: None new (use existing `DashboardStatCard.vue`)
**Files to modify**: `AdminDashboard.vue`

#### Tier 2: Batch Pipeline (full width)

Use the existing `DashboardBatchPipeline.vue` component (currently unused) as the primary pipeline view. Enhance it with:

1. **Click-to-expand**: Clicking a stage card opens a panel showing all batches in that stage with key details and action buttons (advance to next stage, view details).
2. **Drag-and-drop batch advancement**: Allow dragging a batch card from one stage to the next to trigger a status transition. Use a confirmation dialog to capture any required stage data (vessel assignment, date).
3. **Color-coded urgency**: Batches that have been in a stage longer than expected (configurable threshold) get a warning indicator.

Replace the current four separate dashboard widgets (DashboardUpcoming, DashboardBrewing, DashboardFermenters, DashboardDistilling) with this single unified pipeline. The individual widgets are redundant with the pipeline.

**Files to modify**: `DashboardBatchPipeline.vue` (enhance), `AdminDashboard.vue` (use pipeline, remove individual widgets)
**Files to potentially remove**: `DashboardUpcoming.vue`, `DashboardBrewing.vue`, `DashboardFermenters.vue`, `DashboardDistilling.vue` (replaced by enhanced pipeline)

#### Tier 3: Operational Panels (two-column grid below pipeline)

| Left Column | Right Column |
|------------|-------------|
| **Vessel Status**: Grid of all vessels grouped by type (mash tuns, fermenters, stills, tanks, barrels). Each shows name, current contents (recipe name), fill level as a progress bar, and a quick-action "Transfer" button. | **Alerts & Tasks**: A feed of actionable items: low inventory alerts, batches approaching transition thresholds, pending POs, fermentation readings overdue, barrels approaching target age. Each alert has a one-click action (go to detail, mark resolved). |
| **Recent Productions**: Enhanced version of current `DashboardProduction.vue` with mini bottle image, production date, quantity, and cost per bottle. Link to production detail. | **Quick Bottle Inventory**: Compact view showing each bottle product, current stock level, and a small sparkline chart of inventory over time. Low-stock items highlighted in red. |

**Files to create**: `components/Dashboard/DashboardVesselStatus.vue`, `components/Dashboard/DashboardAlerts.vue`, `components/Dashboard/DashboardBottleInventoryQuick.vue`
**Files to modify**: `DashboardProduction.vue` (enhance), `AdminDashboard.vue`

---

## 5. Batch Lifecycle View

### Current State

- **List page** (`/admin/batch`): `TableBatches.vue` shows recipe, batch cost, status columns. Edit/delete via dropdown menu. Create via "+" button opening `FormBatch` in the shared modal.
- **Detail page** (`/admin/batch/[_id]`): Shows `BatchDetails` (recipe name, class, type) and `BatchFermenting` (gravity chart, add reading modal) side by side. Only fermentation data is visible. No view for distilling data, barrel data, or production linkage.

### Proposed Layout

#### 5.1 Batch List Page

Replace the flat table with a **hybrid table + filter view**:

1. **Status filter tabs**: A horizontal tab bar at the top with the stages: All | Upcoming | Brewing | Fermenting | Distilling | Storage | Barreled | Bottled. Clicking a tab filters the table. Show count badges on each tab.
2. **Enhanced table columns**: Recipe Name, Batch Number (add a `batchNumber` field), Status (colored badge), Brew Date, Current Vessel, Age (days since brew date), Cost, Actions.
3. **Quick status advancement**: In the actions dropdown, include "Advance to [next stage]" which opens a small confirmation dialog to capture the required data (vessel assignment, date) and advances the batch.
4. **Batch creation via slide-over panel**: Replace modal with `PanelBatchForm.vue`.

#### 5.2 Batch Detail Page

Redesign `/admin/batch/[_id]` as a comprehensive lifecycle view:

```
+---------------------------------------------+
|  [Breadcrumb: Batches > Bourbon Batch #47]  |
|                                              |
|  Bourbon Batch #47        Status: Fermenting |
|  Recipe: House Bourbon    Vessel: FV-1       |
|  Size: 100 gal            Cost: $450.00      |
|  Brew Date: Jan 15, 2026  [Edit] [Delete]    |
|                                              |
+---------------------------------------------+
|                                              |
|  [Timeline / Stepper showing lifecycle]      |
|  Upcoming > Brewing > Fermenting > ...       |
|            (completed stages filled in)      |
|                                              |
+---------------------------------------------+
|                                              |
|  [Tabbed content area]                       |
|                                              |
|  [Overview] [Fermenting] [Distilling]        |
|  [Barrel] [Bottling] [Notes] [Photos]        |
|                                              |
+---------------------------------------------+
```

**Tab content:**

- **Overview**: Recipe details (ingredients, directions), batch size, cost breakdown, linked vessels across all stages.
- **Fermenting**: Gravity/temperature chart (current `BatchFermenting.vue` content), readings table with inline add, pH readings, fermentation duration calculator.
- **Distilling**: Date, vessel, tails additions (volume, ABV), collected cuts (heads, hearts, tails with vessel/volume/ABV for each), total collected, notes. All editable inline.
- **Barrel**: Entry date, entry volume/ABV, exit date, exit volume/ABV, barrel vessel reference, aging duration auto-calculated, angel's share (entry volume minus exit volume).
- **Bottling**: Link to production record, bottle product, quantity, bottling cost per unit.
- **Notes**: Free-form rich text notes for each stage, combined into a timeline.
- **Photos**: Photo gallery for the batch (mash photos, fermentation shots, distillation, bottling day). Uses the file upload system (see Section 18).

**Files to create**: `components/Batch/BatchLifecycleTimeline.vue`, `components/Batch/BatchOverviewTab.vue`, `components/Batch/BatchFermentingTab.vue`, `components/Batch/BatchDistillingTab.vue`, `components/Batch/BatchBarrelTab.vue`, `components/Batch/BatchBottlingTab.vue`, `components/Batch/BatchNotesTab.vue`, `components/Batch/BatchPhotosTab.vue`
**Files to modify**: `pages/admin/batch/[_id].vue` (full redesign), `pages/admin/batch/index.vue` (add filter tabs)
**Files to refactor**: `BatchDetails.vue`, `BatchFermenting.vue` (absorb into new tab components)

#### 5.3 Data Model Additions for Batches

Add to `Batch` interface and schema:

```typescript
// New fields
batchNumber?: string;      // Human-readable batch identifier (e.g., "B-2026-001")
notes?: string;            // General batch notes
photos?: string[];         // Array of photo URLs
createdAt?: Date;          // Auto timestamp
updatedAt?: Date;          // Auto timestamp
```

---

## 6. Recipes Section

### Current State

- **List page** (`/admin/recipes`): `TableRecipes.vue` using TanStack pattern. Columns: expand, name, class, type, volume. Expand row shows raw item data (just `{{ item }}`). Edit via dropdown opens `ModalRecipe` overlay. Create via "Add Recipe" button.
- **Detail page** (`/admin/recipes/[_id]`): Renders raw JSON (`{{ recipeStore.recipe }}`). Completely unfinished.
- **Duplicate route**: `/admin/recipe.vue` exists alongside `/admin/recipes/index.vue`, both rendering `TableRecipes`.
- **Form** (`FormRecipe.vue`): Name, class, type, volume, volume unit, items table, add item row, directions textarea. Uses legacy `UTable` with `:rows`/`:columns` internally for the items list.

### Proposed Layout

#### 6.1 Recipe List Page

1. **Filter by class**: Add a `USelect` or horizontal tabs to filter recipes by liquor class (Whisky, Gin, Rum, etc.).
2. **Enhanced expand row**: When expanded, show formatted ingredient list with item names resolved, amounts, units, and cost per ingredient. Show total recipe cost.
3. **Recipe cost column**: Add a computed cost column to the table.
4. **Batch count column**: Show how many batches have used this recipe.
5. **Edit via slide-over**: Replace `ModalRecipe` with `PanelRecipeForm.vue`.

#### 6.2 Recipe Detail Page

Redesign `/admin/recipes/[_id]` as a proper recipe page:

```
+---------------------------------------------+
|  [Breadcrumb: Recipes > House Bourbon]       |
|                                              |
|  House Bourbon              [Edit] [Clone]   |
|  Class: Whisky  Type: Bourbon Whisky         |
|  Volume: 100 gal     Cost: $234.50           |
|                                              |
+---------------------------------------------+
|                                              |
|  [Ingredients]           [Batches]           |
|                                              |
|  +----+----------+--------+------+-------+   |
|  | #  | Item     | Amount | Unit | Cost  |   |
|  +----+----------+--------+------+-------+   |
|  | 1  | Corn     | 200    | lb   | $60   |   |
|  | 2  | Rye      | 50     | lb   | $25   |   |
|  | ...                                   |   |
|  +----+----------+--------+------+-------+   |
|  | Total Cost: $234.50                   |   |
|  +---------------------------------------+   |
|                                              |
|  [Directions]                                |
|  Mash at 150F for 60 minutes...              |
|                                              |
|  [Photos]                                    |
|  [Upload recipe reference photos/documents]  |
|                                              |
+---------------------------------------------+
```

**Batches tab**: List of all batches that used this recipe, with status, date, cost.

**Clone action**: Duplicate the recipe with a new name for variations.

#### 6.3 Recipe Form Improvements

1. Replace the legacy `UTable` inside `FormRecipe.vue` for the items list with a styled list with inline editing.
2. Add real-time cost calculation that updates as items and amounts are changed.
3. Add a "Scale Recipe" calculator: input a target batch volume and the recipe scales all ingredient amounts proportionally.
4. Add photo/document upload for recipe reference materials.

**Files to modify**: `pages/admin/recipes/[_id].vue` (redesign), `FormRecipe.vue` (improve items list), `TableRecipes.vue` (add cost column, class filter)
**Files to delete**: `pages/admin/recipe.vue` (duplicate)
**Data model additions**: Add `photos?: string[]` to Recipe interface and schema.

---

## 7. Vessels Section

### Current State

- **Page** (`/admin/vessels.vue`): `VesselTransfer` component at top, `TableVessels` below. No vessel detail page.
- **VesselTransfer** (`components/VesselTransfer.vue`): Select source vessel, view contents, select destination, full or partial transfer. Basic but functional.
- **FormVesselContentsMove** (`components/Form/FormVesselContentsMove.vue`): A different transfer interface (side-by-side origin/destination cards). It is unclear which one is the primary; both exist.
- **Table**: Name, type, current (no data rendered for "current"), actions (empty, edit, delete). Uses legacy table pattern.
- **Form**: Name, type, weight, capacity, barrel-specific fields (size, char, cost). Opens in shared modal.

### Proposed Layout

#### 7.1 Vessel List Page

Replace the flat list with a **grouped visual layout**:

```
+-----------------------------------------------+
|  Vessels                         [+ Add Vessel]|
|                                                |
|  [Grid/List toggle]  [Filter by type]          |
|                                                |
|  -- Mash Tuns --                               |
|  +----------+  +----------+                    |
|  | MT-1     |  | MT-2     |                    |
|  | 100 gal  |  | 100 gal  |                    |
|  | [======] |  | [      ] |                    |
|  | Bourbon  |  | Empty    |                    |
|  | [Actions]|  | [Actions]|                    |
|  +----------+  +----------+                    |
|                                                |
|  -- Fermenters --                              |
|  +----------+  +----------+  +----------+      |
|  | FV-1     |  | FV-2     |  | FV-3     |      |
|  | 200 gal  |  | 200 gal  |  | 200 gal  |      |
|  | [===   ] |  | [======] |  | [      ] |      |
|  | Rye 45gal|  | Gin 180g |  | Empty    |      |
|  +----------+  +----------+  +----------+      |
|                                                |
|  -- Stills --                                  |
|  ...                                           |
|                                                |
|  -- Barrels --                                 |
|  [Barrel grid with aging info]                 |
|                                                |
+-----------------------------------------------+
```

Each vessel card shows:
- Name
- Type icon
- Capacity with a visual fill-level bar (current contents volume / capacity)
- Current contents summary (recipe name, volume)
- For barrels: aging duration, char level
- Quick actions: Transfer, Empty, Edit, Delete

A toggle allows switching between the visual card grid and a traditional table view (for users who prefer it or need to sort/export).

#### 7.2 Vessel Transfer

Consolidate `VesselTransfer.vue` and `FormVesselContentsMove.vue` into a single, improved transfer interface:

1. Accessible from a "Transfer" action on any vessel card.
2. Opens as a slide-over panel showing source vessel contents on the left, destination selector and transfer controls on the right.
3. Supports full transfer, partial transfer (by volume), and split to multiple destinations.
4. Auto-advances batch status when transferring between vessel types (e.g., mash tun to fermenter advances batch from Brewing to Fermenting).
5. Show a visual "before and after" preview of the transfer.

#### 7.3 Barrel Management Enhancement

Barrels deserve special treatment. Add a dedicated "Barrel Warehouse" view accessible from the vessels page:

- **Grid/Map view**: Visual grid showing all barrels, color-coded by age (lighter = newer, darker = older).
- **Barrel detail card**: Click a barrel to see contents, fill date, current age, char level, cost, entry ABV, estimated angel's share.
- **Aging alerts**: Highlight barrels that have reached target aging duration.
- **Barrel lifecycle tracking**: Track empty/fill/dump history per barrel.

**Files to create**: `components/Vessel/VesselCard.vue`, `components/Vessel/VesselGrid.vue`, `components/Panel/PanelVesselTransfer.vue`, `components/Vessel/BarrelWarehouse.vue`
**Files to modify**: `pages/admin/vessels.vue` (redesign), `TableVessels.vue` (keep as alternate view)
**Files to consolidate**: `VesselTransfer.vue` and `FormVesselContentsMove.vue` into `PanelVesselTransfer.vue`

---

## 8. Productions Section

### Current State

- **Page** (`/admin/production.vue`): Just `<TableProductions />`.
- **Table**: Date, vessel, bottle, quantity, production cost, bottle cost. Legacy table pattern. Edit/delete via dropdown.
- **Form** (`FormProduction.vue`): Date picker, multi-select vessels, bottle selector, glassware/cap/label selectors (bottling supplies), quantity, auto-calculated production cost and bottle cost. Fairly complete but linear layout.
- No production detail page.

### Proposed Layout

#### 8.1 Production List Page

1. **Date range filter**: Add a date range picker to filter productions by time period.
2. **Summary stats bar**: Above the table, show: total productions in range, total bottles produced, average cost per bottle.
3. **Enhanced table**: Add a "Proof" column if available from batch data.
4. **Create via slide-over**: Replace modal with `PanelProductionForm.vue`.

#### 8.2 Production Detail Page

Create `/admin/production/[_id].vue`:

```
+-----------------------------------------------+
|  Production Record #PR-2026-015               |
|  Date: February 10, 2026        [Edit] [Print]|
|                                                |
|  +-------------------+  +--------------------+ |
|  | Bottle Product    |  | Cost Breakdown     | |
|  | House Bourbon     |  | Batch cost: $200   | |
|  | [Bottle Image]    |  | Barrel cost: $80   | |
|  | Quantity: 120     |  | Glass: $1.20/ea    | |
|  | ABV: 45%          |  | Cap: $0.15/ea      | |
|  |                   |  | Label: $0.30/ea    | |
|  +-------------------+  | Total: $478        | |
|                          | Per bottle: $3.98  | |
|  +-------------------+  +--------------------+ |
|  | Source Vessels     |                         |
|  | Barrel #5 (30gal) |                         |
|  | Barrel #8 (25gal) |                         |
|  +-------------------+                         |
|                                                |
|  [Photos]                                      |
|  [Upload bottling day photos]                  |
+-----------------------------------------------+
```

#### 8.3 Production Form Improvements

1. **Guided wizard flow**: Instead of a flat form, use a step-by-step process:
   - Step 1: Select source vessels (shows what is available with contents)
   - Step 2: Select or create bottle product
   - Step 3: Select bottling supplies (glass, cap, label)
   - Step 4: Enter quantity and review cost breakdown
   - Step 5: Confirm and create
2. **Auto-populate suggestions**: If a vessel's batch has an associated bottle product, pre-select it.
3. **Photo upload**: Allow attaching photos of the bottling run.

**Files to create**: `pages/admin/production/[_id].vue`, `PanelProductionForm.vue`
**Files to modify**: `pages/admin/production.vue` (rename to `pages/admin/production/index.vue`, add summary stats), `FormProduction.vue` (improve to wizard)

---

## 9. Bottles Section

### Current State

- **List page** (`/admin/bottles/index.vue`): `TableBottles.vue` using TanStack, auto-renders all fields. Click a row navigates to detail page. Create via `ModalBottle` overlay.
- **Detail page** (`/admin/bottles/[_id]`): Basic UCard with name, recipe, class, type, ABV. Inventory section shows date+quantity list with inline add form. Unstyled and sparse.
- **Inventory page** (`/admin/bottles/inventory.vue`): Custom grid for counting bottles by location (bar, office, boxed). Calculates total and delta from current stock. Submit updates inventory.
- **Form** (`FormBottle.vue`): Name, recipe, in-stock toggle, class, type, ABV, price, description. No image upload despite `img` field in interface.

### Proposed Layout

#### 9.1 Bottle List Page

1. **Card grid view** (default): Show bottles as cards with image, name, class/type, price, stock status badge, ABV.
2. **Table view** (toggle): The current table view as an alternate.
3. **Filter sidebar/bar**: Filter by class, type, in-stock status.
4. **Stock indicators**: Color-coded stock badges (green = in stock, red = out of stock, yellow = low stock).

#### 9.2 Bottle Detail Page

Redesign `/admin/bottles/[_id]`:

```
+-----------------------------------------------+
|  [Breadcrumb: Bottles > House Bourbon]         |
|                                                |
|  +------------------+  +--------------------+  |
|  | [Bottle Image]   |  | House Bourbon      |  |
|  |                  |  | Class: Whisky       |  |
|  | [Upload/Change]  |  | Type: Bourbon       |  |
|  |                  |  | ABV: 45%            |  |
|  +------------------+  | Price: $35.00       |  |
|                         | Recipe: House Bourbon|  |
|                         | In Stock: Yes        |  |
|                         | [Edit] [Delete]      |  |
|                         +--------------------+  |
|                                                |
|  [Tabs: Inventory | Productions | Description] |
|                                                |
|  [Inventory Tab]                               |
|  +------------------------------------------+  |
|  | Current Stock: 47 bottles                |  |
|  | [Inventory chart over time]              |  |
|  | [Add Count button]                       |  |
|  |                                          |  |
|  | Date         Quantity  Location   Delta  |  |
|  | Feb 10, 2026  47       All        -5     |  |
|  | Feb 3, 2026   52       All        +24    |  |
|  +------------------------------------------+  |
|                                                |
|  [Productions Tab]                             |
|  List of all production records for this bottle|
|                                                |
+-----------------------------------------------+
```

#### 9.3 Bottle Inventory Page Improvements

The inventory count page (`/admin/bottles/inventory`) is a good concept but needs polish:

1. **Styled grid**: Use Nuxt UI components instead of raw HTML grid.
2. **Location management**: Make locations configurable (not hardcoded to bar/office/boxed).
3. **Delta visualization**: Color-code changes (green positive, red negative).
4. **History**: Show previous inventory counts for comparison.
5. **Auto-save drafts**: Save the count locally as the user enters numbers, so they do not lose work if they navigate away.

#### 9.4 Bottle Image Upload

Implement image upload for bottles:

1. In the form and detail page, add a drag-and-drop image upload zone.
2. Show a preview thumbnail.
3. Uploaded images are used in the bottle card grid, detail page, cocktail menu, and public-facing pages.
4. Use the file upload strategy outlined in Section 18.

**Files to modify**: `pages/admin/bottles/[_id].vue` (full redesign), `pages/admin/bottles/index.vue` (add card grid), `pages/admin/bottles/inventory.vue` (polish), `FormBottle.vue` (add image upload), `TableBottles.vue` (enhance columns)
**Files to create**: `components/Bottle/BottleCard.vue`, `components/Bottle/BottleCardGrid.vue`

---

## 10. Cocktails Section

### Current State

- **List page** (`/admin/cocktails/index.vue`): `TableCocktails.vue` using TanStack. Columns: expand, name, glassware, cost, approx price, price, visible. Expand shows `TableCocktailExpand` with ingredient list. Edit via dropdown opens `ModalCocktail`. Create via "Add Cocktail" button.
- **Cheat sheets page** (`/admin/cocktails/grid.vue`): Select cocktails via checkboxes, renders a printable 4-column grid with name, ingredients, glassware, directions. Print functionality via `window.print()`.
- **Form** (`FormCocktail.vue`): Name, glassware, menu, ingredient builder (select item, amount, unit, add/remove), cost display, price estimate, price input, description, directions. Fairly complete.

### Proposed Layout

#### 10.1 Cocktail List Page

1. **Dual view (cards + table)**: Default to a card grid showing cocktail name, image (when uploaded), glassware icon, price, and a "visible" indicator. Toggle to table view.
2. **Menu filter**: Tab bar or filter chips for "main," "seasonal," "shots," "off menu."
3. **Inline visibility toggle**: Quick toggle to show/hide a cocktail from the public menu without opening the edit form.
4. **Drag-and-drop ordering**: Allow reordering cocktails within their menu category via drag-and-drop (requires adding a `sortOrder` field).

#### 10.2 Cocktail Form Improvements

1. **Image upload**: Add a cocktail photo upload (the hero image for the public menu).
2. **Ingredient builder UX**: Show ingredient names with images/icons. Auto-complete item search. Show running cost total as ingredients are added.
3. **Garnish field**: Add a separate "garnish" text field (distinct from ingredients).
4. **Live preview card**: Show a real-time preview of how the cocktail will appear on the public menu as the user edits.

#### 10.3 Cheat Sheets Page Improvements

1. **Better print styling**: Proper print CSS with page breaks, consistent sizing.
2. **Select all / select by menu category**: Buttons to quickly select all cocktails in a menu category.
3. **Customizable grid layout**: Choose 3, 4, or 6 columns for the print grid.
4. **PDF export**: Generate a downloadable PDF instead of relying on browser print dialog.

**Files to modify**: `TableCocktails.vue` (add card view), `FormCocktail.vue` (add image upload, garnish), `pages/admin/cocktails/grid.vue` (improve print/export)
**Files to create**: `components/Cocktail/CocktailCard.vue`
**Data model additions**: Add `img?: string`, `garnish?: string`, `sortOrder?: number` to Cocktail interface and schema.

---

## 11. Inventory Items Section

### Current State

- **List page** (`/admin/items/index.vue`): `TableItems.vue` using TanStack with sortable columns (name, type, price per unit), vendor resolution, actions dropdown. Create via `ModalItem` overlay.
- **Detail page** (`/admin/items/[_id].vue`): Three-column grid with Item Details card (inline edit toggle), Purchase History card (raw data), Inventory History card (raw data). Inline editing for name, brand, vendor, price.
- **Form** (`FormItem.vue`): Name, brand, type (creatable select), vendor (creatable select), inventory unit, price per unit. Opens in modal.

### Proposed Layout

#### 11.1 Item List Page

1. **Type filter**: Tab bar or filter chips for item types (e.g., "Grain," "Glass Bottle," "Label," "Bottle Cap," "Spirit," etc.).
2. **Low stock indicator**: Show a warning icon next to items that are below a configurable reorder threshold (requires tracking current stock level, which needs inventory data aggregation).
3. **Quick price update**: Allow inline price editing directly in the table without opening the full form.
4. **Vendor grouping**: Option to group items by vendor.

#### 11.2 Item Detail Page Redesign

The current detail page has the right idea but needs implementation:

```
+-----------------------------------------------+
|  [Breadcrumb: Items > Corn]                    |
|                                                |
|  Corn (Brand: Briess)          [Edit] [Delete] |
|  Type: Grain                                   |
|  Vendor: Midwest Grain Supply                  |
|  Unit: lb    Price: $0.30/lb                   |
|                                                |
|  [Tabs: Purchase History | Inventory | Recipes]|
|                                                |
|  [Purchase History Tab]                        |
|  Table of purchase orders containing this item |
|  Date | PO# | Quantity | Size | Price | Total  |
|                                                |
|  [Inventory Tab]                               |
|  Inventory count history chart and table       |
|                                                |
|  [Recipes Tab]                                 |
|  List of recipes that use this item, with      |
|  amount required per recipe                    |
|                                                |
+-----------------------------------------------+
```

The key improvement is resolving `purchaseHistory` and `inventoryHistory` (currently arrays of IDs rendered as raw strings) into actual data tables with proper formatting.

**Files to modify**: `pages/admin/items/[_id].vue` (full redesign), `TableItems.vue` (add type filter, inline price edit)
**Files to create**: None (enhance existing)

---

## 12. Inventory Inputs Section

### Current State

There is no dedicated inventory inputs admin page. The inventory form (`FormInventory.vue`) exists but is only accessible via modals. `TableInventoryInputs.vue` and `TableInventoryItems.vue` exist but are not linked from any admin page.

### Proposed Layout

#### 12.1 Inventory Dashboard Page

Create a new `/admin/inventory.vue` page (or repurpose the existing items page structure):

```
+-----------------------------------------------+
|  Inventory                    [+ Record Count] |
|                                                |
|  [Tabs: Current Stock | Count History | Items] |
|                                                |
|  [Current Stock Tab]                           |
|  Table of all items/bottles with:              |
|  - Item name                                   |
|  - Type                                        |
|  - Last count date                             |
|  - Last count quantity                          |
|  - Reorder point (configurable)                |
|  - Status (OK / Low / Out)                     |
|  Sortable and filterable                       |
|                                                |
|  [Count History Tab]                           |
|  Table of all inventory counts, sortable by    |
|  date. Group by count session.                 |
|                                                |
|  [Items Tab]                                   |
|  Links to the Items management page            |
|                                                |
+-----------------------------------------------+
```

#### 12.2 Inventory Count Workflow

Improve the count workflow:

1. **Start a count session**: User clicks "Record Count," enters a date, and is presented with a list of items to count.
2. **Batch counting**: Group items by location or type. User tabs through input fields entering quantities.
3. **Delta display**: As quantities are entered, show the change from last count.
4. **Save as draft / Submit**: Allow saving partial counts and coming back later.

**Files to create**: `pages/admin/inventory.vue` or `pages/admin/inventory/index.vue`
**Files to modify**: `FormInventory.vue` (improve), `AdminSidebar.vue` (add Inventory link)

---

## 13. Contacts Section

### Current State

- **Page** (`/admin/contacts.vue`): `TableContacts.vue` with legacy table. Columns: name, type. Expand row shows website, address, email, phone. Edit/delete via dropdown.
- **Form** (`FormContact.vue`): First name, last name, business name, type, website, address, email, phone. Opens in shared modal.
- No contact detail page.

### Proposed Layout

#### 13.1 Contact List Page

1. **Type filter tabs**: Vendor | Customer | Distributor | Employee | Supplier | Other | All.
2. **Enhanced table columns**: Show business name, contact name, type, email, phone. Do not hide contact info behind an expand.
3. **Avatar/initials**: Show a colored circle with initials or uploaded avatar next to each contact name.
4. **Click-to-call/email**: Make phone and email fields clickable (`tel:` and `mailto:` links).

#### 13.2 Contact Detail Page

Create `/admin/contacts/[_id].vue`:

```
+-----------------------------------------------+
|  [Breadcrumb: Contacts > Midwest Grain]        |
|                                                |
|  +------------------+  +--------------------+  |
|  | [Avatar/Logo]    |  | Midwest Grain      |  |
|  |                  |  | Type: Vendor        |  |
|  |                  |  | John Smith          |  |
|  +------------------+  | john@midwest.com    |  |
|                         | (555) 123-4567      |  |
|                         | 123 Main St, TX     |  |
|                         | www.midwestgrain.com |  |
|                         | [Edit] [Delete]      |  |
|                         +--------------------+  |
|                                                |
|  [Tabs: Purchase Orders | Items | Notes]       |
|                                                |
|  [Purchase Orders Tab]                         |
|  List of all POs with this contact as vendor   |
|                                                |
|  [Items Tab]                                   |
|  List of items supplied by this vendor         |
|                                                |
|  [Notes Tab]                                   |
|  Free-form notes about this contact            |
|                                                |
+-----------------------------------------------+
```

#### 13.3 Contact Form Improvements

1. **Avatar/logo upload**: Add an image upload for contact logo or avatar photo.
2. **Notes field**: Add a notes textarea for vendor notes, delivery preferences, etc.
3. **Multiple addresses**: Allow adding multiple addresses (billing, shipping).
4. **Open via slide-over panel**: Replace modal with `PanelContactForm.vue`.

**Files to create**: `pages/admin/contacts/[_id].vue` (detail page), `PanelContactForm.vue`
**Files to modify**: `pages/admin/contacts.vue` (rename to `pages/admin/contacts/index.vue`), `TableContacts.vue` (enhance), `FormContact.vue` (add avatar, notes)
**Data model additions**: Add `notes?: string`, `avatar?: string` to Contact interface and schema.

---

## 14. Purchase Orders Section

### Current State

- **Page** (`/admin/purchaseOrders.vue`): `TablePurchaseOrders.vue` with legacy table. Columns: status, vendor, total amount, date. Expand row shows nested items table. Edit/delete via dropdown.
- **Form** (`FormPurchaseOrder.vue`): Date picker, status select, vendor select, items table with add/remove, running total. Opens in shared modal. After submit, updates each item's `purchaseHistory` array.

### Proposed Layout

#### 14.1 Purchase Order List Page

1. **Status filter tabs**: All | Pending | Confirmed | Shipped | Delivered | Cancelled.
2. **Enhanced table**: Add PO number (auto-generated), expected delivery date, item count.
3. **Status color badges**: Green for delivered, yellow for pending/confirmed, blue for shipped, red for cancelled.
4. **Quick status update**: Allow changing PO status directly from the table row (inline select or one-click buttons) without opening the full form.

#### 14.2 Purchase Order Detail Page

Create `/admin/purchaseOrders/[_id].vue`:

```
+-----------------------------------------------+
|  Purchase Order #PO-2026-042                   |
|  Status: Shipped                  [Edit] [PDF] |
|                                                |
|  Vendor: Midwest Grain Supply                  |
|  Date: February 5, 2026                        |
|  Expected Delivery: February 12, 2026          |
|                                                |
|  +------------------------------------------+  |
|  | Items                                    |  |
|  | Item      | Qty | Size    | Price | Total|  |
|  | Corn      | 10  | 50 lb   | $15   | $150 |  |
|  | Rye       | 5   | 50 lb   | $20   | $100 |  |
|  | ...                                      |  |
|  +------------------------------------------+  |
|  | Subtotal: $250.00                        |  |
|  | Shipping: --                              |  |
|  | Total: $250.00                            |  |
|  +------------------------------------------+  |
|                                                |
|  [Receiving Log]                               |
|  Track what was actually received vs ordered   |
|                                                |
|  [Attachments]                                 |
|  Upload invoices, packing slips, etc.          |
|                                                |
+-----------------------------------------------+
```

#### 14.3 Purchase Order Form Improvements

1. **Auto-generate PO number**: Sequential PO numbering (PO-YYYY-NNN).
2. **Expected delivery date**: Add a delivery date field.
3. **Receiving workflow**: When status changes to "Delivered," prompt user to confirm quantities received. Update item inventory accordingly.
4. **Attachment upload**: Upload invoices, receipts, packing slips (PDF/image).
5. **Duplicate PO**: Quick action to create a new PO based on a previous one (common for repeat orders).
6. **PDF export**: Generate a printable/downloadable PO document.

**Files to create**: `pages/admin/purchaseOrders/[_id].vue`, `PanelPurchaseOrderForm.vue`
**Files to modify**: `pages/admin/purchaseOrders.vue` (rename to directory structure), `TablePurchaseOrders.vue` (add status filter), `FormPurchaseOrder.vue` (add delivery date, attachments)
**Data model additions**: Add `poNumber?: string`, `expectedDelivery?: Date`, `attachments?: string[]`, `receiving?: { item: string; quantityOrdered: number; quantityReceived: number }[]` to PurchaseOrder interface and schema.

---

## 15. Users Section

### Current State

There is no user management page in the admin. `FormUser.vue` exists but is not accessible from any admin route. User creation hits `POST /api/users/create` directly.

### Proposed Layout

Create `/admin/users.vue` (accessible from the Admin section in sidebar):

```
+-----------------------------------------------+
|  Users                          [+ Create User]|
|                                                |
|  +------------------------------------------+  |
|  | Name            | Email         | Role   |  |
|  | Timothy Johnson | tim@gdc.com   | Admin  |  |
|  | Jane Doe        | jane@gdc.com  | Staff  |  |
|  +------------------------------------------+  |
|                                                |
+-----------------------------------------------+
```

1. List all users with name, email, and role.
2. Create new user via slide-over panel.
3. Edit user (change name, email, role -- not password in this view).
4. Password reset action (separate from edit).
5. Deactivate/delete user with confirmation.
6. Add a `role` field to the User schema: "Admin" | "Manager" | "Staff" | "ReadOnly."

**Files to create**: `pages/admin/users.vue`, `components/Table/TableUsers.vue`, `PanelUserForm.vue`
**Files to modify**: `FormUser.vue` (adapt for panel), User schema and interface (add role)

---

## 16. Proofing Calculator

### Current State

- **Page** (`/admin/proofing.vue`): Renders `<Proofing />` component inside `UContainer`.
- **Component** (`Proofing.vue`): Initial weight/unit, initial ABV, computed volume, target ABV, add water steps with volume/unit/new ABV, estimated final volume and recommended water. Functional but basic layout.

### Proposed Layout

The proofing calculator is a utility tool, not a data management page. Keep it as a tool but improve:

1. **Visual diagram**: Show a simple visual of the proofing process (container filling with water, ABV going down).
2. **Proof (not just ABV)**: Display both ABV% and Proof (ABV x 2) since TTB uses proof.
3. **Save proofing sessions**: Allow saving a proofing calculation and linking it to a batch.
4. **Temperature correction**: Add a temperature correction field (since TTB requires 60F/15.56C for official proof measurements). Use TTB Table 1 corrections.
5. **Print/export**: Generate a proofing record for TTB compliance.
6. **Accessible from header**: The calculator modal is already in the header -- keep that shortcut, but also have it as a full page for detailed work.

**Files to modify**: `Proofing.vue` (add proof display, temp correction, save to batch), `pages/admin/proofing.vue` (page layout)

---

## 17. Controls (Equipment)

### Current State

- **Page** (`/admin/controls.vue`): WebSocket-based control panel for mash tun and kettle. Shows connection status indicator, power on/off, power level, reflux (kettle), agitator on/off. Sends real-time updates via WebSocket.

### Proposed Layout

This is a specialized IoT control page. Improvements:

1. **Equipment status dashboard**: Show all controllable equipment as cards with real-time status indicators.
2. **Temperature monitoring**: If sensors are available, show real-time temperature readings with a live chart.
3. **Safety interlocks**: Visual warnings when power exceeds safe levels or equipment is on but should not be.
4. **Session logging**: Automatically log equipment usage sessions (start time, end time, settings) and link them to the active batch.
5. **Styling**: Apply the GDC dark theme styling (currently uses raw UCard/UFormGroup without the charcoal/copper theme).

**Files to modify**: `pages/admin/controls.vue` (restyle, add logging)

---

## 18. File/Photo Upload Strategy

### Technical Approach

#### Storage: Cloudinary

Use **Cloudinary** as the image/file storage service:

- **Why Cloudinary**: First-class Nuxt integration via `@nuxt/image` with Cloudinary provider. Automatic image optimization (format, quality, resize). Built-in CDN. Free tier supports 25GB storage and 25GB bandwidth/month -- sufficient for a craft distillery's needs. No need to manage S3 buckets or storage infrastructure.
- **Alternative (S3)**: If Cloudinary's free tier is exceeded or the team prefers self-managed infrastructure, use AWS S3 with CloudFront CDN.

#### Implementation Plan

1. **Install and configure Cloudinary**:
   - Add `cloudinary` and `@nuxt/image` packages.
   - Configure Cloudinary credentials in `.env`:
     ```
     CLOUDINARY_CLOUD_NAME=gdc-distilling
     CLOUDINARY_API_KEY=xxx
     CLOUDINARY_API_SECRET=xxx
     ```
   - Configure `@nuxt/image` with Cloudinary provider in `nuxt.config.ts`.

2. **Create upload API endpoint** (`server/api/upload/index.post.ts`):
   - Accept multipart form data with the file.
   - Upload to Cloudinary using the Node SDK.
   - Return the Cloudinary URL and public ID.
   - Support folders: `bottles/`, `cocktails/`, `recipes/`, `batches/`, `contacts/`, `productions/`, `purchaseOrders/`.

3. **Create upload composable** (`composables/useFileUpload.ts`):
   ```typescript
   export const useFileUpload = () => {
     const uploading = ref(false);
     const progress = ref(0);

     async function upload(file: File, folder: string): Promise<string> {
       uploading.value = true;
       try {
         const formData = new FormData();
         formData.append('file', file);
         formData.append('folder', folder);
         const result = await $fetch('/api/upload', {
           method: 'POST',
           body: formData,
         });
         return result.url;
       } finally {
         uploading.value = false;
       }
     }

     async function remove(publicId: string): Promise<void> { ... }

     return { upload, remove, uploading, progress };
   };
   ```

4. **Create reusable upload component** (`components/Form/FormImageUpload.vue`):
   - Drag-and-drop zone with click-to-browse fallback.
   - Preview thumbnail after upload.
   - Remove/replace action.
   - Loading spinner during upload.
   - File type and size validation (accept images, max 5MB).
   - Props: `modelValue` (current URL), `folder` (Cloudinary subfolder), `label`.

5. **Create document upload component** (`components/Form/FormFileUpload.vue`):
   - Similar to image upload but for PDFs, documents.
   - Shows file name and type icon instead of image preview.
   - Used for: PO invoices, recipe documents, TTB forms.

#### Where Photos/Files Are Needed

| Resource | Photo/File | Field Name | Folder | Purpose |
|----------|-----------|------------|--------|---------|
| Bottle | Image | `img` | `bottles/` | Product photo for public site and admin |
| Cocktail | Image | `img` | `cocktails/` | Cocktail photo for menu |
| Recipe | Photos | `photos[]` | `recipes/` | Reference photos, process docs |
| Batch | Photos | `photos[]` | `batches/` | Mash, fermentation, distillation photos |
| Contact | Avatar | `avatar` | `contacts/` | Logo or headshot |
| Production | Photos | `photos[]` | `productions/` | Bottling day documentation |
| Purchase Order | Attachments | `attachments[]` | `purchaseOrders/` | Invoices, receipts, packing slips |

**Files to create**: `server/api/upload/index.post.ts`, `server/api/upload/[id].delete.ts`, `composables/useFileUpload.ts`, `components/Form/FormImageUpload.vue`, `components/Form/FormFileUpload.vue`
**Files to modify**: All form components (add upload fields), all interfaces (add photo/file fields), all Mongoose schemas (add photo/file fields)

---

## 19. Mobile Responsiveness Strategy

### Current Approach

The layout is partially responsive:
- Sidebar: hidden on mobile with hamburger toggle, overlay backdrop.
- Forms: breakpoint-based grids (`grid-cols-1 sm:grid-cols-2`).
- Tables: overflow-x-auto wrappers.

### Enhanced Strategy

#### 19.1 Layout Adaptations

- **Mobile (< 768px)**:
  - Sidebar: Hidden by default, slides in as overlay.
  - Header: Simplified -- logo, hamburger, user avatar dropdown.
  - Content: Full-width, reduced padding (`p-3`).
  - Tables: Switch to card-based list view on small screens (each row becomes a stacked card).
  - Forms in slide-over panels: Become full-screen modals on mobile.
  - Dashboard: Single-column stack of all widgets.

- **Tablet (768px - 1024px)**:
  - Sidebar: Collapsed by default (icons only), expandable.
  - Two-column layouts where space allows.
  - Tables: Horizontal scroll with pinned first column.

- **Desktop (> 1024px)**:
  - Full sidebar.
  - Multi-column layouts.
  - Side-by-side detail pages.
  - Slide-over panels at 480-640px width.

#### 19.2 Touch-Friendly Interactions

- Larger tap targets for buttons and action items (minimum 44x44px).
- Swipe gestures for common actions (swipe left on table row to reveal edit/delete).
- Bottom action bar on mobile for primary actions (instead of requiring scroll to reach buttons).

#### 19.3 Responsive Table Strategy

Create a `useResponsiveTable` composable that:
- Detects screen size.
- Below a breakpoint (768px), switches the table to a card list view.
- Provides a `viewMode` ref (`'table' | 'cards'`) for components to react to.

**Files to create**: `composables/useResponsiveTable.ts`
**Files to modify**: All table components (add card view mode)

---

## 20. Reporting and Analytics

### Current State

No reporting exists. The dashboard shows basic counts and lists. Chart.js is installed and used only for fermentation gravity charts and bottle inventory charts.

### Proposed Reports

#### 20.1 Production Report

- **Time period selector**: Weekly, monthly, quarterly, annual, custom range.
- **Metrics**:
  - Total bottles produced
  - Total production cost
  - Average cost per bottle
  - Production by bottle product (pie chart)
  - Production timeline (bar chart by week/month)
  - Cost trend over time (line chart)

#### 20.2 Inventory Report

- **Current stock levels**: All items and bottles with quantities and values.
- **Inventory turnover**: How fast items are consumed vs. purchased.
- **Low stock alerts**: Items below reorder point.
- **Inventory valuation**: Total value of all raw materials and finished goods.

#### 20.3 Cost Analysis Report

- **Batch cost breakdown**: For each batch, show ingredient costs, barrel costs, bottling costs, total cost, and cost per bottle.
- **Recipe cost comparison**: Compare costs across recipes.
- **Margin analysis**: Bottle price minus cost per bottle for each product.

#### 20.4 Barrel Aging Report

- **Barrel inventory summary**: Total barrels, by char level, by size, by age range.
- **Angel's share tracking**: Entry volume vs. current volume for each barrel.
- **Aging timeline**: Visual timeline of all barrels, when they were filled, when they are expected to be dumped.

#### 20.5 TTB-Style Compliance Reports (Future)

- **Monthly production summary**: Required by TTB. Total proof gallons produced, by type.
- **Storage report**: Spirits on hand, by type, in proof gallons.
- **Processing report**: Spirits bottled, gauged, etc.

These are inspired by Barrel Clarity's automated 5110.11 and 5110.28 report generation and Whiskey Systems' one-click TTB reporting.

**Files to create**: `pages/admin/reports/index.vue`, `pages/admin/reports/production.vue`, `pages/admin/reports/inventory.vue`, `pages/admin/reports/costs.vue`, `pages/admin/reports/barrels.vue`, `components/Report/ReportProductionChart.vue`, `components/Report/ReportInventoryTable.vue`, `components/Report/ReportCostBreakdown.vue`, `components/Report/ReportBarrelAging.vue`
**Files to modify**: `AdminSidebar.vue` (add Reports section)

---

## 21. Inspiration from Competitors

### Feature Comparison

| Feature | GDC (Current) | Ekos | Barrel Clarity | DRAMS | Crafted ERP | Brewfather |
|---------|-------------|------|---------------|-------|-------------|------------|
| Batch tracking | Basic table | Full pipeline with scheduling | Grain-to-glass tracking | Focus on barrel inventory | Full lifecycle | Recipe-centric with batch variations |
| Barrel management | Basic vessel type | Part of vessel system | Dedicated barrel tracking | Industry-leading warehouse visualization | Barrel lifecycle with mapping | N/A |
| Recipe management | Items list + directions | Detailed formulation | Basic | Recipe-based blending | Full formulation | Advanced with scaling, water chemistry |
| Inventory | Manual counts | Automated consumption | Basic tracking | Advanced with allocations | Full ERP-level | Integrated with recipe |
| CRM/Contacts | Basic CRUD | Integrated CRM + sales | N/A | N/A | Full CRM + accounting | N/A |
| Compliance/TTB | None | Proof tracking | Automated TTB reports | Customs/regulatory reports | Full compliance suite | N/A |
| Dashboard | Status cards | Sales + production dashboard | Production overview | Warehouse analytics | Configurable dashboards | Brew day overview |
| Mobile | Responsive | Mobile app | Mobile-friendly logs | Desktop focused | Mobile accessible | First-class mobile + tablet |
| Photo/file upload | None | Limited | Immutable logs | N/A | Document management | N/A |
| Reporting | None | Sales + production reports | TTB reports + cost analysis | Extensive warehouse reports | Full BI reporting | Fermentation analysis |

### Patterns to Adopt

1. **From Ekos**: Drag-and-drop production scheduling, floorplan/visual vessel layout, sales dashboard with real-time insights.
2. **From Barrel Clarity**: Immutable production logs, automated compliance reports, clear cost-of-goods-sold calculations, barrel-as-first-class-entity.
3. **From DRAMS**: Warehouse visualization (barrel grid with color-coded aging), rack-level location tracking, vacuity forecasting (how full is the warehouse over time).
4. **From Crafted ERP**: Drag-and-drop scheduling boards, unified operations view, raw material auto-consumption from batches.
5. **From Brewfather**: Clean mobile-first interface, recipe scaling calculator, fermentation analysis dashboard, batch-as-variation-of-recipe pattern, cross-device sync.

### Key Takeaways for GDC

Given GDC's scale (single craft distillery, small team), the priorities are:

- **Barrel Clarity's philosophy** is closest: focused on craft distillers, emphasizing traceability, cost tracking, and compliance. Do not over-engineer with ERP-level complexity.
- **Brewfather's UX** is the gold standard: clean, modern, responsive, easy to navigate. Strive for this level of polish.
- **Ekos's visual scheduling** is inspiring: the idea of a visual vessel floorplan with drag-and-drop batch management would be transformational.
- **DRAMS's warehouse visualization** for barrel management is something no small tool does well -- even a simplified version (barrel grid with aging info) would be valuable.

---

## 22. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
**Goal**: Establish the consistent component patterns that all future work builds on.

1. Create `AdminPageHeader.vue` and apply to all admin pages.
2. Create `TableWrapper.vue` and migrate all tables to TanStack pattern.
3. Create `useFormPanel.ts` composable.
4. Create the first `Panel*.vue` slide-over components (start with `PanelContactForm`, `PanelVesselForm`, `PanelBatchForm`).
5. Replace `ModalForms.vue` and `formSelection` with individual slide-over panels for remaining resources.
6. Fix `/admin/index.vue` to redirect to dashboard.
7. Delete `pages/admin/recipe.vue` (duplicate).
8. Standardize all `UFormGroup` to `UFormField`.

### Phase 2: Dashboard and Navigation (Weeks 3-5)
**Goal**: Make the dashboard the operational command center.

1. Build `AdminCommandPalette.vue` with global search.
2. Enhance `AdminSidebar.vue` with badge counts and quick-add buttons.
3. Add `AdminBreadcrumbs.vue` to admin layout.
4. Redesign `AdminDashboard.vue`:
   - Add KPI stat cards.
   - Integrate `DashboardBatchPipeline.vue` as primary pipeline view.
   - Build `DashboardVesselStatus.vue`.
   - Build `DashboardAlerts.vue`.
   - Enhance `DashboardProduction.vue`.
   - Build `DashboardBottleInventoryQuick.vue`.

### Phase 3: File Upload System (Weeks 5-6)
**Goal**: Enable photo and file uploads throughout the app.

1. Set up Cloudinary account and configuration.
2. Build upload API endpoint.
3. Build `useFileUpload.ts` composable.
4. Build `FormImageUpload.vue` and `FormFileUpload.vue` components.
5. Add image upload to bottle form and detail page.
6. Add image upload to cocktail form.
7. Update schemas and interfaces with photo/file fields.

### Phase 4: Detail Pages (Weeks 6-9)
**Goal**: Rich, informative detail pages for all major entities.

1. Redesign batch detail page with lifecycle timeline and tabbed content (biggest effort).
2. Build recipe detail page with ingredients table, cost calculation, batches tab.
3. Redesign bottle detail page with image, tabs (inventory, productions, description).
4. Build contact detail page with related POs and items tabs.
5. Build purchase order detail page with items, receiving log, attachments.
6. Enhance item detail page with resolved purchase/inventory history.

### Phase 5: Enhanced Sections (Weeks 9-12)
**Goal**: Elevate each section beyond basic CRUD.

1. Vessel section redesign with card grid view and grouped layout.
2. Barrel warehouse visualization.
3. Consolidated vessel transfer panel.
4. Bottle card grid view with image.
5. Cocktail card view with menu filtering.
6. Cocktail cheat sheets page improvements.
7. Purchase order status workflow enhancements.
8. Production form wizard.
9. Inventory count workflow improvements.
10. User management page.
11. Proofing calculator improvements.

### Phase 6: Reporting and Analytics (Weeks 12-14)
**Goal**: Add data insights and reports.

1. Create reports section in sidebar.
2. Production report with charts.
3. Inventory report with stock levels.
4. Cost analysis report.
5. Barrel aging report.

### Phase 7: Advanced Features (Weeks 14+)
**Goal**: Power user features and polish.

1. Batch drag-and-drop advancement in pipeline.
2. Keyboard shortcuts for power users.
3. Responsive card views for all tables on mobile.
4. PDF export for POs, production records, reports.
5. TTB compliance report generation.
6. Equipment controls theming and session logging.
7. Performance optimization (lazy loading, virtual scrolling for large tables).

---

## Appendix: File Inventory

### Files to Create

| File | Purpose |
|------|---------|
| `components/Admin/AdminPageHeader.vue` | Reusable page header with title, description, actions |
| `components/Admin/AdminCommandPalette.vue` | Global search across all resources |
| `components/Admin/AdminBreadcrumbs.vue` | Breadcrumb navigation for detail pages |
| `components/Table/TableWrapper.vue` | Shared table layout with search, pagination, empty states |
| `components/Panel/PanelBatchForm.vue` | Batch create/edit slide-over panel |
| `components/Panel/PanelRecipeForm.vue` | Recipe create/edit slide-over panel |
| `components/Panel/PanelBottleForm.vue` | Bottle create/edit slide-over panel |
| `components/Panel/PanelCocktailForm.vue` | Cocktail create/edit slide-over panel |
| `components/Panel/PanelContactForm.vue` | Contact create/edit slide-over panel |
| `components/Panel/PanelVesselForm.vue` | Vessel create/edit slide-over panel |
| `components/Panel/PanelVesselTransfer.vue` | Vessel transfer slide-over panel |
| `components/Panel/PanelProductionForm.vue` | Production create/edit slide-over panel |
| `components/Panel/PanelPurchaseOrderForm.vue` | Purchase order create/edit slide-over panel |
| `components/Panel/PanelItemForm.vue` | Item create/edit slide-over panel |
| `components/Panel/PanelInventoryForm.vue` | Inventory count slide-over panel |
| `components/Panel/PanelUserForm.vue` | User create/edit slide-over panel |
| `components/Dashboard/DashboardVesselStatus.vue` | Vessel status grid for dashboard |
| `components/Dashboard/DashboardAlerts.vue` | Actionable alerts feed for dashboard |
| `components/Dashboard/DashboardBottleInventoryQuick.vue` | Quick bottle stock overview |
| `components/Batch/BatchLifecycleTimeline.vue` | Visual stepper for batch stages |
| `components/Batch/BatchOverviewTab.vue` | Batch detail overview tab |
| `components/Batch/BatchFermentingTab.vue` | Batch detail fermenting tab |
| `components/Batch/BatchDistillingTab.vue` | Batch detail distilling tab |
| `components/Batch/BatchBarrelTab.vue` | Batch detail barrel aging tab |
| `components/Batch/BatchBottlingTab.vue` | Batch detail bottling tab |
| `components/Batch/BatchNotesTab.vue` | Batch detail notes tab |
| `components/Batch/BatchPhotosTab.vue` | Batch detail photos tab |
| `components/Bottle/BottleCard.vue` | Bottle product card for grid view |
| `components/Bottle/BottleCardGrid.vue` | Grid layout of bottle cards |
| `components/Cocktail/CocktailCard.vue` | Cocktail card for grid view |
| `components/Vessel/VesselCard.vue` | Vessel card with fill level bar |
| `components/Vessel/VesselGrid.vue` | Grouped vessel card grid |
| `components/Vessel/BarrelWarehouse.vue` | Barrel warehouse visualization |
| `components/Form/FormImageUpload.vue` | Drag-and-drop image upload |
| `components/Form/FormFileUpload.vue` | Document/file upload |
| `components/Report/ReportProductionChart.vue` | Production report charts |
| `components/Report/ReportInventoryTable.vue` | Inventory report table |
| `components/Report/ReportCostBreakdown.vue` | Cost analysis charts/tables |
| `components/Report/ReportBarrelAging.vue` | Barrel aging visualization |
| `composables/useFormPanel.ts` | Shared form panel logic |
| `composables/useFileUpload.ts` | File upload composable |
| `composables/useResponsiveTable.ts` | Responsive table/card switching |
| `server/api/upload/index.post.ts` | File upload API endpoint |
| `server/api/upload/[id].delete.ts` | File delete API endpoint |
| `pages/admin/contacts/index.vue` | Contacts list (moved from contacts.vue) |
| `pages/admin/contacts/[_id].vue` | Contact detail page |
| `pages/admin/production/index.vue` | Productions list (moved from production.vue) |
| `pages/admin/production/[_id].vue` | Production detail page |
| `pages/admin/purchaseOrders/index.vue` | PO list (moved from purchaseOrders.vue) |
| `pages/admin/purchaseOrders/[_id].vue` | PO detail page |
| `pages/admin/inventory.vue` or `pages/admin/inventory/index.vue` | Inventory dashboard |
| `pages/admin/users.vue` | User management page |
| `pages/admin/reports/index.vue` | Reports hub |
| `pages/admin/reports/production.vue` | Production report |
| `pages/admin/reports/inventory.vue` | Inventory report |
| `pages/admin/reports/costs.vue` | Cost analysis report |
| `pages/admin/reports/barrels.vue` | Barrel aging report |
| `components/Table/TableUsers.vue` | User management table |

### Files to Delete

| File | Reason |
|------|--------|
| `components/ModalForms.vue` | Replaced by individual slide-over panels |
| `components/Modal/ModalBottle.vue` | Replaced by `PanelBottleForm.vue` |
| `components/Modal/ModalCocktail.vue` | Replaced by `PanelCocktailForm.vue` |
| `components/Modal/ModalItem.vue` | Replaced by `PanelItemForm.vue` |
| `components/Modal/ModalRecipe.vue` | Replaced by `PanelRecipeForm.vue` |
| `pages/admin/recipe.vue` | Duplicate of `pages/admin/recipes/index.vue` |
| `components/Admin/AdminSearch.vue` | Replaced by `AdminCommandPalette.vue` |
| `components/DashboardUpcoming.vue` | Replaced by enhanced `DashboardBatchPipeline.vue` |
| `components/DashboardBrewing.vue` | Replaced by enhanced `DashboardBatchPipeline.vue` |
| `components/DashboardFermenters.vue` | Replaced by enhanced `DashboardBatchPipeline.vue` |
| `components/DashboardDistilling.vue` | Replaced by enhanced `DashboardBatchPipeline.vue` |

### Files to Significantly Modify

| File | Changes |
|------|---------|
| `layouts/admin.vue` | Add breadcrumb slot |
| `components/Admin/AdminHeader.vue` | Add command palette trigger, quick actions, notifications |
| `components/Admin/AdminSidebar.vue` | Add badge counts, quick-add buttons |
| `components/Admin/AdminDashboard.vue` | Full redesign with new widget layout |
| `composables/modalStatus.ts` | Remove legacy form modal exports |
| All `Form*.vue` components | Replace `UFormGroup` with `UFormField`, add image uploads |
| All `Table*.vue` components | Migrate to TanStack, adopt `TableWrapper` |
| `pages/admin/batch/[_id].vue` | Full redesign with lifecycle tabs |
| `pages/admin/bottles/[_id].vue` | Full redesign with image and tabs |
| `pages/admin/items/[_id].vue` | Enhance with resolved history data |
| `pages/admin/recipes/[_id].vue` | Full redesign (currently renders raw JSON) |
| `pages/admin/vessels.vue` | Redesign with card grid layout |
| All type interfaces | Add photo/file fields, new fields per section |
| All Mongoose schemas | Add photo/file fields, new fields per section |
