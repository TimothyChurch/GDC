# Next Steps — UI Overhaul

**Last updated:** 2026-05-08
**Owner:** Timothy

---

## ⚡ One-line pickup

After fixing bugs, paste this into a fresh Claude session:

> Read `NEXT-STEPS.md`, then start Phase 7 of `PLAN-UI-OVERHAUL.md`.

That's it. Everything Claude needs is below.

---

## Where things stand

**Active plan:** `PLAN-UI-OVERHAUL.md` (project root)

| Phase | Status | Notes |
|---|---|---|
| 1 — Quick wins + Needs-attention dashboard | ✅ | `.claude/completed/UI-OVERHAUL-PHASE-1.md` |
| 2 — Vessel-first IA (VesselBoard) | ✅ | `.claude/completed/UI-OVERHAUL-PHASE-2.md` |
| 3 — Inline UX polish (forms, calc, transfer layout) | ✅ | `.claude/completed/UI-OVERHAUL-PHASE-3.md` |
| 4 — Mobile/tablet floor surface (`/floor`) | ✅ | `.claude/completed/UI-OVERHAUL-PHASE-4.md` |
| 5 — Editable history + draft state | ✅ (reframed) | `.claude/completed/UI-OVERHAUL-PHASE-5.md` |
| 6 — Compliance-as-byproduct reports | ✅ (UI shell) | `.claude/completed/UI-OVERHAUL-PHASE-6.md` |
| **7 — HIGH-severity polish** | ⬜ next | See `PLAN-UI-OVERHAUL.md` Phase 7 |
| 8 — Empty + loading state sweep | ⬜ | See `PLAN-UI-OVERHAUL.md` Phase 8 |
| 9 — Accessibility + visual consistency | ⬜ | See `PLAN-UI-OVERHAUL.md` Phase 9 |

Tests at last checkpoint: **327/327 passing**.

---

## Step 1: Bugs to fix first

Capture each bug here as you find it so the next session has context. Format:

```
### Bug: <one-line summary>
- Where: <file:line or page route>
- Repro: <steps>
- Severity: blocker / annoying / cosmetic
- Notes: <any context>
```

### Bug: _(template — replace this section)_
- Where:
- Repro:
- Severity:
- Notes:

---

## Step 2: Resume Phase 7 work

Phase 7 is **0.5 day (~3h)** of HIGH-severity fixes. Five deliverables:

1. Inventory input rejects negative quantities
2. Password strength meter on `PanelUser.vue`
3. `text-parchment/30` → `text-parchment/45` (WCAG AA contrast fix)
4. Inbox `toggleReadStatus` / `deleteMessage` wrapped in try/catch + toast
5. Proofing calculator constrains ABV to 0–100

Full file list, verification steps, and effort breakdown are in `PLAN-UI-OVERHAUL.md` under "Phase 7 — HIGH-severity polish."

When Phase 7 is done, Phase 8 (empty/loading sweep, ~4h) and Phase 9 (a11y + visual consistency, ~4h) are next. Each is independently shippable; you can stop after any phase.

---

## Required reading before Phase 7

Have a fresh Claude read these in order — total context is small:

1. **`NEXT-STEPS.md`** (this file)
2. **`PLAN-UI-OVERHAUL.md`** — full plan, focus on Section 7 (status table) and Phases 7–9
3. **`.claude/completed/UI-OVERHAUL-PHASE-6.md`** — what shipped most recently and what was deferred
4. **`MEMORY.md`** (auto-loaded) — project conventions

That's enough to start. Earlier phase completion notes are background reading if needed.

---

## Verification commands

```bash
npm run dev      # Dev server (port 3001 or 3000)
npm run test     # 327 tests should pass
npm run build    # Production build
```

When `/admin` lands on the vessel board, `/admin/dashboard` shows the demoted KPI dashboard, `/floor` redirects to `/login` for unauthenticated users — the Phase 1–6 work is intact.

---

## What NOT to redo

These items are deferred on purpose. Don't let a fresh agent re-flag them as "missing":

- **In-place editable transfers** — intentionally dropped (Phase 5 reframed). The Transfer schema's immutability contract is correct for TTB integrity.
- **`useReportStatus` per-page wiring on the other 10 reports** — held until PIPELINE Phase 9 (data sourced from Transfer ledger).
- **Volume-input calculator** in run forms — `NumberInputWithCalc kind="volume-gal"` is built and ready, but only ABV inputs were swapped. ABV was higher leverage.
- **Replacing the four `Shortcut*` buttons with `TransferQuickAction`** — the unified component is built; call-site swap was deferred per the plan.
- **Sidebar `/floor` active state** — false positive in the post-Phase-6 audit. The Phase 2 `isActive()` fix already handles it.
- **Long-term ideas L1–L12** in `PLAN-UI-OVERHAUL.md` Section 8 — explicitly future work.

---

## Files I'd lose context on without this note

- `composables/useAttentionFeed.ts`, `useVesselBoard.ts`, `usePanelDraft.ts`, `useReportStatus.ts` — built across Phases 1, 2, 3, 6
- `components/Vessel/VesselBoard.vue`, `VesselTile.vue`, `VesselBoardFilters.vue` — Phase 2
- `components/Floor/FloorActionCard.vue`, `FloorNumberPad.vue` — Phase 4
- `components/Base/NumberInputWithCalc.vue` — Phase 3
- `components/Report/ReportShell.vue`, `ReportLastSync.vue` — Phases 1 & 6
- `components/Batch/BatchStartAction.vue` — Phase 5
- `components/Transfer/TransferQuickAction.vue` — Phase 3 (built, not yet wired into call sites)
- `layouts/floor.vue`, `pages/floor/**` — Phase 4

These all work together; touching one without context risks breaking another.

---

## Memory pointers

- **Project memory:** `/home/timothy/.claude/projects/-home-timothy-Coding-GDC/memory/MEMORY.md`
- **UI overhaul memory pointer:** `/home/timothy/.claude/projects/-home-timothy-Coding-GDC/memory/active_plan_ui_overhaul.md`
- **Companion plan (still active):** `PLAN-PIPELINE-REVAMP.md` — Phase 7 mostly done; Phases 8 + 9 remain. Phase 9 unblocks deeper Phase 6 integration on this plan.
