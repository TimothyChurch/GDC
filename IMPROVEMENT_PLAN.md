# GDC App Improvement Plan

> Full-stack audit of the Galveston Distilling Co application covering performance, efficiency, code reuse, data flow, and UX. Organized by priority with specific file references.

---

## Phase 1: Critical Performance Fixes

### 1.1 Create Lean Public API Endpoints
**Problem:** Public pages load full Pinia stores with ALL records including admin-only data (purchaseHistory, inventoryHistory, reorderPoints). The `useItemStore` is loaded on every public page but never used by visitors.

**Files affected:**
- `layouts/default.vue` (lines 3-8) — loads bottle, cocktail, AND item stores
- `server/api/bottle/index.get.ts` — returns all fields
- `server/api/cocktail/index.get.ts` — returns all fields

**Fix:**
- Create `/api/bottle/public.get.ts` returning only `{ _id, name, class, type, abv, price, img, description, inStock }`
- Create `/api/cocktail/public.get.ts` returning only public-facing fields with ingredient names resolved server-side
- Remove `useItemStore().ensureLoaded()` from `layouts/default.vue`
- Create lightweight `usePublicBottleStore` and `usePublicCocktailStore` for the public layout

### 1.2 Add Server-Side Caching on Public Endpoints
**Problem:** Zero API routes use caching. Public data (bottles, cocktails) rarely changes but is re-fetched on every page load.

**Files affected:** All `server/api/*/index.get.ts`

**Fix:**
- Use `defineCachedEventHandler` on public read endpoints (bottles, cocktails, upcoming events)
- Add ISR/SWR route rules in `nuxt.config.ts`:
  ```ts
  routeRules: {
    '/api/bottle/public': { swr: 300 },
    '/api/cocktail/public': { swr: 300 },
    '/api/event/upcoming': { swr: 60 },
  }
  ```

### 1.3 Add Pagination to Inventory API
**Problem:** `Inventory.find({}).lean()` returns every inventory record ever created. With daily counts across dozens of items, this grows unbounded.

**Files affected:**
- `server/api/inventory/index.get.ts`
- `stores/useInventoryStore.ts` (line 22)

**Fix:**
- Add server-side pagination with `?limit=&skip=` or date range filter
- Default to loading only recent records (last 90 days)
- Add compound MongoDB index `{ item: 1, date: -1 }` to `server/models/inventory.schema.ts`

### 1.4 Fix SSR Empty Sections on Homepage
**Problem:** `SiteFeaturedSpirits` and `SiteFeaturedCocktails` render nothing during SSR because they populate data in `onMounted`. Search engines see empty sections.

**Files affected:**
- `components/Site/SiteFeaturedSpirits.vue` (lines 6-9)
- `components/Site/SiteFeaturedCocktails.vue` (lines 7-9)

**Fix:** Move initialization to setup context with `useState` or seeded random so featured items appear in initial HTML.

### 1.5 Fix Store Error Re-throw Inconsistency
**Problem:** 7 stores swallow errors silently, breaking `useFormPanel`'s close-on-error behavior. The panel closes even when save fails.

**Stores that swallow errors (need `throw` added):**
| Store | File |
|-------|------|
| useBatchStore | `stores/useBatchStore.ts` (lines 108-112) |
| useContactStore | `stores/useContactStore.ts` (lines 68-70) |
| useCocktailStore | `stores/useCocktailStore.ts` (lines 79-81) |
| useEventStore | `stores/useEventStore.ts` (lines 66-68) |
| useRecipeStore | `stores/useRecipeStore.ts` (lines 68-70) |
| useProductionStore | `stores/useProductionStore.ts` (lines 93-95) |
| useUserStore | `stores/useUserStore.ts` (lines 85-87) |

**Fix:** Add `throw error;` after toast in each catch block.

---

## Phase 2: High-Impact Component Extraction

