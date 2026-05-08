# GDC Tech Debt & Recommendations

Findings from a full-codebase audit (initial 2026-05-07; deepened 2026-05-07 cont'd). 60+ items, organized by priority. Every item includes evidence (file paths, often line refs) and a concrete recommendation.

> **Read this file before recommending any architectural changes.** The batch transfer system is partially built — the engine exists but most components still bypass it. See P1 §9–14 for what's done vs. what's still using old patterns.

---

## P0 — Security (act before next deploy)

### 1. Private TLS keys committed to git
- **Files**: `server.crt`, `server.key` (tracked in git, root of repo)
- **Risk**: If real production keys, anyone with repo access has the cert
- **Action**: Verify (`openssl x509 -in server.crt -noout -text`); rotate if real; `git rm` either way; add to `.gitignore`

### 2. `upload/[id].delete.ts` has zero auth
- **File**: `server/api/upload/[id].delete.ts`
- **Risk**: Anyone (including unauthenticated) can delete any Cloudinary asset whose `publicId` they know/guess
- **Action**: Add `requireRole(event, 'Admin','Manager','Staff')` at minimum

### 3. `contact/merge.post.ts` lacks Admin RBAC
- **File**: `server/api/contact/merge.post.ts`
- **Risk**: Any logged-in user can merge contacts (data destruction)
- **Action**: `await requireRole(event, 'Admin')`

### 4. `settings/index.get.ts` exposes distillery info publicly
- **File**: `server/api/settings/index.get.ts`
- **Exposed**: TTB & TABC permit numbers, distillery address, theme config
- **Action**: Gate behind session OR split public/admin variants

### 5. **(NEW) Square webhook HMAC uses string equality — timing attack**
- **File**: `server/api/square/webhook.post.ts:25`
- **Code**: `if (signature !== expectedSignature) { ... 401 }` — string comparison short-circuits, leaking timing info per byte
- **Risk**: Attacker can guess valid signatures byte-by-byte by measuring response times
- **Action**: Use `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))`. Pad to equal length first if needed.

### 6. **(NEW) Transfer + reporting-period routes lack RBAC**
- **Files**: `server/api/transfer/create.post.ts`, `server/api/transfer/[id]/reverse.post.ts`, `server/api/reporting-period/[period]/close.post.ts`, `server/api/reporting-period/create.post.ts`
- **Risk**: Any authenticated user can record TTB-regulated liquid movements or close a reporting period. The close endpoint comment even acknowledges "currently any authenticated user can close." This is a **TTB compliance issue** — period closure is the audit boundary.
- **Action**: `requireRole(event, 'Admin')` on close/reverse; `requireRole(event, 'Admin','Manager')` on create. Replace the "best-effort auth" try/catch in those handlers (they currently catch the auth failure and proceed with `createdBy` undefined, breaking the audit trail).

### 7. **(NEW) Public POST routes have no rate limiting**
- **Files**: `server/api/contact/inquiry.post.ts`, `contact/subscribe.post.ts`, `event/request.post.ts`, `square/create-checkout.post.ts`
- **Risk**: Spam / DoS — `auth/login.post.ts` is the only rate-limited route (5/15min/IP, in-memory)
- **Action**: Extract login's rate limiter into a reusable `server/utils/rateLimit.ts` and apply to all 4 routes. Note: in-memory map is useless on serverless; consider Upstash Redis or Netlify Edge.

### 8. **(NEW) `square/create-checkout.post.ts` skips sanitization**
- **File**: `server/api/square/create-checkout.post.ts:5-6`
- **Issue**: `readBody()` called without `sanitize()`. Frontend can send arbitrary objects with `$` operators or prototype pollution
- **Action**: Add `const body = sanitize(await readBody(event))` before use

### 9. **(NEW) `square/create-checkout` doesn't validate origin existence**
- **File**: `server/api/square/create-checkout.post.ts`
- **Issue**: Accepts `origin.type` and `origin.id` but doesn't verify the referenced Event exists, then creates a Square checkout pointing nowhere. Webhook later silently fails when no event is found.
- **Action**: `validateObjectId(originId)` + `await Event.exists({ _id: originId })` before calling Square

---

## P0 — Repo hygiene

### 10. `false/` — 36 files / 3.2 MB build output committed
- Cause: `nuxt build false` typo; `false` interpreted as output dir
- Action: `git rm -rf false/`

### 11. `Inventory (1).xlsx` in repo root (35 KB)
- Action: Move to private docs storage or delete

### 12. `dist/` directory committed
- Cause: gitignored later, but already tracked
- Action: `git rm -rf dist/`

### 13. Empty `tsconfig.ts` (typo for `.json`)
- Action: `git rm tsconfig.ts`

---

## P1 — Transfer system migration (CORRECTING first-audit error)

The first audit incorrectly claimed the transfer system was 0% implemented. **It is significantly built**:

- ✅ Engine: `server/utils/transferEngine.ts` (622 lines, MongoDB-session atomic), `transferEngineCore.ts`, `unitConverter.ts`
- ✅ Routes: `transfer/{create,index,[id],[id]/reverse}` + `reporting-period/{create,index,[period]/close}` (7 routes total)
- ✅ Store: `stores/useTransferStore.ts` (256 lines)
- ✅ `useBatchStore.advanceToStage()`, `startFirstStage()`, `revertToPreviousStage()` already route through `transferStore.create()` / `.reverse()`

**The gap is integration, not implementation.** 5 distillation components still call `useVesselStore.transferBatch*` directly, bypassing transactional safety, period locks, loss attestation, TTB account routing, and strict unit validation.

### 14. Components bypassing the Transfer Engine
| File | Line(s) | Pattern | Problem |
|---|---|---|---|
| `components/Batch/BatchAdvanceAction.vue` | 209-215, 222-228, 534-536 | `vesselStore.transferBatchContents/transferBatch` | No transaction; can mutate closed periods; no loss attestation |
| `components/Batch/BatchStrippingRun.vue` | 103-108 | `vesselStore.transferBatchContents` ×2 | Bug 3.1 from plan: "siphons unrelated batches" |
| `components/Batch/BatchDistilling.vue` | 143-156 | `vesselStore.transferBatchContents` ×2 | Same as above |
| `components/Batch/BatchSpiritRun.vue` | 93-98 | `vesselStore.transferBatchContents` ×2 | Same |
| `components/Panel/PanelVesselTransfer.vue` | 70, 72-77 | `vesselStore.fullTransfer/transferBatch` | Pre-engine code, not period-aware |

**Action**: Migrate each callsite to build a `TransferInput` and call `transferStore.create()`. Phase 7 of the plan.

### 15. Dual unit-conversion paths (one strict, one lenient)
- **Strict**: `server/utils/unitConverter.ts` — throws on unknown units (used by transferEngine)
- **Lenient**: `utils/conversions.ts.convertUnitRatio` — returns `1` for unknown unit pairs (silent corruption)
- **Active conflict**: `useVesselStore.transferBatch/transferBatchContents` still use lenient version. Components mix both, e.g. `BatchAdvanceAction.vue:214` passes raw `entry.volumeUnit` without normalization.
- **Action**: Migrate vessel-store transfer callers to engine (above). Then deprecate `convertUnitRatio` lenient fallback — make it throw too.

### 16. Proof drift via hardcoded `proof: 0`
- **File**: `stores/useBatchStore.ts:219` (in `advanceToStage`)
- **Issue**: Always passes `proof: 0` to destination. Engine then computes proof-weighted average on merge (`transferEngine.ts:179`) → first transfer to a new vessel anchors proof at 0, corrupting subsequent ABV recalculations.
- **Action**: Pass actual source proof through. Add a unit test for the proof-weighting path.

### 17. Hardcoded loss reason codes in UI
- **File**: `useBatchStore.ts:225` (and elsewhere) — `reasonCode: 'foreshots_heads_tails'` hardcoded
- **Issue**: No user attestation; every distilling advancement claims the same loss type. TTB audit trail is technically present but functionally meaningless.
- **Action**: Add a loss-reason picker to the UI (Phase 7). For now, document the hardcoded default in code comments so it's not silently misleading.

### 18. `useBatchStore` still writes deprecated `transferLog`
- **File**: `stores/useBatchStore.ts:72-73, 87-88`
- **Issue**: Manually appends to `Batch.transferLog[]` even though the Transfer collection is now the audit trail. `server/api/batch/[id].put.ts:14` blocks overwrites but doesn't clear writes.
- **Action**: Remove the `transferLog` writes once all migration in §14 lands. Field stays readable until migration sweep.

### 19. Disconnected schema fields
- `ReportingPeriod.ttbReportSnapshots` — schema field exists, never populated. Will be wired when Phase 8 (TTB form generation) lands.
- `Transfer.attachments` — schema supports BOL/gauge records; no upload UI exists yet
- `Transfer.gauging` — engine stores method/temperatureF/operator; no form collects them
- **Action**: Don't remove any of these — they're scaffolding for in-flight work. Document as "not yet wired" if anyone asks.

---

## P1 — Mid-revamp items (still hands-off)

### 20. `Batch.stageVolumes` shape change planned
- Currently `Map<String, Number>`; plan changes to `Map<String, {volume, proof}>`
- **Action**: Don't change the shape ad-hoc. Migration handled by the plan.

### 21. Deprecated fields kept readable
| Field | Status |
|---|---|
| `Batch.transferLog[]` | DEPRECATED — replaced by Transfer collection |
| `Vessel.previousContents` (string) | DEPRECATED — replaced by `previousContentsHistory[]` |
- **Action**: Don't remove until full migration sweep ships

---

## P1 — Documentation drift

### 22. CLAUDE.md was wrong (now corrected)
- ✅ Updated 2026-05-07: was claiming Stripe/socket.io/next-auth/Prisma/11-resources

### 23. MEMORY.md needed `/gdc` skill pointer
- ✅ Updated 2026-05-07

### 24. Stale planning docs at repo root
- `TODO_PLAN.md` (100% complete), `TODOS.md` (15/16 complete)
- **Action**: Move to `.claude/completed/`

### 25. **(NEW) First-audit findings about transfer system were wrong**
- `tech-debt.md` initial draft and `transfers.md` claimed engine was 0% built
- ✅ Corrected in this revision

---

## P2 — Dead code

### 26. Confirmed unused components (12)
`BatchTastingNotes`, `DashboardBrewing`, `DashboardDistilling`, `DashboardFermenters`, `DashboardUpcoming`, `ItemDetails`, `ItemPurchaseHistory`, `ModalDeleteConfirm`, `SiteMenuMain`, `TableInventoryBottles`, `TableInventoryInputs`, `TableInventoryItems`

### 27. Root-level component orphans (6)
- Delete: `ChartAllBottlesInventory.vue`, `ChartBottleInventory.vue`, `LandingProducts.vue`
- Move: `DatePicker.vue` → `Base/`, `ModalCalculators.vue` → `Modal/`, `Proofing.vue` → `Production/` or new `Calculator/`

### 28. Unused / superseded utility files
- `utils/vesselTransfer.ts` — duplicates `useVesselStore`; **delete**
- `utils/inventory.ts` — superseded by `useBottleStock`; verify imports then **delete**

### 29. Unused yup schema
- **File**: `server/utils/validation.ts` (around line 425-431)
- `inventoryCategoryDefSchema` defined but no route imports it
- **Action**: Wire into `settings/index.put` (which validates partial settings updates), or delete

### 30. Installed but unused packages
- `@stripe/stripe-js` — app uses Square. **Remove from package.json**

### 31. Unimplemented runtime config
- `runtimeConfig.public.wsUrl` — no WebSocket code anywhere. **Remove declaration in `nuxt.config.ts`**

---

## P2 — Inconsistencies

### 32. API param naming (`[id]` vs `[_id]`)
- `[id]`: batch, cocktail, contact, event, message, production, vessel, upload, transfer
- `[_id]`: bottle, bulkSpirit, inventory, item, purchaseOrder, recipe, users
- **Action**: Don't rename existing routes; standardize on `[id]` for new ones

### 33. Page param same drift — documented in `conventions.md`

### 34. 5 hardcoded inventory category pages duplicate `[slug].vue`
- `bar-supplies.vue`, `botanicals.vue`, `bottling.vue`, `ingredients.vue`, `other.vue`
- All use the same template (header + `TableInventoryCategory`) with only the title differing
- **Action**: Delete all 5; rely on `[slug].vue` only

### 35. `latestPrice()` lives in two places
- `composables/useItemStore.ts.latestPrice()` (reactive, uses cache)
- `utils/helpers.ts.latestPrice()` (pure, slower)
- **Action**: Pick store version as canonical; have `helpers.ts` re-export or delete

### 36. Two `errorMessage.ts` files — NOT a duplicate
- `utils/errorMessage.ts` (client `getErrorMessage`) vs `server/utils/errorMessage.ts` (server `isH3Error`)
- Different layers. Consider renaming server's to `errorTypes.ts` for clarity.

### 37. **(NEW) Response-shape inconsistency across routes**
- `createCreateHandler` returns the doc directly
- `createDeleteHandler` returns `{ message: "..." }`
- `transfer/create` returns `{ transfer, batch, updatedVessels }`
- `reporting-period/[period]/close` returns the period doc
- `auth/login` returns `{ user }`
- **Action**: Pick one envelope (`{ data }` or raw doc) and apply consistently. Lower priority — clients handle the variance today.

### 38. **(NEW) Only 2 yup schemas use `.noUnknown()`**
- `messageCreateSchema:254` and one other (line ~401) reject unknown fields
- 13+ other schemas accept arbitrary extra fields silently
- **Risk**: Typos in client code go unnoticed; potential vector for prototype pollution if `sanitize()` ever misses something
- **Action**: Add `.noUnknown()` to all create/update schemas

---

## P2 — Component complexity (NEW)

### 39. Oversized components (>300 lines, top offenders)
| Component | Lines | What to extract |
|---|---|---|
| `BatchAdvanceAction.vue` | 928 | 4 separate stage workflows; pull each into a composable (`useBarrelAgingAdvance`, `useDistillingAdvance`, `useBulkStorageCompletion`); extract repeated volume-input pattern (3×) into `FormVolumeInput.vue` |
| `BatchBarrelAging.vue` | 851 | Extract `BarrelAgingCard.vue` (per-barrel collapsible), `ModalBarrelExit.vue`, `ModalBarrelAdvanceConfirm.vue`, `BarrelCostBreakdown.vue` |
| `BatchDistillingRun.vue` | 667 | Extract `DistillingCutsForm.vue`, `DistillingCutsDisplay.vue`, `DistillingAdditionsForm.vue`; move completion logic to `useCompleteDistillingRun` |
| `pages/admin/recipes/[_id].vue` | 550 | Extract `BatchIngredientEditor.vue` child component; move cost calc to `useRecipeCostCalculator` |
| `BatchDistilling.vue` | 508 | Same split pattern as `BatchDistillingRun` |
| `ReportTTBExciseTax.vue` | 493 | Extract `useCBMARateCalculation`, `TaxCalculationTable.vue` |
| `ModalDistillingCharge.vue` | 410 | Extract `ChargeVesselSelector.vue`, `useStillCapacity`, `useSourceVesselOptions` |
| `pages/admin/batch/[_id].vue` | 391 | 25+ computed properties + 14 stage render sections; create `useBatchDetail` composable + `BatchStageCard.vue` component |
| `ReportTTBProduction.vue` | 388 | Extract `useTTBProductionReport(month)` |
| `BatchMaceration.vue`, `Dashboard/DashboardBatchPipeline.vue`, `PanelPurchaseOrder.vue`, `BatchFermenting.vue`, `PanelProduction.vue`, `BatchBlending.vue`, `ReportTABCExciseTax.vue`, `ModalBarrelFill.vue` | 300-370 | Each has inline calculation that should move to a composable |

### 40. Stage components are repetitive
- `BatchMashing`, `BatchFermenting`, `BatchBlending`, `BatchStorage`, `BatchProofing` follow ~identical structure (header + edit toggle + display/edit form + footer) with only the field list differing
- **Action**: Extract `BatchStageCard.vue(stageName, fields, schema)` shell; per-stage components define just the field list + validation. Could collapse 5 components into 1 + 5 schemas.

### 41. Missing reusable form primitives
| Pattern | Repetitions | Suggested component |
|---|---|---|
| Volume + unit + max-button | 3+ in BatchAdvanceAction alone | `FormVolumeInput.vue` |
| Label + value grid cell (`<div class="grid grid-cols-2 sm:grid-cols-4">…<span class="text-xs text-parchment/60">Label</span><span>Value</span>…</div>`) | 30+ across components | `DataRow.vue` |
| Save/Cancel button pair | 34 occurrences | `FormFooter.vue` (props: `saving`, emits: `cancel`, `submit`) |
| Source-barrel selector | BatchAdvanceAction + BatchBarrelAging | `useSourceBarrelSelector.ts` composable |

### 42. Card duplicates
- `Bottle/BottleCard.vue` (74 lines, admin) vs `Card/CardBottle.vue` (57 lines, public) — ~80% overlap
- `Cocktail/CocktailCard.vue` (57) vs `Card/CardCocktail.vue` (45) — same pattern
- **Action**: Merge each pair into `CardBottle.vue` with `variant: 'admin' | 'public'` prop. Public variant omits edit actions, uses cream styling.

### 43. Inconsistent SiteDatePicker usage
- 13 callsites; props vary across them
- **Action**: Standardize on `<SiteDatePicker v-model="date" label="X" />` and audit each call

### 44. Dollar formatter imported per-file
- `utils/formatting.ts.Dollar` is imported individually in dozens of components
- **Action**: Either provide via a Nuxt plugin (`useDollar()` composable) or accept the imports as fine. Lower priority.

---

## P2 — Stores & pages refactoring (NEW)

### 45. `useBatchStore.ts` (815 lines) bundles unrelated concerns
- **Pipeline orchestration** ✓ (correctly delegates to transferStore)
- **Inventory withdrawal** ❌ — `withdrawBulkSpirits()` (lines ~599-700) and `withdrawMashIngredients()` (lines ~700-745) call `recipeStore`, `itemStore`, `inventoryStore` and write multiple records non-atomically. If any intermediate write fails, batch state can drift.
- **Distilling-run management** (lines 321-447, 494-545) — could be its own composable
- **Action**: Extract `composables/useBatchPipelineService.ts` for withdrawal logic with a transaction wrapper. Extract `composables/useBatchDistillingRuns.ts` for run CRUD.

### 46. `useBatchStore.findVesselsContaining()` duplicates work
- **File**: `useBatchStore.ts:126-137`
- Cross-store O(n*m) loop iterating vessel store from inside batch store
- **Action**: Move to `useVesselStore.getVesselsContainingBatch(batchId)` getter — single store owns the lookup

### 47. `recomputeLowWines()` is a pure function in a Pinia store
- **File**: `useBatchStore.ts:374-402`
- Calculates aggregate stats from runs; doesn't mutate state
- **Action**: Move to `utils/distillingRunCalc.ts`

### 48. `useTransferStore.syncBatchAndVesselStores` reaches into other stores
- **File**: `stores/useTransferStore.ts:173-208`
- Directly assigns to `batchStore.crud.items.value` / `vesselStore.crud.items.value`
- **Verdict**: Works (intentional shallow-replace pattern), but violates SRP and is fragile if `crud` factory internals change
- **Action**: Add an `upsert(doc)` method to the `useCrudStore` factory; have `syncBatchAndVesselStores` call that instead. Alternatively, introduce an event bus / observer pattern.

### 49. `pages/admin/recipes/[_id].vue` (550 lines) inlines cost calc
- 6-8 nested calls to `latestPrice()`, `ingredientCost()`, `bulkSpiritIngredientCost()` directly in setup
- **Action**: Move to `composables/useRecipeCostCalculator(recipe)`. Extract ingredient editor to its own component.

### 50. `pages/admin/batch/[_id].vue` has 36 declarations + 14 stage render sections
- 25+ computed mirror logic from `composables/batchPipeline.ts`
- Per-stage editing state managed as ad-hoc `Set<string>` in the page
- **Action**: Extract `composables/useBatchDetail(batchId)` + `components/BatchStageCard.vue`

### 51. `pages/admin/controls.vue` (343 lines) — verbose watch callbacks
- 7+ `watch()` callbacks each logging an equipment state change to `/api/equipmentLog`
- **Action**: Extract `composables/useEquipmentLogging(controls)` returning a single `watchAllControls()` function

### 52. Page-store coupling not extreme but worth a pass
- Most admin detail pages import 3-5 stores. Acceptable, but a `useBatchWorkflow(batchId)` composable that aggregates stores into a unified API (`{ batch, vessels, production, advance, save }`) would simplify components.

---

## P2 — Server quality (NEW)

### 53. `validateObjectId()` placement is inconsistent
- Some routes call it inside the handler before the query
- Factory-generated routes do it inline within `findById`
- Consider auto-validating in the `extractId()` helper itself

### 54. Migration routes lack run-once guards
- **Files**: `batch/deduplicate-pipelines.post.ts`, `batch/migrate-distilling-stages.post.ts`, `recipe/backfill-pipelines.post.ts`
- Idempotent (skip-if-already-applied logic) but no version flag or run-lock; concurrent runs could conflict
- Each does N round-trips (`.find().forEach(.save())`) instead of `bulkWrite()`
- **Action**: Add a `Settings.migrationsRun: string[]` flag set after each successful run. Document each route as one-time admin op in `/gdc api`.

### 55. `square/webhook` JSON.parse can throw
- **File**: `server/api/square/webhook.post.ts:29`
- No try/catch — malformed JSON crashes with 500
- **Action**: Wrap in try/catch, return 400. (Square retries 4xx, so don't mask real issues.)

### 56. Mongoose query patterns not audited for `.lean()`
- Many GET routes use `.lean()` via `createGetAllHandler`; some custom routes don't (e.g. event populates contact without `.lean()`)
- N+1 pattern: `bottle/public.get.ts` aggregates inventory per bottle — works but worth profiling at scale
- **Action**: Add `.lean()` to read-only routes; profile per-bottle inventory aggregation if list grows

### 57. `auth/login.post.ts` rate limiter is in-memory
- Lost on serverless invocation. Effectively no-op on Netlify Functions.
- **Action**: Migrate to Upstash Redis or Netlify Edge rate limiting. Apply same pattern to public POSTs (#7).

---

## P2 — Type & schema drift

### 58. `EquipmentLog` has no TypeScript interface
- Schema exists; `types/interfaces/EquipmentLog.ts` missing
- **Action**: Generate the interface; add to `types/index.ts` barrel

### 59. `BulkSpirit` ObjectId-vs-string typing — cosmetic; no action

---

## P2 — Code quality (NEW)

### 60. ~250 `any` type annotations
- Worst patterns:
  - `(batch?.stages as any)?.X.Y` — polymorphic stage access (3+ files). Suggests a need for a typed `getStageData<K>(batch, stage)` helper
  - `(window as any).print()` in `reports/tabc-excise-tax.vue:33` — should be guarded with `import.meta.client`, no cast needed
  - Event handler params: `(_e: Event, row: any)` in UTable callbacks — Nuxt UI provides typed callbacks
  - `evt: any` and `event: any` in store action signatures — weak typing
- **Action**: Type stage access (highest leverage); fix UTable handlers (template change); audit auth-store/event-store evt params

### 61. Repeated date sort logic (15+ occurrences)
- Pattern: `sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())`
- Files: `pages/admin/customers/[_id].vue:22`, `useItemStore.ts:108,120`, `ReportInventoryTable.vue:21,51`, etc.
- **Action**: Add `utils/sortByDateDesc.ts` and replace

### 62. Contact name formatting duplicated
- Pattern: `businessName || \`${firstName} ${lastName}\`.trim()` — 3+ files
- **Action**: Add `utils/formatContactName.ts`

### 63. Magic numbers
| Value | Where | Should be |
|---|---|---|
| $2.70 / $2.40 | TTB/TABC tax rate strings in report components | `constants/taxRates.ts` |
| 100,000 | CBMA Tier 1 PG limit | `CBMA_TIER1_LIMIT_PG` |
| 9.6 mL/gallon | (verify location) | named constant |
| ×2 reorder multiplier | `useItemStore.ts:153` | `REORDER_SAFETY_MULTIPLE` |
| Page sizes 20/50/100 | scattered | `constants/pagination.ts` |
| 900000 ms (15 min) | `auth/login.post.ts` rate limit window | named constant |
| `'gdc:batch-detail-view'` localStorage key | `pages/admin/batch/[_id].vue:8` | `STORAGE_KEYS.BATCH_VIEW` |

### 64. Store actions catch + toast but don't re-throw (8-10 cases)
- Components can't tell if the action failed; downstream logic continues
- **Action**: Add `throw error` after the toast, or change return to `Promise<boolean>`. Component decides UI handling.

### 65. Missing `console.error` on caught errors
- Several stores show toast but don't log to console for debugging
- **Action**: Always `console.error('[storeName.actionName]', error)` in catch blocks

### 66. `console.log/warn` in production paths (audit)
- 16 instances in non-script code; mostly server-side `console.error` (acceptable for now)
- `useBatchStore.ts:218,230` — `console.warn` for batch logic issues; should use a structured logger
- `auth/login.post.ts:34,61` — `console.warn` for auth failures including IPs (privacy / log hygiene)
- **Action**: Lower priority; add structured logger when scaling beyond single-instance

### 67. Direct DOM manipulation in Vue
- `pages/admin/batch/[_id].vue:172` — `document.getElementById(stageAnchor(stage))` for scroll-to
- **Action**: Use template refs + `scrollIntoView()` instead

### 68. `@deprecated` JSDoc tags exist
- `types/interfaces/Vessel.ts:36` (`previousContents`)
- `types/interfaces/Batch.ts:299` (`transferLog`)
- **Action**: Verified unused in critical paths; keep until migration sweep ships

---

## P3 — Test coverage

### 69. ~1% test coverage
- 5 test files (composables/definitions, server/validation, utils/{conversions, formatting, proofGallons})
- **Highest-leverage targets** (use `test-writer` subagent):
  1. `server/utils/transferEngine.ts` — atomic mutation correctness, period-lock enforcement, reversal semantics
  2. `server/utils/transferEngineCore.ts` — invariant validation, totals computation
  3. `server/utils/unitConverter.ts` — strict throw behavior
  4. `composables/useTABCCalculations` — compliance correctness
  5. `composables/useProductionCosts` — tax math
  6. `composables/useCrudStore` factory — everything else depends on it
  7. `useBatchStore.advanceToStage` integration test against transferEngine

### 70. No CI / pre-commit
- No `.github/workflows`, no Husky / lint-staged
- **Action**: Add GitHub Actions: `npm test` + `nuxt typecheck` on PR. Pre-commit hook for typecheck if commits are slow.

---

## P3 — Quality-of-life

### 71. Inventory status badge doesn't reactively refresh
- TODOS.md leftover; status field (In/Low/Out) doesn't refresh on inventory change
- **Action**: Reproduce → use `pro-debugger`. Likely a computed depending on `items.value` length/identity not changing.

### 72. Bot detection on `contact/inquiry` is silent-accept
- Honeypot + 3s min delay; failures return 200 OK without saving
- **Risk**: Drops legitimate fast submitters
- **Action**: Increase leniency or return generic error. Monitor false-positive rate first.

### 73. Production cost edit doesn't re-adjust inventory
- `useProductionStore.adjustInventoryForProduction` runs only on create
- **Action**: Reverse-and-replay deltas on update, or disable post-create quantity edits

---

## Recommended cleanup order

1. **P0 security same-day** — items 1-4 plus #5 (timing-safe HMAC), #6 (RBAC on transfer/period routes), #8 (sanitize square/create-checkout)
2. **P0 repo hygiene same-day** — #10-13 in one commit
3. **P1 docs** — already done
4. **P1 transfer migration** — items 14-18 across multiple PRs (one component family at a time). Highest impact: §14 BatchStrippingRun/Distilling/SpiritRun (Bug 3.1 from plan)
5. **P2 dead code** — single cleanup PR: #26-31 + #34
6. **P2 component complexity** — start with #41 (extract `FormVolumeInput`, `DataRow`, `FormFooter` — high reuse, low risk), then tackle the largest components (#39)
7. **P2 stores** — #45-47 (extract withdrawal service, vessel-lookup getter, distilling-run calc utils)
8. **P2 server quality** — #38 noUnknown, #54 migration guards, #55 webhook try/catch, #57 rate limit util
9. **P2 inconsistencies** — #34, #35, #37 (response shape — bigger refactor, last)
10. **P2 type drift** — #58 (EquipmentLog interface)
11. **P3 tests** — start with transferEngine + unitConverter + useCrudStore
12. **P3 code quality** — #60-67 ongoing

## What NOT to clean up

- `Batch.transferLog`, `Vessel.previousContents` — backward-compat fields
- `Transfer.attachments`, `Transfer.gauging`, `ReportingPeriod.ttbReportSnapshots` — wired-but-unused; Phase 8+ work will populate them
- `composables/transferDefinitions.ts` — used everywhere
- `utils/distillingMigration.ts` — actively used by reports for legacy data
- `OLD FILES/` — user-curated for rework

## Open questions to resolve

- Should the transfer-engine migration (§14) happen before or after splitting the oversized batch components (#39)? Splitting first creates more files to migrate; migrating first leaves giant components even longer. **Recommendation**: split first using thin wrappers, then migrate each wrapper to engine — yields smaller diffs.
- Settings model for migration tracking (#54) — `Settings.migrationsRun: string[]` vs separate `MigrationRun` collection? Lighter weight to use settings flag for this distillery's scale.
- Whether to add a structured logger (#65, #66) now or wait for scale — wait, but use a wrapper composable so the swap is single-file.
