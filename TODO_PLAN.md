# TODO Plan — Cocktail Page Improvements

> Generated 2026-02-27 based on `TODOS.md` and full codebase exploration.

---

## Overview

9 TODO items focused on improving both the admin and guest-facing cocktail experience. Work spans the full stack: data model changes (new `preparation` field), admin UX enhancements (card links, search, ingredient management, dynamic option lists), and a new public-facing cocktail detail page.

---

## Phase 0: Data Model & Configuration (Prerequisites)

These changes must land first since multiple later features depend on them.

### 0A. Add `preparation` field to Cocktail model

**Problem:** No way to specify how a cocktail is prepared (stirred, shaken, etc.)
**Current state:** Field does not exist anywhere in the stack
**Changes needed:**
- `types/interfaces/Cocktail.ts` — Add `preparation?: string` to `Cocktail` interface
- `server/models/cocktail.schema.ts` — Add `preparation: { type: String, required: false }`
- `stores/useCocktailStore.ts` — Add `preparation: ''` to `resetCocktail()` defaults
- `components/Panel/PanelCocktail.vue` — Add preparation `USelect` with options: `["Stirred", "Shaken", "Dry Shaken", "Double Shaken", "Built in Glass"]`
- `pages/admin/cocktails/[_id].vue` — Display preparation in the info panel

**Agent:** `data-model-specialist`

### 0B. Make menu and glassware lists dynamic (editable)

**Problem:** Menu options (`main`, `seasonal`, `shots`, `off menu`) and glassware options (`Highball`, `Lowball`, `Martini`, `Mug`, `Shot glass`, `Glencairn`) are hardcoded arrays in `PanelCocktail.vue` lines 24-26. Users need to add/edit these.
**Current state:** Hardcoded `const` arrays only in `PanelCocktail.vue`
**Changes needed:**
- Create `composables/useCocktailOptions.ts` — centralized reactive store for glassware and menu options, persisted to localStorage with defaults matching current values. Expose `addGlassware(name)`, `removeGlassware(name)`, `addMenu(name)`, `removeMenu(name)`.
- Update `PanelCocktail.vue` — Replace hardcoded arrays with composable; add inline "manage" buttons that open small edit popovers (`UPopover` with list + add/remove)
- Update `pages/admin/cocktails/index.vue` — Menu tabs should read from the composable
- Update `pages/menu.vue` — Category filter should also reflect any custom menus

**Agent:** `distillery-admin-builder`

---

## Phase 1: Admin UX Improvements

All items in this phase are independent of each other and can run in parallel.

### 1A. Make admin cocktail cards clickable (link to detail page)

**Problem:** Cards in grid view don't navigate to the individual cocktail page when clicked
**Current state:** `CocktailCard.vue` has no click handler or router link. Only has a visibility toggle button. The table view already navigates on row click via `@select`.
**Changes needed:**
- `components/Cocktail/CocktailCard.vue` — Wrap card in `NuxtLink :to="/admin/cocktails/${cocktail._id}"` or add `@click="navigateTo(...)"`. Keep the visibility toggle button's `@click.stop` to prevent navigation when toggling.

**Agent:** `distillery-admin-builder`

### 1B. Add search bar and filters to admin cocktails page

**Problem:** Grid view (default) has no search capability. Table view has its own global filter but the page-level filters are only menu tabs.
**Current state:** `pages/admin/cocktails/index.vue` has menu category tabs and passes filtered cocktails to `CocktailCardGrid`. No text search, glassware filter, or visibility filter.
**Changes needed:**
- `pages/admin/cocktails/index.vue` — Add `UInput` search bar (name, description, ingredient name matching). Optionally add glassware dropdown and visibility toggle filter. The `filteredCocktails` computed should incorporate all active filters. Filters should apply to both grid and table views.

**Agent:** `distillery-admin-builder`

### 1C. Ingredient reordering (drag and drop)

**Problem:** Ingredients can't be rearranged — their order matters for printed recipe cards
**Current state:** `PanelCocktail.vue` renders ingredients in array order (`v-for`) with no reorder mechanism
**Changes needed:**
- Use HTML5 drag-and-drop (no new dependency needed — keep it simple with native drag events)
- `components/Panel/PanelCocktail.vue` — Add drag handles (grip icon) to each ingredient row. Make rows draggable. On drop, splice/reorder `localData.value.ingredients` array.
- Order is automatically preserved on save since MongoDB stores arrays in order

**Agent:** `distillery-admin-builder`

### 1D. Inline ingredient editing