### 2.1 Extract `useCrudStore()` Factory Composable
**Problem:** All 13 stores follow an identical pattern (~70 lines each): loading/saving refs, ensureLoaded, CRUD actions with toast/error handling, reset, getById. ~1000+ lines of duplicated code.

**All store files affected:**
- `stores/useBottleStore.ts`, `useContactStore.ts`, `useItemStore.ts`, `useRecipeStore.ts`, `useCocktailStore.ts`, `useVesselStore.ts`, `useEventStore.ts`, `useBatchStore.ts`, `useProductionStore.ts`, `usePurchaseOrderStore.ts`, `useInventoryStore.ts`, `useUserStore.ts`, `useSettingsStore.ts`

**Fix:** Create `composables/useCrudStore.ts`:
```ts
function useCrudStore<T>(name: string, apiPath: string, defaultItem: () => T) {
  // Returns: items, item, loading, saving, loaded,
  //          ensureLoaded, getAll, getById, setItem, updateItem, deleteItem, resetItem
}
```
Each store then only defines its custom computeds, actions, and domain-specific logic on top of the base.

### 2.2 Extract API Handler Factories
**Problem:** 40+ API handlers follow identical patterns (GET all, POST create, PUT update, DELETE with reference checking). ~400+ lines of duplicated boilerplate.

**Files affected:** Every file in `server/api/*/`

**Fix:** Create utilities in `server/utils/`:
- `createGetAllHandler(Model, selectFields?)` — standard list endpoint
- `createGetByIdHandler(Model)` — single record fetch
- `createCreateHandler(Model, schema?)` — create with validation
- `createUpdateHandler(Model, schema?)` — update with validation
- `createDeleteHandler(Model, referenceChecks?)` — delete with reference checking

Example: `server/api/event/upcoming.get.ts` is already well-optimized and can serve as the model.

### 2.3 Extract Sortable Column Header Helper
**Problem:** The sortable table column header pattern is repeated 20+ times across 11 table components with identical code.

**Files affected:** All `components/Table/Table*.vue`

**Fix:** Create `composables/useTableHelpers.ts`:
```ts
function createSortableColumn(label: string, accessorKey: string, options?): TableColumn {
  // Returns column with sort button header, toggle sorting onClick
}
function createActionsColumn(actions: ActionDef[]): TableColumn {
  // Returns standard actions dropdown column
}
function useTableState(data: Ref<any[]>) {
  // Returns: search, pagination, tableRef, filteredTotal
}
```

### 2.4 Centralize All Dropdown Option Lists
**Problem:** Hardcoded option arrays are duplicated across form components instead of using centralized definitions.

| Options | Duplicated In | Should Live In |
|---------|---------------|----------------|
| Glassware | `FormCocktail.vue` (lines 39-46) | `useCocktailOptions.ts` (already exists, not used) |
| Menu options | `FormCocktail.vue` (line 47) | `useCocktailOptions.ts` (already exists, not used) |
| Ingredient units | `FormCocktail.vue` (line 49) | `useCocktailOptions.ts` (already exists, not used) |
| Barrel sizes | `FormVessel.vue` (lines 14-20) | `definitions.ts` or new `useVesselOptions.ts` |
| Char levels | `FormVessel.vue` (line 22) | `definitions.ts` or new `useVesselOptions.ts` |
| PO statuses | `FormPurchaseOrder.vue` (lines 59-65) | `definitions.ts` as `PO_STATUS_OPTIONS` |
| Contact types | `FormContact.vue` (lines 17-24) | `definitions.ts` as `CONTACT_TYPES` |

**Fix:** Consolidate all into `composables/definitions.ts` (expand existing file) or create per-domain option composables. Update form components to import from central source.

### 2.5 Extract `FormQuantityWithUnit` Component
**Problem:** The "number input + unit selector" pattern is repeated in 4+ forms with inconsistent markup.

