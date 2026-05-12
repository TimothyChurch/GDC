# UI Overhaul — Master Plan

**Document version:** 1.0
**Created:** 2026-05-07
**Owner:** Timothy
**Estimated duration:** 8–11 working days (solo)
**Companion plan:** `PLAN-PIPELINE-REVAMP.md` (Transfer ledger refactor — Phase 6/7 mostly complete)

---

## 0. How To Use This Document

Source of truth for the UX/UI rewrite. Structured so work can be paused and resumed across multiple sessions. Each phase has:

- A **goal** (one sentence)
- **Inputs** (what must be true before starting)
- **Deliverables** (what must be true to mark the phase done)
- **Concrete file list** (paths to create/modify)
- **Verification steps** (how to know it works)

When picking up after a break, re-read Sections 1–5 first, then jump to the active phase in Section 7. Update the **Status** column in Section 7 as work progresses.

---

## 1. Executive Summary

The current GDC admin UI is functional but mismatches how distillery staff actually work. A research benchmark against 14 leading brewing/distillery products (Ekos, OnBatch, Whiskey Systems, Beer30, BrewPlanner, Crafted ERP, Beer Run, VicinityBrew, OrchestratedBEER + Tulip/Oden) and a thorough audit of the GDC admin surface produced a single strategic finding and ten concrete UI changes.

**Strategic finding: vessel-first, not batch-first.** Every well-rated competitor opens to a tank/vessel grid, treating batches as a *property of a tank*. GDC opens to a count-based dashboard and forces users into either `/admin/batches` or per-vessel detail. This mismatches floor reality ("what's in tank 3?" not "where is batch #247?") and is the root of several smaller friction points.

**Ten concrete changes** (ranked by impact) sit underneath that finding. Six are independent of the in-flight Transfer ledger and can ship now (Phases 1–4). Four depend on Transfer ledger Phase 7+ being complete (Phases 5–6). The plan is structured so you can stop after any phase and have a shipped, valuable improvement on `main`.

---

## 2. Goals

