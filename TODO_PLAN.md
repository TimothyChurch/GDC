# TODO Plan — Bug Fixes & Features

> Generated 2026-02-27 based on `TODOS.md` and full codebase exploration.

---

## Overview

7 items covering: batch detail display (maceration recipe), table pagination fix, barrel navigation, batch list filtering, newsletter subscriber routing, contact inquiry inbox, and items category filtering.

---

## Phase 0: Quick Fixes (independent, no schema changes)

### 0A. Barrel Card → Batch Navigation
- **Problem**: Clicking a barrel card on `/admin/barrels` does nothing
- **Current**: `BarrelCard.vue` renders a `<div>` with no click handler or navigation
- **Fix**: Add `@click` with `router.push` to navigate to the batch detail page using `vessel.contents[0].batch`, add `cursor-pointer` class
- **Files**: `components/Barrel/BarrelCard.vue`
- **Agent**: `distillery-admin-builder`
- **Complexity**: Low

### 0B. Hide Barreled Batches from Batch List
- **Problem**: Batches in "Barreled" stage should be hidden from the batch list (viewable on barrels page instead)
- **Current**: `TableBatches.vue` line 13 shows ALL batches via `props.data ?? batchStore.batches`
- **Fix**: Filter `tableData` to exclude batches where `currentStage === 'Barreled'`
- **Files**: `components/Table/TableBatches.vue`
- **Agent**: `distillery-admin-builder`
- **Complexity**: Low

### 0C. Newsletter Subscribers → Customers Fix
- **Problem**: Newsletter signups appear in contacts but not on the customers page
- **Current**: `subscribe.post.ts` line 9 — when an existing contact subscribes, it only sets `newsletter: true` but doesn't change `type` to `'Customer'`. The `getCustomers()` getter filters by `type === 'Customer'`, so existing contacts with other types who subscribe won't appear in customers.
- **Fix**: In `subscribe.post.ts`, also set `type: 'Customer'` when updating existing contacts
- **Files**: `server/api/contact/subscribe.post.ts`
- **Agent**: `nuxt-server-specialist`
- **Complexity**: Low

---

## Phase 1: Component Enhancements (independent, no schema changes)

### 1A. Maceration Recipe Ingredients Display
- **Problem**: The maceration card doesn't show recipe ingredients like the mashing card does
- **Current**: `BatchMashing.vue` lines 121-159 shows a scaled ingredients table with item names, amounts, and costs. `BatchMaceration.vue` only uses `recipe.macerationDays` — no ingredient list.
- **Fix**: Add a "Recipe Botanicals" section to `BatchMaceration.vue` matching the Mashing card pattern. Import `useUnitConversion`, compute `scaleFactor` and `scaledIngredients` from recipe items, render the same Item/Amount/Cost grid.
- **Pattern**: Copy from `BatchMashing.vue` lines 13-37 (script) and lines 121-159 (template)
- **Files**: `components/Batch/BatchMaceration.vue`
- **Agent**: `distillery-admin-builder`
- **Complexity**: Medium

### 1B. Items Page Category Filtering
- **Problem**: Items page has no way to filter by category (Bottling, Base Ingredient, Botanical, Bar Supplies, Other)
- **Current**: `TableItems.vue` shows all items with only text search. `itemStore.getItemsByCategory()` exists. Categories defined in `types/interfaces/Item.ts` lines 1-7.
- **Fix**: Add category filter tabs/buttons to `TableItems.vue`. Show "All" + one tab per category. Filter the data based on selected category before passing to UTable.
- **Files**: `components/Table/TableItems.vue`
- **Agent**: `distillery-admin-builder`
- **Complexity**: Low-Medium

---

## Phase 2: Bug Investigation

### 2A. Table Pagination Not Working
- **Problem**: Pagination shows initial count but clicking page buttons doesn't navigate
- **Current**: All tables use `useTableState()` → `UTable` with `getPaginationRowModel()` → `TableWrapper` with `UPagination`. Code looks correct but user reports it doesn't work.
- **Investigation areas**:
  1. `UPagination` `@update:model-value` event — does it fire? Does the value format match expectations?
  2. `pagination` ref reactivity — does the update propagate back to UTable?
  3. `filteredTotal` — depends on `tableRef.tableApi.getFilteredRowModel()` which may not be exposed correctly
  4. Possible Nuxt UI v4 `UPagination` API mismatch (prop names, event names)
  5. Mobile card views iterate raw `tableData`/`store.items` directly — no pagination at all on mobile