**Files affected:**
- `components/Form/FormBatch.vue` (lines 72-82)
- `components/Form/FormVessel.vue` (lines 45-59)
- `components/Form/FormRecipe.vue` (lines 64-70)
- `components/Form/FormPurchaseOrder.vue` (lines 179-184)

**Fix:** Create `components/Base/BaseQuantityInput.vue` accepting `v-model:value`, `v-model:unit`, `unitOptions`, and `label`.

---

## Phase 3: Performance Optimization

### 3.1 Lazy Load Below-Fold Homepage Components
**Problem:** All 6 homepage sections load eagerly even though only the hero is above the fold.

**File:** `pages/index.vue` (lines 14-19)

**Fix:**
```vue
<SiteHero />                                          <!-- keep eager -->
<LazySiteCategories hydrate-on-visible />
<LazySiteFeaturedSpirits hydrate-on-visible />
<LazySiteFeaturedCocktails hydrate-on-visible />
<LazySiteVisitCTA hydrate-on-visible />
<LazySiteNewsletter hydrate-on-idle />
```

### 3.2 Replace Raw `<img>` Tags with `<NuxtImg>`
**Problem:** 13 raw `<img>` tags without optimization, missing width/height (causes CLS).

| File | Line | Image |
|------|------|-------|
| `pages/about.vue` | 52 | `/images/Logo.png` |
| `pages/events/index.vue` | 37, 60, 83, 106 | 4 event images |
| `components/Site/SiteHeader.vue` | 39, 60, 81 | Logo (3 instances) |
| `components/Site/SiteFooter.vue` | 8 | Logo |
| `components/Admin/AdminHeader.vue` | 24 | Logo |
| `components/Modal/ModalAge.vue` | 25 | Logo |
| `pages/bottles/[id].vue` | 99-103 | Product image |

**Fix:** Replace all with `<NuxtImg>` adding `width`, `height`, `format="webp"`, and `loading="lazy"`.

### 3.3 Move Chart.js from Global Plugin to Per-Component Import
**Problem:** Chart.js (~60KB gzipped) loads on every page via global plugin, including public pages that never use charts.

**File:** `plugins/chartjs.client.ts`

**Fix:** Remove the global plugin. Import and register Chart.js components locally inside chart components (`ChartAllBottlesInventory.vue`, `ChartBottleInventory.vue`, `ReportProductionChart.vue`).

### 3.4 Fix OG Image URLs
**Problem:** All `useSeoMeta` calls use relative OG image paths. OG spec requires absolute URLs.

**Files:** `pages/index.vue`, `pages/about.vue`, `pages/bottles/index.vue`, `pages/contact.vue`, `pages/events/index.vue`, `pages/menu/index.vue`, `pages/events/cocktailClass.vue`

**Fix:** Change to absolute URLs: `ogImage: 'https://galvestondistilling.com/images/og-home.jpg'`

### 3.5 Switch Static Meta to `useServerSeoMeta()`
**Problem:** Static pages use `useSeoMeta()` which runs on both server and client unnecessarily.

**Files:** All public pages with non-reactive meta (index, about, contact, events, privacy)

**Fix:** Replace `useSeoMeta()` with `useServerSeoMeta()` where meta values aren't reactive.

### 3.6 Replace `JSON.parse(JSON.stringify())` with `structuredClone()`
**Problem:** 25+ instances of the slow JSON clone pattern across stores and components.

**Fix:** Global find-and-replace `JSON.parse(JSON.stringify(x))` with `structuredClone(x)`.

### 3.7 Fix `latestPrice` O(n*m) Performance
**Problem:** `useItemStore.latestPrice` (lines 146-171) copies and sorts ALL purchase orders for every single item call.

**Fix:** Build a computed `Map<itemId, price>` cache once, look up by ID.

---

## Phase 4: Data Flow & Store Fixes

### 4.1 Fix `updateUser` Toast Bug
**Problem:** In `stores/useUserStore.ts` line 84, the toast checks `user.value._id` after mutation instead of the `isNew` variable captured earlier. Always shows "created" even for updates.

