# Nuxt Data Flow Memory

## Project Architecture
- 13 Pinia stores (batch, bottle, cocktail, contact, event, inventory, item, production, purchaseOrder, recipe, settings, user, vessel)
- All use lazy loading: `loaded` ref + `ensureLoaded()` pattern
- Stores use `$fetch` in actions, local state mutation after CUD ops
- `layouts/admin.vue` loads ALL 12 stores in parallel via `Promise.all`
- `layouts/default.vue` loads 3 stores (bottle, cocktail, item)

## Audit Findings (2026-02-27)
- Detailed audit in `audit-2026-02-27.md`
- Key issues: inconsistent error re-throw, `any` casts in batch stages, duplicate sort/stock logic, `new Date()` in default state (hydration risk on SSR pages), `$fetch` in controls.vue setup, duplicate `setBottle`/`selectBottle`, missing `setContact`/`setEvent`

## Key Patterns
- Stores follow consistent pattern: items ref, loading ref, saving ref, CRUD actions
- 6/13 stores re-throw errors from update; 7/13 silently swallow them
- Error description field: 3 stores use `statusMessage || message`, 10 use only `message`
- `JSON.stringify(body)` inconsistency: some stores wrap body, some pass raw objects
- `useFormPanel` composable relies on stores re-throwing for proper error handling

## Completed Fixes
- Phase 1.4: SSR empty sections on homepage — replaced `onMounted` + `Math.random()` in `SiteFeaturedSpirits` and `SiteFeaturedCocktails` with `computed` + `seededShuffle()` (date-based seed in `utils/seededShuffle.ts`). Featured items now render during SSR.

## Notes
- Admin pages are SPA (`ssr: false`), so SSR hydration issues are minimal in practice
- Public pages (menu, bottles) use SSR - `new Date()` in default state not a concern since those stores don't initialize with dates
- `convertUnitRatio` in utils/conversions.ts is used by 21 files; also wrapped by `useUnitConversion` composable
- `utils/` exports are auto-imported in Nuxt components (e.g. `Dollar`, `seededShuffle`); explicit imports only needed in `composables/` and `server/`
