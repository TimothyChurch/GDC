# GDC Components & Pages

142 components in 20 folders + 6 root orphans. 73 pages. Auto-imported via Nuxt.

## Component groups (20)

| Folder | Count | Purpose |
|---|---|---|
| `Admin/` | 7 | Header, Sidebar, Dashboard, Breadcrumbs, PageHeader, CommandPalette, ShortcutsHelp |
| `Barrel/` | 2 | BarrelCard, BarrelWarehouse |
| `Base/` | 3 | BaseEmptyState, BaseItemSelect, BaseQuantityInput (form primitives) |
| `Batch/` | 27 | Stage detail components + Kanban + Stepper + Pipeline Editor |
| `Bottle/` | 4 | BottleCard, BottleCardGrid, BottleInventorySection, BottleProductionHistory |
| `BulkSpirit/` | 1 | BulkSpiritLedger |
| `Card/` | 2 | CardBottle, CardCocktail (public-facing presentational) |
| `Cocktail/` | 2 | CocktailCard, CocktailCardGrid (admin) |
| `Dashboard/` | 13 (4 unused) | Dashboard widgets — see below |
| `Form/` | 1 | FormImageUpload (Cloudinary) |
| `Item/` | 3 (2 unused) | ItemInventory; ItemDetails + ItemPurchaseHistory unused |
| `Modal/` | 6 (1 unused) | ModalAge, ModalBarrelFill, ModalDistillingCharge, ModalLinkEvent, ModalMergeCustomers; ModalDeleteConfirm unused |
| `Panel/` | 14 | All slide-over edit forms (one per resource) — see below |
| `Production/` | 2 | ProductionWizard, ProductionCostBreakdown |
| `Recipe/` | 1 | RecipePipelineBuilder |
| `Report/` | 13 | One per `/admin/reports/*` page (TTB forms, TABC, costs, inventory, barrels) |
| `Settings/` | 4 | SettingsCategories, SettingsBarrelDefaults, SettingsTheme, SettingsDistillery |
| `Site/` | 11 (1 unused) | Public marketing components — SiteHero, SiteHeader, SiteFooter, etc. |
| `Table/` | 18 (3 unused) | TableWrapper + 17 entity tables — see below |
| `Vessel/` | 2 | VesselCard, VesselGrid |

## Key patterns

### Panel pattern (all 14 used)

Each resource has a `Panel/Panel{Resource}.vue` slide-over form, opened imperatively:

```vue
<script setup>
const overlay = useOverlay()
const open = () => overlay.create(LazyPanelBatch).open({ batchId })
</script>
```

All Panels use `useFormPanel()` for save/cancel/submit. Lazy-imported (`LazyPanel*`) for code-splitting.

### Table pattern (all 15 active tables)

`Table/TableWrapper.vue` is the base — wraps Nuxt UI's UTable with search, pagination, loading state. Per-resource tables (`TableBatches.vue`, `TableBottles.vue`, etc.) supply column defs and row actions. Use `useTableHelpers.ts` for shared column types.

### Card grid pattern

Public-facing: `Card/CardBottle.vue`, `Card/CardCocktail.vue` (presentational).
Admin: `Bottle/BottleCard.vue`, `Cocktail/CocktailCard.vue` (with edit actions).
Card grids: `Bottle/BottleCardGrid.vue`, `Cocktail/CocktailCardGrid.vue`.

### Dashboard widgets

Used in `Admin/AdminDashboard.vue`:
- DashboardStatCard (×5 — KPI cards)
- DashboardBatchPipeline, DashboardActionItems, DashboardRecentProductions, DashboardVesselOverview, DashboardLowInventory, DashboardRevenue, DashboardBottleInventoryQuick

**Unused** (4): DashboardBrewing, DashboardDistilling, DashboardFermenters, DashboardUpcoming — appear to be UI prototypes/replaced widgets.

## Root-level component orphans (6)

