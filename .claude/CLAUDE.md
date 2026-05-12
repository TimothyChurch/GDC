# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚡ Use the `/gdc` skill before reading source code

A full codebase reference lives at `.claude/skills/gdc/`. Load topic files on demand to minimize context:

- `/gdc tech-debt` — known issues, dead code, security gaps, mid-flight refactors. **Read first** for any task touching architecture or cleanup.
- `/gdc architecture` — overall structure, data flow, env vars
- `/gdc api` — all 97 routes, auth, validation patterns
- `/gdc stores` — all 17 Pinia stores + composables + utils
- `/gdc components` — 142 components by group + page→component map
- `/gdc batches` — batch lifecycle (most complex, ⚠️ mid-revamp)
- `/gdc {resource}` — domain references: bottles, recipes, inventory, production, cocktails, contacts, events, vessels, transfers, compliance, integrations
- `/gdc conventions` — coding patterns
- `/gdc auth` — sessions, RBAC, public route allow-list

Index: `.claude/skills/gdc/SKILL.md`

## Project Overview

Galveston Distilling Co (GDC) — a full-stack Nuxt 4 + TypeScript distillery management application. Manages batch tracking (mashing through bottling), inventory, production records, cocktail menus, vessels, recipes, contacts/CRM, events with Square checkout, and TTB/TABC compliance reporting. Uses MongoDB (Mongoose) for data, Pinia for state management, and Nuxt UI v4 for the component library.

## Commands

```bash
npm run dev        # Dev server on port 3001
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run Vitest unit tests
```

## Architecture (high level — see `/gdc architecture` for details)

### API Layer (`server/api/`)
97 file-based REST routes using Nuxt's `defineEventHandler()`. Most CRUD routes use the factory in `server/utils/api-handlers.ts` (`createGetAllHandler`, `createCreateHandler`, etc.). Validation via yup schemas in `server/utils/validation.ts`.

⚠️ **Param naming inconsistency**: some routes use `[id]`, others `[_id]`. Don't rename existing routes; use `[id]` for new ones. See `/gdc api`.

Resources (18 schemas): batch, bottle, bulkSpirit, cocktail, contact, equipmentLog, event, inventory, item, message, production, purchaseOrder, recipe, reportingPeriod*, settings, transfer*, user, vessel. (* = schema exists but no API yet — part of the in-flight Transfer revamp.)

### Database (`server/models/`)
Mongoose schemas via `nuxt-mongoose` module. MongoDB Atlas connection via `NUXT_ENV_MONGODB_URI`. Mongoose is the only ORM — Prisma is **not** installed (despite older docs).

### State Management (`stores/`)
17 Pinia stores. 16 use the `useCrudStore` factory (`composables/useCrudStore.ts`) for CRUD + auto-fetch + toast feedback. `useSettingsStore` is the only singleton (not array-based). `usePublicBottleStore` and `usePublicCocktailStore` are read-only public-facing stores.

### Types (`types/interfaces/`)
22 TypeScript interfaces (one per resource + DTOs like `PublicBottle`, `PublicCocktail`, `Contents`, `PurchaseOrderItem`). Barrel-exported via `types/index.ts`.