**Problem:** To change an ingredient's quantity or unit, you must delete and re-add it
**Current state:** Each ingredient row in `PanelCocktail.vue` (lines 89-100) shows name, amount, unit as static text, and a delete button. No inline editing.
**Changes needed:**
- `components/Panel/PanelCocktail.vue` — Replace the static `<span>` for amount/unit with compact editable fields:
  - `UInput` (type="number", small) for amount, bound to `ingredient.amount`
  - `USelect` (small) for unit, bound to `ingredient.unit`
  - Keep the delete button
  - Changes are immediate (two-way bound to `localData.value.ingredients[index]`)

**Agent:** `distillery-admin-builder`

---

## Phase 2: Guest-Side Visibility Verification

### 2A. Hidden cocktails not shown to patrons

**Problem:** Hidden cocktails should not appear on the guest menu
**Current state:** `pages/menu.vue` line 63-65 already filters `c.visible !== false`. This appears to work correctly.
**Verification needed:** Confirm this works end-to-end — toggle a cocktail's visibility in admin and verify it disappears from the public menu.
**Likely already complete** — just needs verification.

**Agent:** `pro-debugger` (quick verification)

---

## Phase 3: Guest-Side Cocktail Detail Page

### 3A. Public individual cocktail page

**Problem:** No way for guests to click a cocktail card and see full details (photo, ingredients with volumes, directions, glassware, preparation)
**Current state:** No `pages/menu/[_id].vue` exists. `CardCocktail.vue` is not clickable (no `NuxtLink` or click handler).
**Changes needed:**
- Create `pages/menu/[_id].vue` — Individual cocktail detail page showing:
  - Photo (hero/large image if available)
  - Name, glassware, preparation method (from 0A)
  - Ingredients with amounts/units (NO costs — this is guest-facing)
  - Directions
  - Description
  - Back link to `/menu`
  - SEO meta tags (title, description, og:image)
- `components/Card/CardCocktail.vue` — Wrap in `NuxtLink :to="/menu/${cocktail._id}"` to make clickable
- Style consistent with public theme (cream/charcoal/gold, Cormorant Garamond headings)

**Agent:** `distillery-frontend-designer`

---

## Dependency Map

```
Phase 0 (Prerequisites — do first)
├── 0A: Add preparation field ────────────────┐
└── 0B: Dynamic menu/glassware lists ─────────┤
                                               │
Phase 1 (Admin UX — all parallel) ────────────┤
├── 1A: Card click navigation                 │
├── 1B: Search & filters (uses 0B for menus)  │
├── 1C: Ingredient drag-and-drop              │
└── 1D: Inline ingredient editing             │
                                               │
Phase 2 (Verification — independent)          │
└── 2A: Verify hidden cocktails ──────────────┤
                                               │
Phase 3 (Guest Detail — needs 0A)             │
└── 3A: Public cocktail page ─────────────────┘
```

---

## Effort Summary

| Item | Complexity | Schema Change | Key Files |
|------|-----------|---------------|-----------|
| 0A: Preparation field | Medium | YES | `Cocktail.ts`, `cocktail.schema.ts`, `useCocktailStore.ts`, `PanelCocktail.vue`, `[_id].vue` |
| 0B: Dynamic lists | Medium | No | New `useCocktailOptions.ts`, `PanelCocktail.vue`, `index.vue` |
| 1A: Card links | Low | No | `CocktailCard.vue` |
| 1B: Search/filters | Medium | No | `pages/admin/cocktails/index.vue` |
| 1C: Drag reorder | Medium | No | `PanelCocktail.vue` |
| 1D: Inline editing | Low | No | `PanelCocktail.vue` |
| 2A: Visibility check | Low | No | `pages/menu.vue` (verification only) |
| 3A: Guest detail page | High | No | New `pages/menu/[_id].vue`, `CardCocktail.vue` |

---

## Agent Assignments

| Agent | Items |
|-------|-------|
| `data-model-specialist` | 0A (preparation field — full 5-layer sync) |
| `distillery-admin-builder` | 0B, 1A, 1B, 1C, 1D |
| `pro-debugger` | 2A (verification) |
| `distillery-frontend-designer` | 3A (public cocktail page) |

---

## Status — ALL COMPLETE (2026-02-27)

- [x] Phase 0: Data Model & Configuration
  - [x] 0A: Preparation field — 5-layer sync complete
  - [x] 0B: Dynamic menu/glassware lists — composable + manage popovers
- [x] Phase 1: Admin UX
  - [x] 1A: Card click navigation — NuxtLink wrapper
  - [x] 1B: Search & filters — text search + visibility toggle
  - [x] 1C: Ingredient drag-and-drop — native HTML5 drag
  - [x] 1D: Inline ingredient editing — compact inputs
- [x] Phase 2: Guest Visibility
  - [x] 2A: Verify hidden cocktails — already working correctly
- [x] Phase 3: Guest Detail Page
  - [x] 3A: Public cocktail detail page — full detail with SEO
