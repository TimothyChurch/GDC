# GDC Individual Batch Page — Implementation Plan

> Generated 2026-02-25 based on updated `TODOS.md` and full codebase exploration.

---

## Overview

The TODO focuses on enhancing the Individual Batch Page so that each pipeline stage produces a detailed, purpose-built card. Most stage components already exist (`components/Batch/Batch*.vue`) — the work is about filling gaps, improving data display, and adding missing functionality per stage.

**Key structural change**: Cards currently render in pipeline order (earliest first). The TODO requires **reverse ordering** — newest stage cards appear first, with the pipeline stepper and overview (header/ingredients) always on top.

---

## Phase 0: Layout & Card Ordering

_Structural change that affects all stage cards. Do this first._

### 0.1 Reverse Stage Card Order on Batch Detail Page

**Problem**: Stage cards currently render top-to-bottom in pipeline order. TODO says "each of these cards will need to place above the previous" — meaning the most recent stage should appear first after the overview section.

**File**: `pages/admin/batch/[_id].vue` (line 248)

**Change**: Reverse the `v-for` iteration so reached stages render newest-first:
```
- v-for="stage in batch.pipeline"
+ v-for="stage in [...batch.pipeline].filter(s => hasReached(s)).reverse()"
```

The pipeline stepper, header, and ingredients card stay pinned at top. Per-stage advance actions move to within or directly below each stage card rather than clustered at the bottom.

**Agent**: `distillery-admin-builder`

---

## Phase 1: Stage Card Enhancements (Minor Gaps)

_These stages mostly work already. Each item fills a small gap._

### 1.1 Mashing — Confirm as Ingredient Card

**Current state**: `BatchMashing.vue` is a full mashing card (strike water, temps, pH, gravities). The ingredients card is a separate section in `[_id].vue` (lines 182-225).

**Change needed**: The TODO says "This can be the ingredient card currently on the page." This may mean consolidating the ingredients display into the Mashing card, or simply confirming the current layout is acceptable. If consolidation is desired:
- Move the scaled ingredients section into `BatchMashing.vue` (pass `scaledIngredients` as a prop)
- Remove the standalone ingredients section from the page

**Agent**: `distillery-admin-builder`

---

### 1.2 Fermenting — Add Percentage Done to Readings

**Current state**: `BatchFermenting.vue` already has:
- Yeast strain, pitch temp, OG/FG, estimated ABV ✓
- Readings array with date, gravity, chart ✓

**Gaps**:
1. **Adjustable start date** for yeast pitch — check if `startedAt` field is editable (from `BatchStageBase`). If not, add a date picker.
2. **Percentage done vs initial potential** — readings list needs a column showing `((OG - currentGravity) / (OG - targetFG)) * 100` or similar attenuation percentage.
3. **Current ABV per reading** — each reading should display its calculated ABV: `(OG - readingGravity) * 131.25`.

**Files**: `components/Batch/BatchFermenting.vue`

**Agent**: `distillery-admin-builder`

---

### 1.3 Distilling — Add Disposal Flag to Cuts

**Current state**: `BatchDistillingRun.vue` has full cuts support (foreshots, heads, late heads, hearts, tails) each with volume, unit, ABV, and vessel selector ✓.

**Gap**: Add a **"disposed" checkbox** per cut line for records (e.g., foreshots dumped instead of kept). This tracks that the cut was intentionally discarded rather than stored.

**Files**:
- `types/interfaces/Batch.ts` — add `disposed?: boolean` to each cut in `DistillingCollected`
- `server/models/batch.schema.ts` — add `disposed` field to collected cut subdocs
- `components/Batch/BatchDistillingRun.vue` — add checkbox per cut row

Also verify: when "finishing and selecting to move volume to storage," each cut's volume moves to its assigned vessel. This should already work via the advance action but needs confirmation.

**Agent**: `distillery-admin-builder` + `data-model-specialist` (for schema sync)

---

### 1.4 Maceration — Auto-Populate Duration from Recipe

**Current state**: `BatchMaceration.vue` has start/end date, duration, method, botanicals ✓.

**Gap**: The TODO says "desired number of days needed for maceration that will be pulled from the recipe but is editable." Check if `Recipe` has a maceration duration field. If not:
- Add `macerationDays?: number` to Recipe interface and schema
- Auto-populate `duration` in `BatchMaceration.vue` from `recipe.macerationDays` when entering the stage
- Keep it editable

**Files**:
- `types/interfaces/Recipe.ts` — potentially add `macerationDays`
- `server/models/recipe.schema.ts` — add field
- `components/Batch/BatchMaceration.vue` — auto-populate logic

**Agent**: `distillery-admin-builder`