**Fix:** Use the `isNew` const captured at the beginning of the function.

### 4.2 Remove Unused `selectBottle` Method
**Problem:** `stores/useBottleStore.ts` line 165 — `selectBottle` creates a direct reference (mutation risk) instead of deep cloning. It's never called from any component.

**Fix:** Remove `selectBottle` entirely.

### 4.3 Add Missing `set` Methods to Stores
**Problem:** Some stores lack form population helpers, causing inconsistent panel opening patterns.

| Store | Missing Method | Current Workaround |
|-------|----------------|-------------------|
| useContactStore | `setContact(id)` | Direct JSON copy in table component |
| useEventStore | `setEvent(id)` | Direct JSON copy in table component |
| useProductionStore | `setProduction(id)` | Makes fresh API call |

**Fix:** Add `setX(id)` methods that deep-clone from the local array, matching the pattern in other stores.

### 4.4 Remove Unnecessary `JSON.stringify` on `$fetch` Bodies
**Problem:** 7 stores wrap `$fetch` body in `JSON.stringify()` which is redundant (Nuxt auto-serializes).

**Stores:** batch, cocktail, contact, event, item, purchaseOrder, recipe, user

**Fix:** Pass raw objects to `$fetch` body.

### 4.5 Fix Sequential `ensureLoaded` in Menu Page
**Problem:** `pages/menu/[_id].vue` (lines 8-10) awaits 3 stores sequentially instead of in parallel.

**Fix:** Wrap in `Promise.all()`.

### 4.6 Standardize Error Description Field
**Problem:** 3 stores use `error?.data?.statusMessage || error?.data?.message` while 10 use only `error?.data?.message`. Nuxt's `createError` puts messages in `statusMessage`.

**Fix:** Standardize all stores to check `statusMessage || message`.

### 4.7 Use `$fetch<Type>` Generic Instead of `as Type` Casts
**Problem:** Every store casts `$fetch` responses (e.g., `response as Batch[]`).

**Fix:** Use `$fetch<Batch[]>('/api/batch')` for proper generic typing.

### 4.8 Fix `useSidebarBadges` Duplicated Logic
**Problem:** `composables/useSidebarBadges.ts` reimplements low-stock computation and active batch filtering instead of using existing store computeds.

**Fix:** Use `batchStore.activeBatches.length` and `inventoryStore.getCurrentStock()`.

### 4.9 Fix `FormUser.vue` Bypassing Store
**Problem:** `components/Form/FormUser.vue` line 26 makes a direct `$fetch` call instead of using `useUserStore().updateUser()`. New users aren't reflected in the UI until reload.

**Fix:** Route through the user store.

---

## Phase 5: Admin UX Improvements

### 5.1 Add Yup Validation to All 13 Panel Forms
**Problem:** Zero client-side validation on any panel form. Users can submit completely empty forms. None use `UForm` with a `:schema` binding.

**All panel files affected:**
- `components/Panel/PanelBatch.vue` — no validation that recipe is selected
- `components/Panel/PanelBottle.vue` — no validation that name is filled
- `components/Panel/PanelRecipe.vue` — no validation on name, class, volume
- `components/Panel/PanelItem.vue` — no validation on name
- `components/Panel/PanelContact.vue` — no validation on name/email
- `components/Panel/PanelPurchaseOrder.vue` — no validation on vendor, date, items
- `components/Panel/PanelVessel.vue` — no validation on name, type
- `components/Panel/PanelCocktail.vue` — no validation on name
- `components/Panel/PanelEvent.vue` — no validation on date, contact
- `components/Panel/PanelUser.vue` — no validation on email/password
- `components/Panel/PanelInventory.vue` — no validation on date, quantity
- `components/Panel/PanelProduction.vue` — wizard gating only, no formal validation

