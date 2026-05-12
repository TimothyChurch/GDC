# UI Overhaul — Phase 1 Complete

**Date:** 2026-05-07
**Plan:** `PLAN-UI-OVERHAUL.md`

## Shipped

1. **`composables/useAttentionFeed.ts`** — new composable. Sources action items from compliance deadlines (TTB/TABC overdue/critical/warning), fermentation gravity readings (overdue/missing), upcoming batches ready to start, and inventory items below reorder point. Sorted by priority.

2. **`components/Dashboard/DashboardActionItems.vue`** — refactored to use the composable. Added `prominent` and `maxItems` props for hero placement.

3. **`components/Admin/AdminDashboard.vue`** — promoted `<DashboardActionItems prominent :max-items="20" />` above the KPI tile row. KPI tiles now read as secondary context. Removed the duplicate ActionItems rendering from the 2-column grid.

4. **`components/Bottle/BottleCard.vue`** — grid card stock badge now shows `"47 in stock"` instead of just `"In Stock"`. Falls back to `"In Stock"` when no inventory records exist for the bottle. `"Out of Stock"` retained when `bottle.inStock === false`.

5. **`components/Modal/ModalDeleteConfirm.vue`** + **`composables/useDeleteConfirm.ts`** — modal now accepts `verb` and `warningText` props. `useDeleteConfirm.confirm()` accepts an optional 3rd `options` param.

6. **`components/Table/TableVessels.vue`** + **`pages/admin/vessels/[_id].vue`** — Empty Vessel actions now use `verb: 'Empty'` with custom warning text ("Contents will be cleared. This does not delete the vessel."), eliminating the misleading "Delete vessel?" copy.

7. **`components/Admin/AdminSidebar.vue`** — collapsed quick-add buttons now render each action's actual icon (flask-conical, factory, receipt) wrapped in `UTooltip` for the label. Reports nav link now shows a tone-coded badge (red overdue / orange critical / yellow warning) reflecting the worst urgency in `useComplianceDeadlines`. New `badgeTone` field on `NavLink` interface, `badgeToneClasses()` helper.

8. **`components/Table/TableRecipes.vue`** + **`pages/admin/recipes/[_id].vue`** — Recipe delete confirmation now counts active and historical batches using the recipe and surfaces them in the warning text.

9. **`components/Report/ReportLastSync.vue`** — new component. Pulse-dot live indicator + "Live data — loaded {date} at {time}" string. Added to all 11 report pages (ttb-production/processing/storage/excise-tax, tabc-monthly/excise-tax, barrels, costs, inventory, production, compliance-calendar) immediately below `<AdminPageHeader>`.

10. **`components/Table/TableWrapper.vue`** — added range label ("`21–30 of 150`") next to `UPagination`. Hidden on mobile to preserve space.

## Surprising / discovered

- **`pages/admin/index.vue` is just a redirect** to `/admin/dashboard`. The plan referenced `pages/admin/index.vue`; corrected — actual dashboard is `pages/admin/dashboard.vue` rendering `<AdminDashboard />` from `components/Admin/AdminDashboard.vue`.
- **`DashboardActionItems.vue` already existed**, with three of the five planned data sources. Refactored in place + extended via the composable rather than creating a duplicate `DashboardAttentionFeed.vue`.
- **`useDeleteConfirm`'s modal hardcoded "Delete"** — affected vessel "Empty" action. Generalizing the verb is small-footprint and benefits future cases.
- **Sampling-overdue action items deferred** — the plan listed this as a source, but barrel records don't have a `lastSampled` timestamp. Revisit when that field is added (or when the Transfer ledger surfaces sample transfers).

## Tests

- `npm run test` → 260/260 passing.
- Dev server compiles clean (only pre-existing Square BigInt warnings unrelated to this phase).
- `/admin/dashboard` and `/admin/bottles` both return 200 in dev.

## Deferred to later phases

- **Tone-coded badges** for non-compliance sidebar links (low inventory red/orange) — could come for free if we propagate `badgeTone` further. Phase 2/3 polish.
- **Sampling-overdue attention items** — needs schema for `lastSampled` on barrels.
- **"Batches awaiting next stage" attention items** — needs heuristic for when a stage is "complete" (e.g., gravity stable). Defer until Phase 3 reworks distilling/run forms.

## Next phase

Phase 2 — Vessel-first IA (VesselBoard). 2 days. Open question to decide at kickoff: clicking a vessel tile → vessel detail or contained batch detail?