---

### 1.5 Filtering — Auto-Update Vessel on Save

**Current state**: `BatchFiltering.vue` has pre/post volume and ABV with loss calculation ✓.

**Gap**: "This will update the info for the vessel." When filtering data is saved, the vessel's `current.volume` and `current.abv` should be updated to match the post-filtering values.

**Files**:
- `components/Batch/BatchFiltering.vue` — on save, also call `vesselStore` to update the vessel's current volume/ABV
- `stores/useVesselStore.ts` — may need an `updateVesselContents()` helper

**Agent**: `distillery-admin-builder`

---

## Phase 2: Stage Card Enhancements (Significant Work)

_These stages need more substantial changes._

### 2.1 Storage — Integrate Vessel Board + ABV Display

**Current state**: `BatchStorage.vue` is a simple card with volume/unit/ABV/notes. The TODO wants it to be "the current vessels board with the addition of the info shown on the vessels page" with ABV visible on cards.

**Changes**:
1. Show all vessels containing this batch's storage volume using `VesselCard.vue` components (or a mini vessel grid)
2. Ensure ABV is prominently displayed on both the vessel cards and the storage summary
3. Pull in vessel details (name, type, capacity, fill level) — not just volume/ABV

**Files**:
- `components/Batch/BatchStorage.vue` — major rework to embed vessel cards
- `components/Vessel/VesselCard.vue` — ensure ABV is displayed (may already be)
- May need to pass `containingVessels` (filtered by this batch) as context

**Agent**: `distillery-admin-builder`

---

### 2.2 Barrel Aging — Add Tasting Notes Side-by-Side

**Current state**: `BatchBarrelAging.vue` is a comprehensive card. `BatchTastingNotes.vue` exists as a separate component rendered below all stage cards.

**Changes**:
1. Display the barrel's vessel card alongside a tasting notes panel — two-column layout
2. Move/duplicate tasting notes display into the barrel aging card area (most recent on top)
3. Keep the global `BatchTastingNotes` at the bottom for all-stage notes, but barrel aging gets its own inline tasting notes section

**Files**:
- `components/Batch/BatchBarrelAging.vue` — add tasting notes section or two-column layout
- Consider whether to embed `BatchTastingNotes` or create a filtered view

**Agent**: `distillery-admin-builder`

---

### 2.3 Proofing — Wire Up Full Proofing Calculator

**Current state**: `BatchProofing.vue` has basic fields (start/target ABV, water added, final volume). The `useProofingCalculator` composable exists but is NOT used in the proofing card — the card has its own simpler inline formula.

**Changes**:
1. Integrate `useProofingCalculator` composable into the proofing card for full calculation support
2. Auto-populate default inputs from the vessel's current volume and ABV
3. Keep all inputs editable (user may override vessel defaults)
4. Show step-by-step water addition tracking (the composable supports `steps[]`)

**Files**:
- `components/Batch/BatchProofing.vue` — wire up `useProofingCalculator`
- `composables/useProofingCalculator.ts` — ensure it's compatible with the card's data flow

**Agent**: `distillery-admin-builder`

---

### 2.4 Bottling — Add Cost Summary & Sales Value

**Current state**: `BatchBottled.vue` shows linked production record, bottle count, and has a button to create/link production.

**Changes**:
1. Display: bottle count, cost per bottle, total cost (from production record)
2. Add **total potential sales value**: `bottleCount * bottle.price` (pull retail price from the Bottle record)
3. Show profit margin: `salesValue - totalCost`

**Files**:
- `components/Batch/BatchBottled.vue` — add sales value calculation
- `stores/useBottleStore.ts` — need to look up bottle price by ID
- `types/interfaces/Bottle.ts` — confirm `price` field exists

**Agent**: `distillery-admin-builder`

---

### 2.5 Blending — Create New "Mixed" Batch

**Current state**: `BatchBlending.vue` has components with source/volume/unit/ABV and result calculation ✓. Notes field exists.

**Gap**: "The newly blended volume will then become its own batch with the wording mixed added before its class, ie Mixed Whiskey." This is a significant new feature:

1. Add a "Create Blended Batch" action button
2. On click: create a new batch with:
   - Recipe class prefixed with "Mixed" (e.g., "Mixed Whiskey")
   - Volume = result volume from blending
   - ABV = weighted average ABV
   - Link back to source batches in notes/log
3. The new batch starts at the next pipeline stage after Blending
4. Source batch blending stage gets marked complete

**Files**:
- `components/Batch/BatchBlending.vue` — add create batch action
- `stores/useBatchStore.ts` — add `createBlendedBatch()` action or adapt `advanceToStage`
- Consider: does the blended batch get its own recipe, or a copy with "Mixed" prefix?

