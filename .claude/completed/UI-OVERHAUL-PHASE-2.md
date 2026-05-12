# UI Overhaul — Phase 2 Complete

**Date:** 2026-05-07
**Plan:** `PLAN-UI-OVERHAUL.md`

## Shipped

1. **`composables/useVesselBoard.ts`** — new composable. Joins each vessel with its primary batch (largest content slot), stage, recipe name, fill %, and an attention flag derived from `useAttentionFeed`. Filter state (`stageFilter`, `typeFilter`, `attentionOnly`) backed by `useState` so the composable is shareable across components without prop drilling. Exposes `entries`, `filtered`, `grouped` (by vessel type, ordered Mash Tun → Fermenter → Still → Tank → Barrel → Other), `stagesPresent`, `typesPresent`, and `counts`.

2. **`components/Vessel/VesselTile.vue`** — single tile UI. Stage-colored left border band (12 stage colors mapped via static lookup tables for Tailwind purging), stage badge with icon, fill bar (existing color logic from `VesselCard`), recipe-name button that jumps to batch detail (separate from tile click), Open-batch / Details primary action, "Attention" badge when the contained batch has an outstanding action item. Tile click → vessel detail page; recipe button + Open-batch button → batch detail.

3. **`components/Vessel/VesselBoardFilters.vue`** — chip-based filters: Type row (auto-narrowed to types actually present), Stage row (only stages currently in use), and a tone-coded "Needs attention" toggle with count badge. Reset-filters affordance shows only when filters are active. Right-aligned counts ("Showing 12 of 18 vessels · 9 in use").

4. **`components/Vessel/VesselBoard.vue`** — parent. Greeting header (Good morning/afternoon/evening), New Batch / Add Vessel / Dashboard quick actions, embedded `<DashboardActionItems :max-items="6" />` (compact, non-prominent — vessels are the lead), `<VesselBoardFilters />`, then grouped tile grid using `grouped` from the composable. Empty states for both no-vessels and no-matches.

5. **`pages/admin/index.vue`** — replaced the redirect-to-`/admin/dashboard` shim with `<VesselBoard />`. The old dashboard remains fully reachable at `/admin/dashboard`.

6. **`components/Admin/AdminSidebar.vue`** — first nav entry is now **Overview** (`i-lucide-layout-grid` → `/admin`); Dashboard demoted to second position. Fixed `isActive()` so an exact-match-only check is used for `/admin` (otherwise the prefix-match made it active on every admin route).

7. **`components/Admin/AdminBreadcrumbs.vue`** — root crumb changed from "Dashboard → /admin/dashboard" to "Overview → /admin". Removed the special-case skip of the `dashboard` segment so `/admin/dashboard` now renders as `Overview → Dashboard`.

## Naming decision

The plan offered "Vessels" or "Floor" as the new top item. Both had collisions:

- **Vessels** is already the existing list view at `/admin/vessels`.
- **Floor** is reserved for the Phase 4 mobile/tablet shop-floor route at `/floor`.

Settled on **Overview**. Distinct from both, accurately describes what the page is (vessel state at a glance plus attention items).

## Open question Q1 — vessel-tile click target

Plan recorded "Likely: vessel detail; batch is one click further. Revisit during Phase 2 build." Built it that way: tile click → vessel detail; the recipe-name button and the "Open batch" action button → batch detail. Two distinct affordances on the tile. Easy to flip later if usage suggests otherwise.

## Tests

- `npm run test` → 296/296 passing.
- Dev server compiles clean.
- `/admin`, `/admin/dashboard`, `/admin/vessels` all return 200.

## Surprising / discovered

- **Filter state had to move to `useState`**. Initial implementation used plain `ref`s in the composable; that meant `VesselBoardFilters` and `VesselBoard` each got their own copies because composables instantiate fresh refs on each call. `useState` keys (`vesselBoard:stageFilter`, etc.) make the state truly shared without props or a singleton store.
- **`isActive('/admin')` had to be special-cased.** The existing prefix match (`route.path.startsWith(to + '/')`) made every admin route satisfy the predicate when `to === '/admin'`. Now it requires exact equality for the admin root.
- **Stage color tables had to be static**, not template-string concatenations, so Tailwind v4 picks them up at build time. `STAGE_BAND` and `STAGE_PILL` lookup objects in `VesselTile.vue` mirror the `BG_COLOR_MAP` / `TEXT_COLOR_MAP` pattern in `composables/batchPipeline.ts`.

## Deferred

- **Drag-and-drop tile reordering** — out of scope for Phase 2; would belong to a future "personal floor layout" feature.
- **Search box on the board** — filter chips cover the common case. Add only if users ask.
- **"Attention" badge on tiles for non-batch issues** (e.g., calibration overdue, vessel cleaning due) — needs schema fields that don't exist. Revisit when those exist.
- **Spatial floor map** — already on roadmap as `PLAN-PIPELINE-REVAMP.md` Phase 8. The board built here is the conceptual precursor.

## Next phase

Phase 3 — Inline UX polish (2 days). Two-column transfer form, inline calculators, multi-step indicators with draft state, unified Move action.
