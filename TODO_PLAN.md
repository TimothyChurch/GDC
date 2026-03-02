# TODO Implementation Plan

> Generated 2026-03-02 based on `TODOS.md` and full codebase exploration.

---

## Overview

9 TODO items covering: collapsible distilling runs, delete buttons on detail pages, vessel page fixes (add button + hide barrels), barrel page improvements (click-to-detail + dispose), barrel transfer logic (correct vessel options + auto-mark-used), and inventory withdrawal on mash start. Grouped into 6 phases.

---

## Phase 1: Vessel Page UI Fixes
**Complexity:** Low | **Agent:** distillery-admin-builder

### 1A. Add "Add Vessel" button to vessel page (grid view)
- **Problem:** Grid view on `/admin/vessels` has no "Add Vessel" button — only table view has one
- **Current:** `pages/admin/vessels/index.vue` — header has Transfer + View toggle buttons but no Add button
- **Change:** Add "Add Vessel" button to page header actions. On click: `vesselStore.resetVessel()` then open `PanelVessel` slide-over.
- **Files:** `pages/admin/vessels/index.vue`

### 1B. Hide barrels from vessel page
- **Problem:** Barrels have their own page (`/admin/barrels`) but still appear on the vessel page
- **Current:** `VesselGrid.vue` groups ALL vessels including `type === 'Barrel'`
- **Change:** Filter out vessels where `type === 'Barrel'` from both `VesselGrid.vue` and `TableVessels.vue`
- **Files:** `components/Vessel/VesselGrid.vue`, `components/Table/TableVessels.vue`

---

## Phase 2: Barrel Page Improvements
**Complexity:** Medium | **Agent:** distillery-admin-builder

### 2A. Barrel click → barrel detail page first
- **Problem:** Clicking a barrel card goes directly to the batch page — user wants barrel details first
- **Current:** `BarrelCard.vue` navigates to `/admin/batch/{batchId}` on click
- **Change:** Navigate to `/admin/vessels/{barrelId}` instead. The vessel detail page already has barrel-specific sections with links to batches.
- **Files:** `components/Barrel/BarrelCard.vue`

### 2B. Add "Dispose Barrel" button to barrel page
- **Problem:** No way to dispose/retire a barrel from the barrel warehouse
- **Current:** No dispose action on `BarrelCard.vue` or `BarrelWarehouse.vue`
- **Change:** Add a dispose button/action to `BarrelCard.vue`. On click with confirmation: empty barrel contents (if any), mark `isUsed = true`, set `status = 'Disposed'`. Add `disposeBarrel()` action to `useVesselStore.ts`. Filter disposed barrels out of main warehouse view (or show them in a separate "Disposed" section).
- **Files:** `components/Barrel/BarrelCard.vue`, `stores/useVesselStore.ts`, possibly `components/Barrel/BarrelWarehouse.vue`

---

## Phase 3: Delete Buttons on Detail Pages
**Complexity:** Medium | **Agent:** distillery-admin-builder

### 3. Add delete buttons to entity detail pages
- **Problem:** Only customer and event detail pages have delete buttons. Recipes, vessels, items, cocktails, contacts, production, purchase orders, and inbox messages all lack delete on their detail pages.
- **Current:** All entities have working delete via table row actions (`useDeleteConfirm` + store). 8 detail pages lack delete buttons.
- **Change:** Add a delete button with `useDeleteConfirm` confirmation to each detail page. Navigate back to list on success.
- **Pattern:** Follow the existing customer/event detail page pattern.
- **Files:**
  - `pages/admin/recipes/[_id].vue`
  - `pages/admin/vessels/[_id].vue`
  - `pages/admin/items/[_id].vue`
  - `pages/admin/cocktails/[_id].vue`
  - `pages/admin/contacts/[_id].vue`
  - `pages/admin/production/[_id].vue`
  - `pages/admin/purchaseOrders/[_id].vue`
  - `pages/admin/inbox/[_id].vue`

---

## Phase 4: Barrel Transfer Logic
**Complexity:** Medium-High | **Agent:** distillery-admin-builder

### 4A. Barrel-to-proofing transfer shows correct vessel options
- **Problem:** When transferring from barrel aging to proofing, vessel options should show the barrels that contain this batch
- **Current:** `BatchAdvanceAction.vue` selects vessel options by `STAGE_VESSEL_TYPE` — for proofing it offers "Tank" type vessels. The source barrel selection is missing.
- **Change:** When transferring FROM "Barrel Aging", show a source vessel dropdown listing only barrels that contain this batch (filter `vesselStore.barrels` where `contents` includes `batchId`). The destination vessel for proofing remains Tank type.
- **Files:** `components/Batch/BatchAdvanceAction.vue`

### 4B. Mark barrel as used when batch transfers out
- **Problem:** Transferring a batch out of a barrel should auto-mark the barrel as used
- **Current:** `vesselStore.emptyVessel()` marks `isUsed = true` but only runs on explicit empty. `transferBatchContents()` doesn't check.
- **Change:** In `vesselStore.transferBatchContents()`, after transfer completes, check if source is a barrel and is now empty. If so, set `isUsed = true` and `previousContents` from recipe name.
- **Files:** `stores/useVesselStore.ts`