**Fix:** Create Yup schemas for each entity and wrap panel form content in `<UForm :schema :state @submit>`.

### 5.2 Fix Mobile Card Search Filtering
**Problem:** Search filtering only works on desktop `UTable`. Mobile card views in Batches, Bottles, Items, Productions, and POs show ALL data regardless of search query.

**Fix:** Either share filtered data via a computed that both desktop and mobile views consume, or have `TableWrapper` provide filtered data as a slot prop.

### 5.3 Add Loading States to 4 Detail Pages
**Problem:** These detail pages show false "not found" if data hasn't loaded yet:
- `pages/admin/contacts/[_id].vue`
- `pages/admin/purchaseOrders/[_id].vue`
- `pages/admin/production/[_id].vue`
- `pages/admin/customers/[_id].vue`

**Fix:** Add `v-if="!store.loaded"` loading spinner matching the pattern in `batch/[_id].vue`, `bottles/[_id].vue`, etc.

### 5.4 Fix Table Rendering Bugs
**Problem A:** `TableRecipes.vue` expanded row (line 143-145) renders raw `[object Object]` for ingredients.
**Problem B:** `TableVessels.vue` "Current" column (line 60-62) renders `[object Object]` for the current object.

**Fix:** Add proper cell renderers that format the data (e.g., `"15 gal @ 80%"` for vessels, ingredient name + amount for recipes).

### 5.5 Make All Table Columns Sortable
**Problem:** Sorting is inconsistent. 3 tables have zero sortable columns.

| Table | Missing Sort |
|-------|-------------|
| TableRecipes | Name, Class, Type, Volume |
| TableCocktails | Name, Glassware, Cost, Price, Visible |
| TableUsers | Name, Email |
| TableBottles | Class/Type, ABV, Status |
| TableBatches | Size |
| TableProductions | Vessel, Bottle, Quantity, Costs |
| TableItems | Vendor, Price |

**Fix:** Apply the `createSortableColumn` helper (from Phase 2.3) to all text/numeric columns.

### 5.6 Add Row-Click Navigation to Missing Tables
**Problem:** Vessels, Users, and Events tables lack `@select` and cursor styling.

**Fix:** Add `@select="(e, row) => router.push(...)"` and `:ui="{ tr: 'cursor-pointer' }"`.

### 5.7 Add Confirmation to Vessel "Empty" Action
**Problem:** "Empty Vessel" in `TableVessels.vue` (line 98-100) and vessel detail page (line 247-255) runs immediately without confirmation. This is destructive.

**Fix:** Use `useDeleteConfirm` or similar confirmation pattern.

### 5.8 Fix Dashboard Quick Actions
**Problem:** Dashboard "New Batch" and "Record Production" buttons navigate to list pages instead of opening creation panels.

**File:** `components/Admin/AdminDashboard.vue` (lines 95-107)

**Fix:** Use `openQuickAdd()` pattern matching the sidebar quick-add buttons.

### 5.9 Fix Dashboard Low Inventory Threshold
**Problem:** Low inventory threshold is hardcoded to `10` instead of using each item's configured `reorderPoint`.

**File:** `components/Admin/AdminDashboard.vue` (line 58)

**Fix:** Compare against `item.reorderPoint` field.

---

## Phase 6: Code Cleanup & Polish

### 6.1 Remove Orphaned Form Components
**Problem:** 13 `Form*.vue` components in `components/Form/` are the old modal-based forms, now replaced by `Panel*.vue`. They are no longer referenced.

**Fix:** Verify no imports, then remove all `components/Form/Form*.vue` files.

### 6.2 Create Shared `EmptyState` Component
**Problem:** Empty states are inconsistent — tables show plain text, detail pages show rich styled states with icons and action buttons.

**Fix:** Create `components/Base/BaseEmptyState.vue` with icon, title, description, and optional action button. Use consistently in tables, mobile cards, and pages.

