# UI Overhaul — Phase 4 Complete

**Date:** 2026-05-07
**Plan:** `PLAN-UI-OVERHAUL.md`

## Shipped

1. **`layouts/floor.vue`** — minimal layout: top bar (Back / GDC Floor brand / user chip), no sidebar, scrollable main with `max-w-3xl mx-auto`. Loads only the stores the floor surface actually needs (batch, vessel, recipe, item, inventory). No command palette, no breadcrumbs.

2. **`pages/floor/index.vue`** — vessel-tile grid, 1 column on phone / 2 columns on tablet portrait. Each tile is ~120px tall with stage-colored left border, vessel name + type, current stage + recipe, fill bar with capacity numbers, and a red attention-bell icon when the contained batch needs attention. "In use only / All N" toggle button (default: in-use only — the floor cares about active vessels).

3. **`pages/floor/vessel/[id].vue`** — per-vessel detail + action menu. Top: stage-colored vessel card with name, type, stage badge, recipe name, fill bar. Below: stack of `FloorActionCard`s — Log Reading (only on `Fermenting` batches), Move (delegates to `LazyModalTransferAction` with prefilled sources), Tax-Paid Withdrawal (preset to `tax_paid_withdrawal` type), Open in Desktop. Empty vessels show a single "Vessel is empty" disabled card pointing the user to another vessel.

4. **`components/Floor/FloorActionCard.vue`** — large 72px-min-height tap target with icon-bubble + label + description + chevron. Tone variants: default / danger / success.

5. **`components/Floor/FloorNumberPad.vue`** — on-screen 3×4 numeric keypad. 56px-min keys, decimal toggle prop, separate Clear button. Display row at top with monospace tabular numerals + unit label. v-model emits a parsed `number | null`. No system keyboard ever opens.

6. **`pages/floor/action/log-reading/[id].vue`** — single-screen reading entry. Header shows recipe name + last reading details. Three big field selector buttons (Gravity / Temp / pH) — tap to choose what to enter, badge shows the value already entered for each. Active field's number pad below; °F/°C toggle when temperature is the active field. Submit button anchored to bottom (`fixed bottom-0`) in the thumb zone, sized 56px tall with gold solid styling. On save, calls `batchStore.updateStageData(batchId, 'Fermenting', { readings }, log)` then `router.back()`.

## Auth

`/floor/**` routes opt into `definePageMeta({ middleware: ['auth'] })`. Verified: `curl /floor → 302` (unauthenticated → redirect to /login); `curl /admin → 200`.

## Tests

- `npm run test` → 303/303 passing.
- Dev server compiles clean.
- `/floor` returns 302 for unauthenticated requests (correct).

## Surprising / discovered

- **Admin auth pattern wasn't a global middleware.** The named `middleware/auth.ts` exists but admin pages don't reference it via `definePageMeta({ middleware })`. Some other path (likely the AdminHeader component fetching `/api/auth/me` and redirecting) handles it. For `/floor` I made the middleware reference explicit per-page, so the protection is local and obvious.
- **Auto-port collision.** Dev server fell back from `3001` to `3000` to `3001` between runs depending on which test process held the port. No code impact — just had to hit the right port for verification.
- **Reusing `useVesselBoard` worked perfectly.** The composable Phase 2 built (vessel + batch + stage + attention join) is exactly what the floor home needed. Built the floor grid in one component without re-deriving anything.
- **The Move + Withdraw actions both delegate to `LazyModalTransferAction`.** The same modal that powers desktop transfers also works on tablet. No mobile-specific transfer form was needed; the Phase 3 two-column form collapses gracefully to single column on narrow screens, and the modal already exposes the full form. This is also nice for data integrity — same form, same validation, same balance check, same Transfer ledger.

## Deferred / not in this phase

- **Advance-stage as its own floor-native form.** Currently the Move card's modal serves both move and advance. Could be split into a wizard-style flow if operators ask for it.
- **Equipment cleaning / calibration logging.** Not in the friction audit but a likely floor task. Defer until requested.
- **Offline support / PWA install.** Plan Section 8 (L5) — defer until connectivity is a real problem.
- **Hardware integrations** (USB hydrometer, Bluetooth scale). Out of scope per Section 3.
- **A `/floor/login` route** with a numeric PIN. The Q2 open question was whether to use a separate PIN or the existing session cookie. Picked the existing cookie for now (simpler, secure). Revisit if the operators-don't-have-emails problem emerges.

## Next phases

Phase 5 (editable history + draft state) and Phase 6 (compliance-as-byproduct reports) are both ⏸ blocked on `PLAN-PIPELINE-REVAMP.md` Phase 7+ being complete.

Phases 1–4 are now ✅ shipped. The plan delivers everything that was independent of the Transfer ledger refactor.