### Components (`components/`) — 142 total in 20 folders
- **Admin/** — Header, Sidebar, Dashboard, command palette
- **Panel/** — 14 slide-over edit forms (one per resource) — opened via `useOverlay` + `LazyPanel*`
- **Table/** — 18 data tables, all wrapping `Table/TableWrapper.vue`
- **Modal/** — Global imperative modals
- **Dashboard/** — KPI widgets (some unused — see `/gdc tech-debt`)
- **Report/** — TTB/TABC compliance reports (one per `/admin/reports/*` page)
- **Site/** — Public marketing components (Hero, Footer, Featured, etc.)
- **Card/, Form/, Base/, Batch/, Bottle/, Cocktail/, Recipe/, Vessel/, Barrel/, BulkSpirit/, Item/, Production/, Settings/** — domain-specific groupings

### Authentication
Custom session-based auth (`server/utils/session.ts` via `useSession`). 7-day cookie. Login hits `POST /api/auth/login` — bcrypt with auto-migration from legacy plaintext on first login. Session regenerated to prevent fixation. Server middleware (`server/middleware/auth.ts`) gates non-public `/api/**` routes. Client middleware (`middleware/auth.ts`) gates `/admin/**` routes. RBAC via `server/utils/rbac.ts` (Admin > Manager > Staff > ReadOnly).

⚠️ **Note**: `@sidebase/nuxt-auth` and `next-auth` are NOT installed (despite older docs). Custom auth is the only auth.

### Layouts
- `default.vue` — public-facing (SiteHeader, slot, SiteFooter, ModalAge)
- `admin.vue` — admin dashboard (AdminHeader, AdminSidebar, AdminBreadcrumbs, slot)

## Domain Model

Batches progress through up to 13 stages, customizable per recipe pipeline:

**Upcoming → Mashing → Fermenting → Stripping Run → Low Wines → Spirit Run → Distilling → Maceration → Filtering → Barrel Aging → Storage → Blending → Proofing → Bottled**

Each stage tracks stage-specific data (gravity, ABV, runs[], cuts, sampling notes). Batches link to Recipes (ingredients + pipeline template), Vessels (multi-slot containers), BulkSpirit (cooperage ledger), and ultimately Bottles (finished SKUs) via Production records. Stage definitions in `composables/batchPipeline.ts`.

⚠️ **Active refactor**: `PLAN-PIPELINE-REVAMP.md` (created 2026-05-07) replaces the current sequential-PUT transfer mechanics with an atomic `Transfer` ledger. **Don't suggest changes to `useBatchStore.advanceToStage`, `useVesselStore.transferBatch`, or `Vessel.contents[]` mutation patterns** until that plan begins. See `/gdc transfers` and `/gdc tech-debt`.

## Integrations (verified against `package.json`)

- **Square** — payment processing via `square` SDK; endpoints in `server/api/square/` (create-checkout, confirm-order, order-status, webhook). HMAC-verified webhook updates Event bookings.
- **Cloudinary** — image uploads via `cloudinary` SDK; route `/api/upload` (multipart, max 10MB, JPEG/PNG/WebP/GIF/PDF). All assets in `gdc/` namespace.
- **Meta Pixel** — Facebook analytics via `nuxt-meta-pixel` module
- **@nuxtjs/sitemap** — auto-generated sitemap (excludes admin)
- **@nuxt/image** — auto-resize/WebP conversion
- **Chart.js + vue-chartjs** — registered in `composables/useChartRegistration.ts` (NOT in `plugins/`)
- **v-calendar** — date picker (wrapped by `Site/SiteDatePicker.vue`)

**Not present** despite occasional references: Stripe (uses Square), socket.io, prisma, next-auth.

## Compliance (TTB + TABC)

Federal TTB Forms 5110.40/.11/.28 + Texas TABC monthly + excise. Reports computed from existing collections via `composables/useTABCCalculations.ts` (293 LOC) and `composables/useComplianceDeadlines.ts` (260 LOC). Will eventually source from the new `Transfer` ledger. See `/gdc compliance`.

## Style & Conventions

- Vue 3 Composition API with `<script setup lang="ts">` in all components
- Nuxt UI v4 components (UTable, UButton, UModal, UForm, etc.)
- Tailwind CSS v4 for styling; custom fonts Merriweather and Cormorant Garamond
- camelCase for functions/variables, PascalCase for components and types
- Lazy-load heavy components (`LazyPanel*`, `LazyModal*`, `LazySite*`)
- Validate at server boundaries with yup; use `sanitize()` + `validateObjectId()` first
- Throw `createError({ statusCode, statusMessage })` from server; catch + `getErrorMessage(err)` on client

## Display units (added 2026-05-08)

The app has a unit-preference system with two layers:
1. **Global default** — `useSettingsStore.units.{volume,strength,temperature,weight}` configured at admin Settings → Units
2. **Per-input override** — every input field has its own sticky unit selector that defaults to global but is independently changeable

**Storage is always canonical** (gallon, ABV%, °F, lb) for fields that don't already track their own unit. Many existing fields (recipe ingredients, vessel.contents) store the unit alongside the value — those are inherently polymorphic and use a different pattern.

### For displays — `useDisplayUnits()` composable

```ts
const u = useDisplayUnits()
{{ u.formatVolume(batch.volume) }}          // "100.00 gal" or "378.54 L"
{{ u.formatStrength(bottle.abv) }}          // "40.0%" or "80.0 proof"
{{ u.formatTemperature(reading.temp) }}     // "72°F" or "22°C"
{{ u.formatWeight(item.weight) }}           // "10.00 lb" or "4.54 kg"
```

### For canonical inputs — Form input components

When a field stores a single canonical number (e.g., `bottle.abv` as ABV%, `batch.fermentTemp` as °F), use the matching input wrapper. The user can switch units inline without changing the underlying value.

```vue
<FormVolumeInput v-model="recipe.batchSize" />        <!-- v-model = gallons -->
<FormStrengthInput v-model="bottle.abv" />            <!-- v-model = ABV % -->
<FormTemperatureInput v-model="ferment.temperature" />  <!-- v-model = °F -->
<FormWeightInput v-model="ingredient.weight" />       <!-- v-model = lb -->
```

Each input renders a number field + a tiny unit dropdown/toggle. Switching the unit converts the displayed number; v-model stays canonical. Per-instance default: `<FormVolumeInput :default-unit="'liter'" v-model="…" />`.

### For unit-tracked storage — keep existing pattern

Recipe ingredients (`{ amount, unit }`), vessel contents (`{ volume, volumeUnit }`), batch sizes (`{ batchSize, batchSizeUnit }`) all store the unit. Don't migrate those to FormVolumeInput — the unit IS data.

### Reference implementations
- `components/Transfer/TransferActionForm.vue` — every source/dest/loss row uses `<FormVolumeInput>` + `<FormStrengthInput>`. Each input has its own sticky unit selector. Form state is canonical (gallons + proof); engine receives canonical with no conversion at submit.
- `components/Panel/PanelBottle.vue` (ABV field) — `<FormStrengthInput>`

### Bridging Form*Input to schema fields
When a schema stores a unit different from the input's canonical (e.g., Transfer schema stores `proof`, FormStrengthInput's v-model is `abv`), bridge via a `computed({get, set})` proxy:
```ts
const sourceAbv = computed({
  get: () => (source.proof || 0) / 2,
  set: (abv) => emit('update', { proof: (abv ?? 0) * 2 }),
})
// Then: <FormStrengthInput v-model="sourceAbv" />
```

### Status (rollout incremental)
~30 components still hardcode display units (BatchDistillingRun, BatchFermenting, Card/*, Table/*, Report/*). Migrate as you touch them.

## Nuxt UI v4

Full reference at `.claude/NUXT_UI_REFERENCE.md` (legacy). Prefer the `/nuxt-ui [topic]` skill for current docs. Component-specific rules load automatically via `.claude/rules/nuxt-ui-components.md` when editing `.vue` files.

## Other available skills

- `/gdc [topic]` — codebase reference (this app)
- `/nuxt [topic]` — Nuxt 4 framework reference
- `/nuxt-ui [topic]` — Nuxt UI v4 component reference
- `/cocktail-menu` — menu strategy/optimization (separate from cocktail code)

## Context Optimization

When compacting, preserve: list of modified files, test commands used, current task state, batch lifecycle stage context, and any API/component patterns discussed. **Don't preserve general code descriptions** — load `/gdc {topic}` again instead.