**Agent**: `distillery-admin-builder`

---

## Phase 3: Cross-Cutting Concerns

### 3.1 Per-Stage Advance Actions (Move from Bottom)

Currently all advance action buttons are clustered at the bottom of the page. With reversed card order, it makes more sense to place each stage's advance button within or directly below its card.

**Files**:
- `pages/admin/batch/[_id].vue` — move `BatchAdvanceAction` into each stage card's section
- `components/Batch/Batch*.vue` — optionally accept an `advancable` prop and render the advance button

**Agent**: `distillery-admin-builder`

---

### 3.2 Vessel ABV Display Consistency

The TODO mentions ABV should appear on "both the cards on the vessels page as well as the cards shown on the batch page." Audit `VesselCard.vue` and all vessel references to ensure ABV is always visible.

**Files**:
- `components/Vessel/VesselCard.vue` — confirm ABV badge is shown
- `components/Batch/BatchStorage.vue` — ABV on storage vessel cards
- `components/Batch/BatchBarrelAging.vue` — ABV on barrel vessel card

**Agent**: `distillery-admin-builder`

---

## Dependency Map

```
Phase 0: Layout Change (do first)
└── 0.1 Reverse card order

Phase 1: Minor Gaps (parallel, no dependencies)
├── 1.1 Mashing — ingredient card consolidation
├── 1.2 Fermenting — % done, per-reading ABV
├── 1.3 Distilling — disposal flag
├── 1.4 Maceration — recipe duration auto-populate
└── 1.5 Filtering — vessel auto-update

Phase 2: Significant Work (parallel, after Phase 0)
├── 2.1 Storage — vessel board integration
├── 2.2 Barrel Aging — tasting notes layout
├── 2.3 Proofing — calculator integration
├── 2.4 Bottling — cost + sales value
└── 2.5 Blending — create Mixed batch

Phase 3: Cross-Cutting (after Phases 1-2)
├── 3.1 Move advance actions into stage cards
└── 3.2 ABV display audit
```

---

## Effort Summary

| Item | Complexity | Schema Change | Key Files |
|------|-----------|---------------|-----------|
| 0.1 Reverse card order | Low | No | `[_id].vue` |
| 1.1 Mashing consolidation | Low | No | `BatchMashing.vue`, `[_id].vue` |
| 1.2 Fermenting % done | Low | No | `BatchFermenting.vue` |
| 1.3 Distilling disposal flag | Low | Yes | `Batch.ts`, `batch.schema.ts`, `BatchDistillingRun.vue` |
| 1.4 Maceration duration | Low | Maybe | `BatchMaceration.vue`, possibly `Recipe.ts` |
| 1.5 Filtering vessel update | Low | No | `BatchFiltering.vue` |
| 2.1 Storage vessel board | Medium | No | `BatchStorage.vue`, `VesselCard.vue` |
| 2.2 Barrel tasting layout | Medium | No | `BatchBarrelAging.vue` |
| 2.3 Proofing calculator | Medium | No | `BatchProofing.vue`, `useProofingCalculator.ts` |
| 2.4 Bottling sales value | Low | No | `BatchBottled.vue` |
| 2.5 Blending mixed batch | High | No | `BatchBlending.vue`, `useBatchStore.ts` |
| 3.1 Move advance actions | Medium | No | `[_id].vue`, all `Batch*.vue` |
| 3.2 ABV audit | Low | No | `VesselCard.vue` |

---

## Agent Assignments

| Agent | Tasks |
|-------|-------|
| **distillery-admin-builder** | All items (0.1 through 3.2) — primary agent for admin features |
| **data-model-specialist** | 1.3 (disposal flag schema sync) and 1.4 (if Recipe schema change needed) |
| **test-writer** | After Phase 2 — unit tests for proofing calculator integration, blending batch creation |

---

## Implementation Notes

### Schema Strategy
- Only 1.3 (disposal flag) definitively requires a schema change — it's additive and optional
- 1.4 (maceration duration) may need a Recipe schema addition — check first if `recipe.notes` or existing fields already cover this
- All changes are backward-compatible (optional fields with defaults)

### Card Layout Pattern
Each stage card should follow a consistent pattern:
- Card header with stage name, icon, and color from `STAGE_DISPLAY`
- Editable fields when `editing` prop is true (stage has active volume)
- Read-only display when not editable
- Advance action button at bottom of card when stage is advancable

### Testing
- `npm run dev` and test each stage card with an existing batch
- Verify card ordering works correctly with multi-stage batches
- Test blending flow end-to-end (Phase 2.5)
- Run `npm run test` after schema changes