- **Files**: `components/Table/TableWrapper.vue`, `composables/useTableHelpers.ts`
- **Agent**: `pro-debugger`
- **Complexity**: Medium

---

## Phase 3: New Feature (schema change required)

### 3A. Admin Inbox Page for Contact Inquiries
- **Problem**: "Send us a message" submissions are buried in contact `notes` field with no dedicated view
- **Current**: `inquiry.post.ts` creates contacts with `type: 'Inquiry'` and appends `[Topic] message` to notes. No inbox, no read/unread, no filtering.
- **Required**:
  1. **Schema**: Add `Message` model with fields: `contact` (ref to Contact), `topic`, `message`, `read` (boolean, default false), `createdAt`
  2. **API routes**: `server/api/message/` — list all, get one, mark read/unread, delete
  3. **Store**: `useMessageStore` with CRUD actions
  4. **Update `inquiry.post.ts`**: Create a Message document AND the Contact (if new). Keep Contact creation but store message separately.
  5. **Admin page**: `pages/admin/inbox/index.vue` — message list with read/unread status, topic filtering, click to view
  6. **Admin nav**: Add "Inbox" link to admin layout sidebar with unread count badge
  7. **TypeScript interface**: `types/interfaces/Message.ts`
- **Files**: Multiple new files + `server/api/contact/inquiry.post.ts` + admin layout
- **Agent**: `data-model-specialist` (schema/types), then `distillery-admin-builder` (page/components)
- **Complexity**: High

---

## Dependency Map

```
Phase 0 (all parallel)       Phase 1 (all parallel)      Phase 2           Phase 3
├─ 0A: Barrel click        ├─ 1A: Maceration recipe    ├─ 2A: Pagination  ├─ 3A: Inbox
├─ 0B: Hide barreled       ├─ 1B: Items filtering      │                  │
└─ 0C: Newsletter fix      │                            │                  │
```

All phases are independent. Within each phase, items are independent and can run in parallel.

---

## Effort Summary

| Item | Description | Complexity | Schema Change | Key Files |
|------|------------|-----------|---------------|-----------|
| 0A | Barrel click-to-batch | Low | No | `BarrelCard.vue` |
| 0B | Hide barreled batches | Low | No | `TableBatches.vue` |
| 0C | Newsletter → customers | Low | No | `subscribe.post.ts` |
| 1A | Maceration recipe display | Medium | No | `BatchMaceration.vue` |
| 1B | Items category filtering | Low-Med | No | `TableItems.vue` |
| 2A | Pagination bug | Medium | No | `TableWrapper.vue`, `useTableHelpers.ts` |
| 3A | Admin inbox | High | Yes | New files + `inquiry.post.ts` |

## Agent Assignments

| Agent | Items |
|-------|-------|
| `distillery-admin-builder` | 0A, 0B, 1A, 1B, 3A (page/components) |
| `nuxt-server-specialist` | 0C |
| `pro-debugger` | 2A |
| `data-model-specialist` | 3A (schema/model) |

---

## Status — ALL COMPLETE (2026-02-27)

- [x] Phase 0: Quick Fixes
  - [x] 0A: Barrel click-to-batch — added click handler + cursor-pointer to BarrelCard.vue
  - [x] 0B: Hide barreled batches — filtered from TableBatches.vue tableData
  - [x] 0C: Newsletter → customers — added `type: 'Customer'` to subscribe.post.ts update
- [x] Phase 1: Component Enhancements
  - [x] 1A: Maceration recipe display — scaled ingredients section added to BatchMaceration.vue
  - [x] 1B: Items category filtering — pill tabs with counts added to TableItems.vue
- [x] Phase 2: Bug Investigation
  - [x] 2A: Table pagination — fixed UPagination prop names (`:page`/`@update:page` instead of `:model-value`/`@update:model-value`)
- [x] Phase 3: New Feature
  - [x] 3A: Admin inbox — full Message model (5-layer sync), inbox page, sidebar link with badge