| File | Status | Recommendation |
|---|---|---|
| `ChartAllBottlesInventory.vue` | Unused | Delete — see tech-debt |
| `ChartBottleInventory.vue` | Unused | Delete |
| `DatePicker.vue` | Used (via `Site/SiteDatePicker.vue`) | Move to `Base/` or `Site/` |
| `LandingProducts.vue` | Unused | Delete (looks like Tailwind UI demo) |
| `ModalCalculators.vue` | Used (1×) | Move to `Modal/` |
| `Proofing.vue` | Used (1×) | Move to `Production/` or new `Calculator/` |

## Pages (73)

### Public (10)
- `index.vue` (Home), `about.vue`, `privacy.vue`, `contact.vue`, `login.vue`, `return.vue`
- `bottles.vue` (parent) + `bottles/index.vue` + `bottles/[id].vue`
- `events.vue` (parent) + `events/index.vue` + `events/classes/[id].vue` + `events/cocktailClass.vue`
- `menu.vue` (parent) + `menu/index.vue` + `menu/[_id].vue`

`pages/{bottles,events,menu}.vue` are layout-only pass-throughs (`<NuxtPage />`).

### Admin (62)

Pattern: each resource has `index.vue` (list) + `[_id].vue` (detail).

- **Root**: `admin.vue` (parent), `admin/index.vue` (redirect), `admin/dashboard.vue`, `admin/controls.vue`, `admin/proofing.vue`, `admin/users.vue`, `admin/settings.vue`, `admin/barrels.vue`, `admin/bulk-spirits.vue`
- **Resources**: `batch/`, `bottles/` (+ `inventory.vue`), `cocktails/` (+ `grid.vue`), `contacts/`, `customers/`, `events/`, `inbox/`, `items/`, `production/`, `purchaseOrders/`, `recipes/`, `vessels/`
- **Inventory**: `inventory/index.vue`, `inventory/[slug].vue` (catch-all for any category), plus 5 hardcoded category pages (bar-supplies, botanicals, bottling, ingredients, other) ⚠️ duplicates [slug].vue
- **Reports**: 11 pages — barrels, costs, inventory, production, ttb-{production,processing,storage,excise-tax}, tabc-{monthly,excise-tax}, compliance-calendar
- **Inventory utility pages**: `input.vue`, `print.vue`, `shopping-list.vue`

## Layouts (2)

- `layouts/admin.vue` — `AdminHeader` + `AdminSidebar` + `AdminBreadcrumbs` + `<slot />`
- `layouts/default.vue` — `SiteHeader` + `<slot />` + `SiteFooter` + `ModalAge`

## Middleware (1)

- `middleware/auth.ts` — Client-side guard; checks auth state via `useAuth().fetchUser()`; redirects to `/login` if unauth on `/admin/**`

## Plugins (0)

The `plugins/` directory is empty. CLAUDE.md mentions a `plugins/chartjs.ts` but it doesn't exist — chart registration lives in `composables/useChartRegistration.ts` instead. Update CLAUDE.md.

## App entry

- `app.vue` — UApp wrapper + NuxtPage + ModalAge mount
- `error.vue` — top-level error page (404, 500 handling)

## Component-page wiring quick map

| Page | Key components |
|---|---|
| `pages/index.vue` | SiteHero, LazySiteCategories, LazySiteFeaturedSpirits, LazySiteFeaturedCocktails, LazySiteVisitCTA, LazySiteNewsletter |
| `pages/admin/dashboard.vue` | AdminDashboard (which renders all dashboard widgets) |
| `pages/admin/batch/[_id].vue` | LazyPanelBatch + Batch/* stage components + ModalBarrelFill, ModalDistillingCharge |
| `pages/admin/items/[_id].vue` | LazyPanelItem, LazyPanelInventory |
| `pages/admin/customers/[_id].vue` | LazyPanelContact, LazyModalLinkEvent, LazyModalMergeCustomers |
| `pages/admin/vessels/index.vue` | VesselGrid + LazyPanelVessel + LazyPanelVesselTransfer |
| `pages/admin/reports/*` | One Report* component per page |
| `pages/admin/settings.vue` | UTabs with 4 Settings* components |