| # | Goal | Measurable Outcome |
|---|---|---|
| G1 | Vessel-first IA | Default `/admin` lands on a vessel/tank board; batches surface as tile contents. |
| G2 | "Needs attention" first | Dashboard leads with action items pulled from existing data, not raw counts. |
| G3 | One transfer, one form | The four `Shortcut*` buttons collapse to one "Move" action with smart-default form. |
| G4 | Visible balance math | Source/destination/loss/balance all visible without scrolling on the transfer form. |
| G5 | Inline calculators | Volume/proof/proof-gallon/temperature conversions happen at the input field, not in a separate tool. |
| G6 | Mobile-friendly floor entry | Tablet-portrait, glove-friendly route for the most common floor actions. |
| G7 | Draft state | Multi-step forms persist on accidental close; `Upcoming` batches are real drafts. |
| G8 | Editable history with audit | Mistakes are correctable; correction trail preserved. (Avoids Ekos's #1 complaint.) |
| G9 | Compliance as byproduct | Reports screens are read-only verify-and-export, not data-builder UIs. |
| G10 | Action-prompt cards | Every batch/vessel card surfaces its next required action, not just status. |

---

## 3. Non-Goals

To prevent scope creep, explicitly out of scope:

- Replacing Nuxt UI v4 or Tailwind v4
- New domain models (this is UI/UX only — no schema changes beyond what's needed for draft state)
- Drag-and-drop fermentation Gantt (long-term; tracked in Section 8)
- Native barcode scanning / hardware integrations
- Replacing the dashboard's chart library (Chart.js stays)
- Re-skinning the public/marketing site (`components/Site/*`) — separate effort
- Touching `composables/batchPipeline.ts` semantics (recipe-templated stages tracked in Section 8)
- Re-implementing PanelProduction's cost calculation logic (only its UI presentation)

---

## 4. Current State Audit

### 4.1 High-severity friction (blocks workflows)

| ID | Severity | Location | Friction |
|----|----------|----------|---|
| 4.1.1 | High | `pages/admin/batch/[_id].vue` | Two confusing view modes (Kanban ↔ Stacked); same data twice; users don't know which to use. |
| 4.1.2 | High | `components/Batch/BatchSpiritRun.vue`, `BatchDistilling.vue`, `BatchStrippingRun.vue` | 7+ inputs per run, no draft state. Save fails partway → unclear DB state. |
| 4.1.3 | High | `components/Transfer/TransferActionForm.vue` | Sources / Destinations / Loss / Balance stack vertically, all collapsible. Balance check at the bottom often unseen. |
| 4.1.4 | High | `components/Panel/PanelBatch.vue` | Recipe change rescales `stageVolumes` opaquely; user sees no preview. |
| 4.1.5 | High | `components/Panel/PanelProduction.vue` | Multi-step (`currentStep` ref) but no step indicator rendered. Cost math opaque. |
| 4.1.6 | High | `pages/admin/batches.vue` | Stage tabs hide Barrel Aging / Bottled until populated; users must drill into detail. |
| 4.1.7 | High | `components/Transfer/ShortcutAdvanceStage.vue` | Post-processing (run stub creation) is silent; failure warning toasts after transfer already commits. |
| 4.1.8 | High | `pages/admin/reports/*` | Click card → view report → ??? — no obvious export/file action. |

### 4.2 Medium-severity friction

| ID | Location | Friction |
|----|----------|---|
| 4.2.1 | `pages/admin/index.vue` | Raw count tiles; no "next action" prompts. |
| 4.2.2 | `components/Admin/AdminSidebar.vue` (command palette) | 14 search categories; users may not know to search vs. navigate. |
| 4.2.3 | `components/Transfer/Shortcut{AdvanceStage,WithinStageMove,Withdraw,Destroy}.vue` | Four buttons, four mental models, all open the same form. |
| 4.2.4 | `pages/admin/inventory.vue` | Two-level hierarchy (category card → table) adds clicks. |
| 4.2.5 | `pages/admin/bottles.vue` | Grid view hides stock counts; toggle to table just to see "47 left." |
| 4.2.6 | `pages/admin/vessels.vue` | "Empty Vessel" is a one-click destructive action — no confirmation. |
| 4.2.7 | All `components/Panel/*` | No real-time validation; errors after submit. No "unsaved changes" warning. |
| 4.2.8 | All `components/Table/*` | Page-based pagination ("Page 3" not "21–30 of 150"); no bulk actions. |
| 4.2.9 | `components/Transfer/TransferActionForm.vue` | Loss reason is dropdown-only; cost breakdowns calculated but not explained. |

### 4.3 Low-severity friction

| ID | Location | Friction |
|----|----------|---|
| 4.3.1 | `components/Admin/AdminSidebar.vue` | Quick-add buttons show only `+` icon when collapsed. |
| 4.3.2 | `components/Table/TableRecipes.vue`, `TableContacts.vue` | Expandable rows with unclear expand target. |
| 4.3.3 | `pages/admin/vessels.vue` | "Current" column shows latest snapshot only, no history. |
| 4.3.4 | Recipe delete | No warning about active batches using the recipe. |
| 4.3.5 | All reports | No "data as of" timestamp visible. |
| 4.3.6 | `components/Admin/AdminSidebar.vue` | Compliance deadlines not surfaced like Low Inventory is. |

---

## 5. Industry Pattern Reference

| # | Pattern | Products that ship it | GDC mapping |
|---|---|---|---|
| P1 | Tank-centric home | Ekos, Beer30, VicinityBrew, Arryved, OnBatch | Phase 2 |
| P2 | Drag-and-drop scheduling Gantt | BrewPlanner, Beer Run | Section 8 (long-term) |
| P3 | Custom tank stages over rigid pipelines | Beer30 | Section 8 (long-term) |
| P4 | Mobile/tablet shop-floor surface | Tulip, Ekos | Phase 4 |
| P5 | Quick-action buttons on entity, not in global form | Ekos, OnBatch | Phase 3 |
| P6 | Compliance reports as byproduct | Crafted ERP, Whiskey Systems, BrewMan, OrchestratedBEER, Distill x 5 | Phase 6 (depends on Transfer ledger) |
| P7 | Inline gauge/proof calculators | OnBatch, Whiskey Systems | Phase 3 |
| P8 | Auto-saving forms / draft state | Beer Run, BrewPlanner | Phase 3 |
| P9 | "Needs attention" surface, not KPI dump | Oden, Tulip, VicinityBrew | Phase 1 |
| P10 | Floor map / rack visualization | OnBatch, Ekos | Aligns with PIPELINE-REVAMP Phase 8 |
| P11 | Editable history with audit trail | (Anti-pattern — Ekos's top complaint) | Phase 5 |

---

## 6. Risks & Constraints

- **R1 — Don't block on Transfer ledger.** Phases 1–4 must remain independent of `PLAN-PIPELINE-REVAMP.md` Phase 8/9. If those slip, this plan still ships Phase 1–4.
- **R2 — Don't break existing flows.** Add new views alongside old; flag-gate or route-gate the switchover. Old `/admin/batches` route stays until Phase 2 is verified.
- **R3 — Don't expand schema casually.** Draft-state persistence (G7) uses `localStorage` first; only add server-side draft fields if a clear need emerges.
- **R4 — Don't refactor stores during UI work.** Phases 1–4 read existing Pinia stores; don't restructure them.
- **R5 — Pre-existing Nuxt UI type errors stay.** Documented in MEMORY.md; don't try to fix as part of this plan.
- **R6 — Watch the in-flight Transfer ledger.** Phases 5–6 require Transfer Phase 7 (server-side cost calc, 7.3/7.4) to be done. Coordinate before starting.

---

## 7. Phases

Status legend: ⬜ Not started · 🟨 In progress · ✅ Done · ⏸️ Blocked

| Phase | Name | Depends on | Effort | Status |
|---|---|---|---|---|
| 1 | Quick wins + Needs-attention dashboard | — | 1.5 days | ✅ |
| 2 | Vessel-first IA (VesselBoard) | — | 2 days | ✅ |
| 3 | Inline UX polish (forms, calc, transfer layout) | — | 2 days | ✅ |
| 4 | Mobile/tablet floor surface (`/floor`) | Phase 2 | 2 days | ✅ |
| 5 | Editable history + draft state (server) | PIPELINE 7.x | 1 day | ✅ (reframed) |
| 6 | Compliance-as-byproduct report screens | PIPELINE 9 | 1.5 days | ✅ (UI shell) |
| 7 | HIGH-severity polish (validation, contrast, silent failures) | — | 0.5 day | ⬜ |
| 8 | Empty + loading state sweep | — | 0.5 day | ⬜ |
| 9 | Accessibility + visual consistency | — | 0.5 day | ⬜ |

---

### Phase 1 — Quick wins + Needs-attention dashboard (1.5 days)

**Goal:** Ship every low-effort UX fix and replace the dashboard's KPI tiles with an actionable "needs attention" feed.

**Inputs:** None — all changes are local to existing files.

**Deliverables:**
1. Dashboard leads with a `DashboardAttentionFeed` component pulling action items from existing batch / vessel / inventory / reportingPeriod data.
2. KPI tiles demoted to a secondary row.
3. Quick wins (4.2.5, 4.2.6, 4.3.1, 4.3.4, 4.3.5, 4.3.6, 4.2.8) all shipped.

**Files:**
- Create: `components/Dashboard/DashboardAttentionFeed.vue`
- Create: `composables/useAttentionFeed.ts` — derives action items from existing stores. Sources: stalled fermentation (last reading > 36h on a `Fermenting` batch), sampling overdue (barrel last-sampled > N days), upcoming TTB/TABC deadlines (`useComplianceDeadlines.ts`), low-inventory items, batches awaiting next stage.
- Modify: `pages/admin/index.vue` — restructure layout: feed on top, tiles below.
- Modify: `pages/admin/bottles.vue` — show stock count in grid card (not just badge color).
- Modify: `pages/admin/vessels.vue` (or `components/Vessel/VesselEmptyAction.vue` if it exists) — add `useConfirm` modal before "Empty Vessel."
- Modify: `components/Admin/AdminSidebar.vue` — show button text labels next to `+` icons in collapsed state (tooltips at minimum).
- Modify: `components/Panel/PanelRecipe.vue` (delete handler) — fetch batch count using this recipe; warn before delete.
- Modify: all `components/Report/*` — add `<UBadge>Last sync: {timestamp}</UBadge>` header.
- Modify: `components/Admin/AdminSidebar.vue` — add compliance-deadline urgency badge next to Reports section.
- Modify: `components/Table/TableWrapper.vue` — replace page-based pagination label with item-range label.

**Verification:**
- `npm run dev`; load `/admin`; the first thing visible is a list of action items, not just numbers.
- Action items are clickable and route to the relevant entity.
- Bottle grid shows numerical stock count.
- Empty Vessel triggers a confirmation modal.
- Deleting a recipe in use shows the count and asks for confirmation.
- Tables show "Showing 21–30 of 150" instead of "Page 3."
- `npm run test` passes.
- No regressions in existing pages.

**Estimated:** 1.5 days (one big component + ~7 small touch-ups).

---

### Phase 2 — Vessel-first IA (VesselBoard) (2 days)

**Goal:** Introduce a vessel-tile board as the new default `/admin` landing view. Batches surface as tile contents. Old dashboard becomes secondary (`/admin/dashboard`).

**Inputs:** Phase 1 done (so attention feed is available to embed in the new layout).

**Deliverables:**
1. New `VesselBoard.vue` page rendering every vessel as a tile, color-coded by stage of contained batch.
2. Each tile shows: vessel name, type, capacity %, current contents (batch ID, stage, volume), "needs attention" badge, primary action button.
3. Filter chips: by stage, by vessel type (fermenter / still / barrel / brite / tote), by attention.
4. The current dashboard moves to `/admin/dashboard` and becomes secondary.
5. Sidebar's first item changes from "Dashboard" to "Vessels" (or "Floor"), with "Dashboard" as secondary.

**Files:**
- Create: `pages/admin/index.vue` rewrite — render `VesselBoard` instead of dashboard.
- Move: existing dashboard content → `pages/admin/dashboard.vue` (preserve all existing content).
- Create: `components/Vessel/VesselBoard.vue` — grid of `VesselTile`s, with filter chips at top.
- Create: `components/Vessel/VesselTile.vue` — single tile UI; reuses `useVesselStore` + batch lookup.
- Create: `components/Vessel/VesselBoardFilters.vue`.
- Create: `composables/useVesselBoard.ts` — derives the join of vessel + active batch + attention status.
- Modify: `components/Admin/AdminSidebar.vue` — adjust nav order; add "Dashboard" as secondary item.
- Modify: `components/Admin/AdminBreadcrumbs.vue` — handle the new root.

**Verification:**
- Load `/admin`; see a tile per vessel; tiles color-coded; click a tile → drills to batch detail or vessel detail (TBD UX choice during build).
- Filter chips work (stage, type, attention).
- Old dashboard accessible at `/admin/dashboard`.
- Mobile renders the tile board as a single column without breaking.
- All existing routes still resolve.

**Estimated:** 2 days.

**Coordination note:** The vessel floor map view in `PLAN-PIPELINE-REVAMP.md` Phase 8 is the spatial successor to this board. Build this first; the floor map evolves from it.

---

### Phase 3 — Inline UX polish (2 days)

**Goal:** Three high-impact form/UX improvements: side-by-side transfer form, inline calculators, multi-step indicators with draft state.

**Inputs:** None — all changes are local.

**Deliverables:**
1. `TransferActionForm.vue` redesigned with two-column source/destination layout, sticky balance/loss strip at the bottom.
2. New `useUnitConversion.ts` composable + `<NumberInputWithCalc>` wrapper component used in distilling/stripping/spirit-run forms and the transfer form.
3. `PanelProduction.vue` and `PanelBatch.vue` get visible step indicators (`UStepper`-style header).
4. All `Panel/*` slide-overs persist their `localData` to `localStorage` keyed by panel + entity ID; restore on reopen; show "unsaved changes" indicator.
5. Recipe-change preview in `PanelBatch.vue` — shows what stage volumes will rescale to, before commit.
6. The four `Shortcut*` buttons collapse into one `<TransferQuickAction>` with a smart-default form. (Old shortcut components stay temporarily, marked `// TODO remove after Phase 3 verification` — delete in cleanup pass.)

**Files:**
- Modify: `components/Transfer/TransferActionForm.vue` — two-column layout; sticky balance/loss.
- Create: `composables/useUnitConversion.ts` — wraps existing `convertUnitRatio` (after PIPELINE Phase 5 fixes), exposes reactive helpers (gallons↔proof gallons, °P↔ABV, temp-corrected proof).
- Create: `components/Base/NumberInputWithCalc.vue` — UInput with a small calc icon that opens a popover; auto-fills the other unit.
- Modify: `components/Batch/BatchSpiritRun.vue`, `BatchStrippingRun.vue`, `BatchDistilling.vue` — replace raw `UInput[type=number]` with `NumberInputWithCalc`.
- Modify: `components/Panel/PanelProduction.vue` — add `<UStepper>` header bound to `currentStep`.
- Modify: `components/Panel/PanelBatch.vue` — add `<UStepper>` if not single-step; add recipe-change preview block.
- Create: `composables/usePanelDraft.ts` — generic localStorage draft persistence keyed by `${panelName}:${entityId}`.
- Modify: every `components/Panel/*.vue` to call `usePanelDraft`.
- Create: `components/Transfer/TransferQuickAction.vue` — single button + smart-default form (infers transfer type from source/dest selection).
- Modify: every page using `Shortcut{AdvanceStage,WithinStageMove,Withdraw,Destroy}.vue` → swap to `TransferQuickAction` (DashboardBatchCard, BatchStageKanban, ModalTransferAction, etc.).

**Verification:**
- Open transfer form; sources and destinations visible side-by-side; balance/loss row sticky at bottom.
- Type a volume in gallons; calc icon shows proof-gallons inline.
- Open `PanelProduction`; see "Step 1 of 3" header; clicking back/forward navigates without losing data.
- Type in a panel form, close panel, reopen — fields restored.
- Edit batch recipe in `PanelBatch`; preview shows new stage volumes before save.
- Single "Move" button on a batch card opens the transfer form pre-filled correctly for advance / within-stage / withdraw / destroy depending on what the user selects.
- `npm run test` passes.

**Estimated:** 2 days.

---

### Phase 4 — Mobile/tablet floor surface (2 days)

**Goal:** A `/floor` route optimized for tablet portrait + glove-friendly tap targets, exposing the most common floor actions: log gravity, log temp, log run cut, advance stage.

**Inputs:** Phase 2 done (vessel board concepts reused).

**Deliverables:**
1. New `/floor` route with its own layout (no sidebar, big tap targets).
2. Floor home: vessel grid, simplified — name + stage + one action button per tile.
3. Per-vessel detail screen on `/floor`: 3–5 single-purpose action cards ("Log Reading", "Advance Stage", "Move", "Withdraw").
4. Each action is one screen, one form, ≤4 inputs visible at a time. Submit button anchored bottom (thumb zone).
5. Login flow works on mobile (existing auth).

**Files:**
- Create: `layouts/floor.vue` — minimal: top bar with logo + back + user, slot, no sidebar.
- Create: `pages/floor/index.vue` — vessel tile grid (reuses `useVesselBoard` from Phase 2).
- Create: `pages/floor/vessel/[id].vue` — per-vessel action menu.
- Create: `pages/floor/action/log-reading.vue`, `pages/floor/action/advance.vue`, `pages/floor/action/move.vue`, `pages/floor/action/withdraw.vue`.
- Create: `components/Floor/FloorActionCard.vue`, `FloorBigButton.vue`, `FloorNumberPad.vue` (numeric keypad for tablet entry, no system keyboard).
- Modify: `nuxt.config.ts` if any route-level config needed (e.g., disable sidebar layout).

**Verification:**
- Visit `/floor` on a tablet (or browser dev-tools tablet emulation); see vessel grid at touch-friendly size.
- Tap a vessel → see action menu.
- Log a gravity reading: 3 taps from `/floor` to submit.
- Submit works without a system keyboard (number pad component handles entry).
- Existing desktop `/admin` still works unchanged.

**Estimated:** 2 days.

**Out of scope here:** Native PWA install, offline support, hardware integration. Add to Section 8 if needed later.

---

### Phase 5 — Editable history + draft state (1 day) ⏸ blocked

**Goal:** Allow correcting past Transfer entries (with audit trail) and promote `Upcoming` batches to a real draft state.

**Inputs:** `PLAN-PIPELINE-REVAMP.md` Phase 7 (Transfer ledger as system of record) **must be complete**.

**Deliverables:**
1. `Transfer` schema gains `correctedBy: ObjectId, correctedAt: Date, originalSnapshot: Mixed` fields.
2. `PUT /api/transfer/[id]` allowed within open reporting period; writes a corrected revision instead of mutating.
3. `TransferHistory.vue` shows corrections with a "corrected on X by Y" badge; original viewable via tooltip.
4. `Upcoming` stage batches editable as drafts without firing transfers; promotion to first real stage requires explicit "Start Batch" action.

**Files:**
- Modify: `server/models/Transfer.ts` — add correction fields.
- Modify: `server/api/transfer/[id].put.ts` — implement corrected-revision write.
- Modify: `components/Transfer/TransferHistory.vue` — render correction trail.
- Modify: `stores/useBatchStore.ts` — formalize `Upcoming` as draft (no Transfer rows generated).
- Create: `components/Batch/BatchStartAction.vue` — "Start Batch" button visible only on `Upcoming` batches.

**Verification:**
- Create a transfer; correct a typo on it within the open period; see corrected revision in history.
- Create an `Upcoming` batch; edit it freely; no transfers exist; click "Start Batch" → first transfer fires.
- `Upcoming` batches do not appear on the floor surface (`/floor`).
- TTB report numbers don't double-count corrections.

**Estimated:** 1 day.

---

### Phase 6 — Compliance-as-byproduct report screens (1.5 days) ⏸ blocked

**Goal:** Reframe `/admin/reports/*` as read-only verify-and-export views. Reports auto-compile from the Transfer ledger.

**Inputs:** `PLAN-PIPELINE-REVAMP.md` Phase 9 (TTB report UI sourcing from Transfer ledger) **must be complete or in progress**.

**Deliverables:**
1. Every report page has a top status bar: **"Last data sync: 2m ago • Status: Ready to file • [Export PDF] [Open pay.gov]"**.
2. Report bodies are read-only tables; no inline edits, no "Generate" buttons (the report already exists).
3. Discrepancies (open transfers, unconfirmed loss) surface as red banners at the top with deep links to the offending row.
4. Export PDF uses existing PDF route or adds a thin `pdfkit`/`puppeteer` wrapper (decide during build).
5. Sidebar surfaces "X reports ready to file" badge.

**Files:**
- Modify: every `components/Report/*.vue` — wrap in `<ReportShell>` with top bar + discrepancies banner.
- Create: `components/Report/ReportShell.vue` — generic header + actions.
- Create: `composables/useReportStatus.ts` — derives "ready to file" / "has discrepancies" from Transfer ledger state.
- Modify: `components/Admin/AdminSidebar.vue` — surface filing-readiness badge.
- Possibly modify: `server/api/reports/*` for PDF export endpoint.

**Verification:**
- Load any TTB report; top bar shows sync timestamp and status.
- Insert a deliberate discrepancy (e.g., open transfer); banner appears with link to fix it.
- Click Export PDF; valid PDF downloads.
- Sidebar shows the readiness badge.
- No "Generate Report" buttons remain anywhere.

**Estimated:** 1.5 days.

---

### Phase 7 — HIGH-severity polish (0.5 day)

**Goal:** Fix the four highest-severity UX issues identified in the post-Phase-6 audit. Each is small in scope but high in user impact.

**Inputs:** None.

**Deliverables:**

1. **Inventory count input validation** — `/admin/inventory/input` lets users submit negative stock counts that silently corrupt history. Add `min="0"` on the inputs + a yup schema that rejects negative quantities at submit.
2. **Password strength meter on `PanelUser.vue`** — currently only checks min-length 8. Add an entropy-based strength visualization (`weak / medium / strong`) and reject obvious weak passwords (`12345678`, repeated chars, dictionary).
3. **Disabled-state contrast fix** — `text-parchment/30` on `bg-charcoal` fails WCAG AA. Replace project-wide with `text-parchment/45` (or a dedicated `text-disabled` token). Affected: `FloorActionCard.vue`, all the "Empty" labels on `/floor` pages, generally search-replace `parchment/30` → `parchment/45` across `.vue` files.
4. **Silent failures in Inbox** — `pages/admin/inbox/index.vue:63,72` (`toggleReadStatus`, `deleteMessage`) call store methods without try/catch. Wrap with the standard toast-on-error pattern.
5. **Proofing calculator validation** — `components/Proofing.vue` accepts ABV outside 0–100. Constrain inputs and short-circuit calculations on invalid input.

**Files:**
- Modify: `pages/admin/inventory/input.vue` — add `min="0"` + submit guard.
- Modify: `components/Panel/PanelUser.vue` — strength meter component (use existing `BasePasswordStrength.vue` if present, else inline a simple zxcvbn-free entropy heuristic).
- Modify: `components/Floor/FloorActionCard.vue`, `pages/floor/index.vue`, `pages/floor/vessel/[id].vue` — replace `parchment/30` with `parchment/45` where it's used as text color on dark surface.
- Modify: `pages/admin/inbox/index.vue` — wrap `toggleReadStatus` and `deleteMessage` calls in try/catch with toast.
- Modify: `components/Proofing.vue` (or wherever the proofing calculator lives) — add `min/max` props on inputs + guard the math.

**Verification:**
- Submit a negative inventory count → blocked with field-level error.
- Set password "12345678" in PanelUser → meter shows red/weak; submit blocked.
- View any floor page → disabled "Empty" labels readable (verify with browser dev tools contrast picker).
- Toggle a message read status while offline → red error toast; UI doesn't get stuck.
- Enter ABV 250% in proofing → input rejected, no nonsense output.
- `npm run test` passes.

**Estimated:** 0.5 day (~3h).

---

### Phase 8 — Empty + loading state sweep (0.5 day)

**Goal:** Make every table and detail page show a real `BaseEmptyState` when empty and a content skeleton (not a generic spinner) when loading.

**Inputs:** None.

**Deliverables:**

1. **Wrap all 13 `Table*` components with `BaseEmptyState`** for both desktop and mobile codepaths. Currently consistent on `TableContacts` (desktop) but inconsistent or missing elsewhere (`TableCustomers`, `TableEvents`, `TableUsers`, `TableContacts` mobile).
2. **Replace generic loading spinners with content skeletons** on detail pages: `pages/admin/items/[_id].vue`, `pages/admin/customers/[_id].vue`, `pages/admin/purchaseOrders/[_id].vue`, `pages/admin/events/[_id].vue`. Each gets a `BaseDetailSkeleton` (new) showing card outlines + field placeholders proportional to the actual content.
3. **Tighten settings page skeleton** — `pages/admin/settings.vue` skeleton is two divs; doesn't match real content proportions. Replace with a tab-bar + form-section skeleton.
4. **Mobile inventory delta visibility** — `pages/admin/inventory/input.vue` mobile cards bury the delta in tiny text. Promote it to a colored chip aligned with the input.
5. **Mobile inventory input scaling** — labels wrap badly at <640px. Restructure the 3-col mobile grid into stacked rows or 2 columns with abbreviated labels.

**Files:**
- Create: `components/Base/BaseDetailSkeleton.vue` — generic detail-page skeleton; props for number of cards/fields.
- Modify: `components/Table/Table{Customers,Events,Users,Contacts,Items,Inventory,Productions,PurchaseOrders,Cocktails,Bottles,Vessels,Recipes,Batches}.vue` — ensure both desktop and mobile codepaths render `<BaseEmptyState>` when the data is empty post-filter.
- Modify: `pages/admin/items/[_id].vue`, `pages/admin/customers/[_id].vue`, `pages/admin/purchaseOrders/[_id].vue`, `pages/admin/events/[_id].vue` — swap the spinner for `<BaseDetailSkeleton />`.
- Modify: `pages/admin/settings.vue` — better skeleton.
- Modify: `pages/admin/inventory/input.vue` — mobile layout restructure + delta-chip styling.

**Verification:**
- Filter a table to zero results → see "No X found" with relevant CTA, on both desktop and mobile.
- Navigate to an item/customer/PO/event detail → see card-shaped skeleton, not a spinner.
- Resize the inventory input page to 360px → labels and inputs don't overflow.
- `npm run test` passes.

**Estimated:** 0.5 day (~4h).

---

### Phase 9 — Accessibility + visual consistency (0.5 day)

**Goal:** Round off the polish items the audit flagged: a11y, draft-banner sweep, the small visual inconsistencies.

**Inputs:** Phase 3 done (draft persistence is in place; only the visible banner is missing on most panels).

**Deliverables:**

1. **"Draft restored" banner on the remaining 11 panels** — `PanelBottle`, `PanelBulkSpirit`, `PanelCocktail`, `PanelContact`, `PanelEvent`, `PanelInventory`, `PanelItem`, `PanelPurchaseOrder`, `PanelRecipe`, `PanelUser`, `PanelVessel`. Persistence is already wired; only the visible UI is missing. Extract into a reusable `<PanelDraftBanner>` component to avoid 11 copies.
2. **Panel `aria-labelledby`** — every `<USlideover>` panel header has a title `<h2>` but no id link. Give each title an id and bind `aria-labelledby` on the slideover.
3. **Modal focus trapping + return-focus-on-close** — currently focus can Tab out of modals and doesn't return to the trigger button on close. Wrap modals (`UModal`, `USlideover`) with focus management. (Nuxt UI v4 may have built-in support; check before re-implementing.)
4. **Cocktails filter buttons** — `pages/admin/cocktails/index.vue` toggle buttons are icon-only without aria-label on some. Add aria-labels uniformly.
5. **Floor link active state** — verified working post-Phase 2; no change needed.
6. **WebSocket error toast in Controls** — `pages/admin/controls.vue` shows "Disconnected" status but no toast. Add a toast when status flips to `disconnected`.

**Files:**
- Create: `components/Panel/PanelDraftBanner.vue` — extracted draft banner. Takes `:restored-at` and emits `discard`.
- Modify: every `components/Panel/*.vue` (11 panels) — replace inline banner (where present) and add `<PanelDraftBanner>` where missing. Two lines per panel.
- Modify: every `components/Panel/*.vue` (14 panels including PanelProduction/Batch) — add `id="panel-title"` to the h2 and `:ui="{ content: 'aria-labelledby:panel-title' }"` to the slideover (or pass via props to USlideover).
- Modify: `components/Modal/*.vue` — verify focus trap behavior; add explicit handling if Nuxt UI v4 doesn't.
- Modify: `pages/admin/cocktails/index.vue` — add aria-labels.
- Modify: `pages/admin/controls.vue` — toast on WebSocket status change.

**Verification:**
- Open any panel, type something, close, reopen → see banner with "Draft restored" + Discard button.
- Tab through an open modal → focus stays inside; close modal → focus returns to the button that opened it.
- Use a screen reader to navigate any panel → it announces the title.
- Disable network → "Disconnected" toast appears once on Controls.
- `npm run test` passes.

**Estimated:** 0.5 day (~4h).

---

## 8. Long-Term / Future Phases (not scheduled)

Tracked here so they don't get lost. Each can become its own plan when prioritized.

| ID | Idea | Source pattern | Trigger |
|----|---|---|---|
| L1 | Drag-and-drop fermentation/stage Gantt | BrewPlanner P2 | When schedule pressure becomes a real planning problem. |
| L2 | Custom stages per recipe (templated `batchPipeline.ts`) | Beer30 P3 | When a second product line needs a meaningfully different pipeline. |
| L3 | Schedule-without-commit `Upcoming` calendar | Beer Run P8 | After Phase 5; if draft batches grow numerous. |
| L4 | Vessel floor map (spatial) | OnBatch / Ekos P10 | This is `PLAN-PIPELINE-REVAMP.md` Phase 8. Coordinate. |
| L5 | Native PWA install + offline floor mode | — | If Phase 4 floor surface gets adoption and connectivity is unreliable. |
| L6 | Multi-batch fermentation overlay graphs | Ekos | When a second-batch QA comparison becomes a real need. |
| L7 | Bulk actions on tables | — | Listed in 4.2.8; revisit if power users emerge. |
| L8 | Server-side search index | — | When client-side filter performance degrades on a big dataset. |
| L9 | Inbox server-side search | — | Audit #7. Currently filters loaded messages only. Becomes a real problem at ~500+ messages. |
| L10 | Unify Cocktails / Items filter pattern | — | Audit #18. Two different "filter by category + visibility" idioms. Pick one when refactoring either page. |
| L11 | Internal section consistency in `Report*.vue` | — | Audit #21. Phase 6 covered the outer shell; the inner sections (TTB Production, Storage, etc.) still vary in spacing/typography. ~4h refactor when stylistic drift becomes annoying. |
| L12 | Lazy-load batch detail child stages | — | Audit #25. `pages/admin/batch/[_id].vue` mounts every stage component eagerly. Worth lazy-loading if the page becomes janky on lower-end devices. |

---

## 9. Cross-Cutting Conventions

Apply across all phases:

- **Lazy-load** every new big component (`LazyVesselBoard`, `LazyDashboardAttentionFeed`, etc.) following the existing `LazyPanel*` / `LazyModal*` convention.
- **Auto-imports**: respect `server/utils` and `composables/` auto-import. Don't add explicit imports if Nuxt would auto-import.
- **Validation**: every form continues to use yup at the server boundary. Client-side real-time validation is a Phase 3 deliverable but doesn't replace server validation.
- **Error toasts**: continue using the existing toast pattern (`useToast()` + `getErrorMessage(err)`).
- **No new global state**: derive everything from existing Pinia stores; only add new composables.
- **Accessibility**: every new tap-target ≥ 44×44 px; every new form field labelled; every new color combo passes WCAG AA. (Floor surface especially.)
- **No emoji in code or copy** unless explicitly requested. (Project convention.)
- **Tests**: Phase 1, 3, and 5 each end with `npm run test` passing. New composables (`useAttentionFeed`, `useUnitConversion`, `usePanelDraft`, `useReportStatus`) get unit tests via the `test-writer` agent.

---

## 10. Rollout & Cutover Strategy

- **Phases 1, 3 ship straight to `main`** — no flag gating; changes are localized improvements.
- **Phase 2 ships behind a soft cutover**: keep `pages/admin/dashboard.vue` reachable; flip `pages/admin/index.vue` to `VesselBoard`. If problems, revert is one commit.
- **Phase 4 ships as additive route** — `/floor` exists alongside `/admin`. No risk to existing flows.
- **Phases 5, 6 ship behind Transfer ledger work**. Coordinate with `PLAN-PIPELINE-REVAMP.md` ownership.
- Every phase ends with a short markdown note in `.claude/completed/` (matches existing pattern, e.g. `UI-OVERHAUL-PHASE-1.md`) capturing what shipped, surprising discoveries, and any deferred items.

---

## 11. Open Questions

Decide as part of Phase 1 kickoff (don't pre-answer here):

- **Q1**: Should `VesselBoard` clicks open vessel detail or jump to the contained batch detail? (Likely: vessel detail; batch is one click further. Revisit during Phase 2 build.)
- **Q2**: Floor surface authentication — same session cookie or a dedicated PIN/scan login? (Default: same session cookie; revisit if security gap emerges.)
- **Q3**: Where do completed/archived batches live in the new IA? (Current: `/admin/batches?status=completed`. Probably stays.)
- **Q4**: PDF export library choice for Phase 6 — `pdfkit` (server-side) vs. `html2pdf.js` (client) vs. `puppeteer` (server, heavier). Decide during Phase 6 kickoff.

---

## 12. Reference

- Industry research summary: see synthesis in this conversation (10 cross-cutting patterns + per-product summaries for Ekos, OnBatch, Whiskey Systems, Distill x 5, Beer30/5th Ingredient, BrewPlanner, BrewMan, Crafted ERP, Beer Run, VicinityBrew, OrchestratedBEER, Notion/Airtable DIY, Oden, Tulip).
- Companion plan: `PLAN-PIPELINE-REVAMP.md` (Transfer ledger refactor).
- Codebase reference: `/gdc [topic]` skill in `.claude/skills/gdc/`.
- Friction audit: Section 4 of this document.