---

## Phase 5: Collapsible Distilling Runs
**Complexity:** Medium | **Agent:** distillery-admin-builder

### 5. Distilling runs collapse to overview
- **Problem:** With many runs, the distilling card is too long to easily scan
- **Current:** `BatchDistilling.vue` renders all runs fully expanded via `BatchDistillingRun.vue`
- **Change:** Add collapsed/expanded state per run. Collapsed view shows single-line summary: run number, type badge, date, charge volume, total PG. Click to expand full details. Default: collapsed when NOT editing. Add "Expand All / Collapse All" toggle above the run list.
- **Files:** `components/Batch/BatchDistillingRun.vue`, `components/Batch/BatchDistilling.vue`

---

## Phase 6: Inventory Withdrawal on Mash Start
**Complexity:** High | **Agent:** distillery-admin-builder

### 6. Starting a mash withdraws ingredients from inventory
- **Problem:** Starting a mash for a batch should deduct recipe ingredients from inventory
- **Current:** `BatchMashing.vue` displays scaled ingredients but doesn't withdraw from inventory. `useInventoryStore.ts` has `createBulk()` for recording changes. `useProductionStore.ts` shows the pattern (used for bottling material withdrawal).
- **Change:**
  1. When batch transitions to Mashing (via `startFirstStage()` or `advanceToStage()` to Mashing), calculate scaled ingredient amounts from recipe
  2. For each recipe item with `trackInventory === true`: get current stock, subtract scaled amount, create inventory record with new stock level
  3. Use `inventoryStore.createBulk()` to record all withdrawals
  4. Show toast confirmation of what was withdrawn
- **Pattern:** Follow `useProductionStore.ts` → `adjustInventoryForProduction()` (lines 64-160)
- **Files:** `stores/useBatchStore.ts`, possibly `components/Batch/BatchAdvanceAction.vue`

---

## Dependency Map

```
Phase 1 (vessel UI)           Phase 2 (barrel page)         Phase 3 (delete buttons)
├─ 1A: Add vessel btn        ├─ 2A: Click → detail         ├─ 3: Delete on 8 pages
└─ 1B: Hide barrels          └─ 2B: Dispose barrel         │

Phase 4 (barrel transfer)    Phase 5 (distilling)          Phase 6 (inventory)
├─ 4A: Transfer options      ├─ 5: Collapse runs           ├─ 6: Mash withdrawal
└─ 4B: Auto mark used        │                             │
```

All 6 phases are independent — can run in parallel.

---

## Effort Summary

| Item | Description | Complexity | Schema Change | Key Files |
|------|-------------|------------|---------------|-----------|
| 1A | Add vessel button (grid) | Low | No | `pages/admin/vessels/index.vue` |
| 1B | Hide barrels from vessels | Low | No | `VesselGrid.vue`, `TableVessels.vue` |
| 2A | Barrel click → detail | Low | No | `BarrelCard.vue` |
| 2B | Dispose barrel button | Medium | Maybe (status) | `BarrelCard.vue`, `useVesselStore.ts` |
| 3 | Delete on detail pages | Medium | No | 8 detail page files |
| 4A | Barrel transfer options | Medium | No | `BatchAdvanceAction.vue` |
| 4B | Mark barrel used on xfer | Low | No | `useVesselStore.ts` |
| 5 | Distilling run collapse | Medium | No | `BatchDistillingRun.vue`, `BatchDistilling.vue` |
| 6 | Mash inventory withdrawal | High | No | `useBatchStore.ts`, `BatchAdvanceAction.vue` |

## Agent Assignments

| Phase | Agent | Items |
|-------|-------|-------|
| 1-6 | `distillery-admin-builder` | All items |

---

## Status — ALL COMPLETE (2026-03-02)

- [x] Phase 1: Vessel Page UI Fixes
  - [x] 1A: Add vessel button — added to page header, works in both grid and table view
  - [x] 1B: Hide barrels — filtered from VesselGrid and TableVessels
- [x] Phase 2: Barrel Page Improvements
  - [x] 2A: Barrel click → vessel detail page (not batch)
  - [x] 2B: Dispose barrel — button on cards, disposeBarrel() store action, disposed filter in warehouse
- [x] Phase 3: Delete Buttons on Detail Pages
  - [x] 3: Added to 7 pages (inbox already had one) — recipes, vessels, items, cocktails, contacts, production, purchaseOrders
- [x] Phase 4: Barrel Transfer Logic
  - [x] 4A: Source barrel dropdown shows barrels containing this batch
  - [x] 4B: Auto-marks barrel isUsed + previousContents when emptied via transfer
- [x] Phase 5: Collapsible Distilling Runs
  - [x] 5: Collapsed summary row per run, expand/collapse all toggle, CSS Grid animation
- [x] Phase 6: Inventory Withdrawal on Mash Start
  - [x] 6: withdrawMashIngredients() with scale factor, unit conversion, idempotency guard, bulk inventory records

Build verified: `npm run build` passes with no errors.