### 6.3 Fix `privacy.vue` Hydration Mismatch
**Problem:** `new Date()` in template produces different timestamps on server vs client.

**File:** `pages/privacy.vue` (line 19)

**Fix:** Hardcode the date string or compute server-side.

### 6.4 Fix `robots.txt` Sitemap Domain Mismatch
**Problem:** `public/robots.txt` references `galvestondistillingco.com` but the site uses `galvestondistilling.com`.

**Fix:** Update to match the correct domain.

### 6.5 Add Prerender Rules for Static Pages
**Fix:** Add to `nuxt.config.ts`:
```ts
routeRules: {
  '/': { prerender: true },
  '/about': { prerender: true },
  '/privacy': { prerender: true },
  '/contact': { prerender: true },
}
```

### 6.6 Audit and Remove Unused Icon Package
**Problem:** Both `@iconify-json/heroicons` and `@iconify-json/lucide` are installed. The codebase primarily uses lucide icons.

**Fix:** Audit heroicons usage. If minimal, switch those icons to lucide and remove the heroicons package.

### 6.7 Split Large Components
| Component | Lines | Action |
|-----------|-------|--------|
| `Panel/PanelProduction.vue` | 844 | Split form sections into subcomponents |
| `Batch/BatchBarrelAging.vue` | 832 | Extract sampling table and barrel info |
| `Report/ReportTABCMonthly.vue` | 552 | Extract calculation logic into composable |
| `Report/ReportComplianceDeadlines.vue` | 536 | Extract deadline data and timeline |
| `Batch/BatchAdvanceAction.vue` | 522 | Extract stage-specific logic |
| `pages/admin/settings.vue` | 560 | Split into Settings sections |
| `pages/admin/bottles/[_id].vue` | 529 | Extract inventory table and production history |

### 6.8 Add Compound MongoDB Indexes
- Inventory: `{ item: 1, date: -1 }` (for getCurrentStock sort-by-date pattern)
- Production: `{ bottle: 1, date: -1 }` (for getProductionsByBottle)

### 6.9 Type Safety Improvements
- Add index signature to `BatchStages` to eliminate 14 `as any` casts in `useBatchStore.ts`
- Replace `catch (error: any)` with `catch (error: unknown)` + type narrowing (28 instances)
- Fix `useProofingCalculator.ts` dead code branches (lines 76-78)

---

## Implementation Order

| Order | Phase | Estimated Impact | Scope |
|-------|-------|-----------------|-------|
| 1st | Phase 1 (1.1-1.5) | Critical perf + functional bugs | Server + stores |
| 2nd | Phase 5.1 | Form validation gap | All panels |
| 3rd | Phase 2 (2.1-2.5) | Major code reduction | New composables + refactor |
| 4th | Phase 3 (3.1-3.7) | Performance wins | Templates + config |
| 5th | Phase 4 (4.1-4.9) | Bug fixes + consistency | Stores |
| 6th | Phase 5 (5.2-5.9) | UX polish | Admin components |
| 7th | Phase 6 (6.1-6.9) | Cleanup + maintenance | Various |

---

## Quick Wins (Can Do Immediately)

These require minimal effort and no architectural changes:

1. Fix `robots.txt` domain (6.4) — 1 line change
2. Fix OG image URLs to absolute (3.4) — find-and-replace
3. Switch `useSeoMeta` to `useServerSeoMeta` on static pages (3.5)
4. Fix `updateUser` toast bug (4.1) — 1 line change
5. Remove unused `selectBottle` (4.2) — delete method
6. Remove `JSON.stringify` from `$fetch` bodies (4.4) — find-and-replace
7. Fix `privacy.vue` hydration mismatch (6.3) — hardcode date
8. Add `throw error` to 7 store catch blocks (1.5)
9. Replace `JSON.parse(JSON.stringify())` with `structuredClone()` (3.6)
10. Wrap menu page stores in `Promise.all()` (4.5)
