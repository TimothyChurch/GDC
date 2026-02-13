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
