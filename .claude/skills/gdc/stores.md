# GDC Stores & State

17 Pinia stores in `stores/`. 16 use the `useCrudStore` factory; 1 (Settings) is a singleton.

## The factory: `composables/useCrudStore.ts` (200 lines, ⭐ critical)

Single source of truth for CRUD operations. Used by 16/17 stores.

```ts
useCrudStore<T>({
  name: 'foo',                              // pinia store name
  apiPath: '/api/foo',                      // base path (factory appends /:id, /create)
  defaultItem: { ... },                     // shape for resetItem()
  sort?:  (a, b) => number,                 // optional list sort
  beforeCreate?: (item) => item,            // mutate before POST
  beforeUpdate?: (item) => item,            // mutate before PUT
  resetOnSave?: boolean,                    // clear `item` after save
})
```

Returns: `items`, `item`, `loading`, `saving`, `loaded`, `getAll()`, `ensureLoaded()`, `setItem()`, `resetItem()`, `saveItem()`, `deleteItem()`, `getById()`. Toast feedback built-in. Errors thrown so callers can catch.

## Stores

| Store | LOC | Pattern | Notes |
|---|---|---|---|
| `useBatchStore` | 815 | CRUD + heavy domain logic | ⭐ Most complex. Stage advancement, vessel-aware transfers, ingredient withdrawal, distilling runs CRUD. ⚠️ Mid-revamp — `advanceToStage()`, `transferBatch()` will become wrappers. |
| `useBottleStore` | 67 | CRUD | `getName()`, `bottleNameId`, `activeBottles`, strips empty `recipe` field |
| `useBulkSpiritStore` | 179 | CRUD + domain | `deposit()`, `withdraw()` actions; weighted-avg cost/ABV math |
| `useCocktailStore` | 87 | CRUD + domain | `search()`, `toggleVisibility()`, `cocktailCost()` |
| `useContactStore` | 87 | CRUD + domain | `getVendors()`, `getCustomers()`, `getNewsletterSubscribers()`, `mergeCustomers()` (calls `/api/contact/merge`) |
| `useEventStore` | 52 | CRUD + filters | `getByStatus()`, `getEventsByContact()`, `pendingEvents` count |
| `useInventoryStore` | 163 | CRUD + filters | `loadItemHistory()`, `getCurrentStock()`, `getTotalQuantity()` (unitSize-aware), `createBulk()`, default 400-day window |
| `useItemStore` | 197 | CRUD + domain | `shoppingListItems` computed (low-stock + suggested order qty), `latestPrice()` (PO history → manual fallback), `getVendorName()` |
| `useMessageStore` | 91 | CRUD + domain | `unreadCount`, `markAsRead/Unread()`, `getMessagesByTopic()` |
| `useProductionStore` | 192 | CRUD + side effects | `createAndReturnId()`, `adjustInventoryForProduction()` (writes inventory deltas, updates Bottle.inStock) |
| `usePublicBottleStore` | 49 | **Standalone** (no useCrudStore) | Read-only; fetches `/api/bottle/public`; minimal API |
| `usePublicCocktailStore` | 56 | **Standalone** (no useCrudStore) | Read-only; fetches `/api/cocktail/public`; `search()` |
| `usePurchaseOrderStore` | 120 | CRUD + side effects | `receivePurchaseOrder()` — converts PO to inventory records (unit-aware), updates stock |
| `useRecipeStore` | 33 | CRUD | Thinnest store — pure pass-through |
| `useSettingsStore` | 109 | **Singleton** (not array) | `settings` ref (not `items`); `fetchSettings()`, `updateSettings()`. Holds inventory categories, barrel age defaults, theme, distillery info |
| `useUserStore` | 37 | CRUD | `beforeUpdate` strips empty password (don't overwrite hash) |
| `useVesselStore` | 353 | CRUD + heavy domain | `emptyVessel()`, `disposeBarrel()`, `fullTransfer()`, `transferBatch()`, `transferBatchContents()`, `addContents()`, computed: `fermenters`, `mashTuns`, `stills`, `tanks`, `barrels`, `emptyBarrels`. ⚠️ Mid-revamp. |

## Composables (state-related, in `composables/`)

| File | LOC | Purpose |
|---|---|---|
| `useAuth.ts` | 39 | `useState('auth-user')`; `login()`, `logout()`, `fetchUser()` from `/api/auth/me`. SSR-safe. |
| `useCrudStore.ts` | 200 | The factory — see above |
| `useFormPanel.ts` | 33 | Slide-over form state (open, close, submit) used by all 14 Panels |
| `useDeleteConfirm.ts` | 14 | Promise-returning confirm modal wrapper |
| `useFileUpload.ts` | 42 | Wrapper for `/api/upload` POST (Cloudinary) |
| `useCommandPalette.ts` | 8 | Cmd+K palette state |
| `useKeyboardShortcuts.ts` | 138 | Global shortcuts registration |
| `useSidebarBadges.ts` | 28 | Notification counts on admin sidebar items |
| `modalStatus.ts` | 8 | Global modal open/close flags |
| `useChartRegistration.ts` | 35 | Chart.js component registration (one-time) |
| `useTableHelpers.ts` | 182 | TanStack Table helpers — column definitions, sorting, filtering helpers |
| `useCocktailOptions.ts` | 86 | Glassware, garnish, prep dropdown options |
| `useRecipeColors.ts` | 65 | Color scheme per recipe class (rum=brown, gin=green, etc.) |
| `useInventoryCategories.ts` | 90 | Category lookup w/ settings store fallback; stock status helpers |
| `useItemCategories.ts` | 24 | Slim wrapper exposing item categories from settings |
| `dark.ts` | 4 | Re-exports `isDark`, `toggleDark`, `preferredDark` from VueUse |

## Pure helpers (composables that aren't reactive)

| File | LOC | Purpose |
|---|---|---|
| `batchPipeline.ts` | 290 | ⭐ Stage definitions: `ALL_STAGES`, `PIPELINE_TEMPLATES`, `STAGE_KEY_MAP`, `STAGE_DISPLAY`, `STAGE_VESSEL_TYPE`, plus volume helpers |
| `transferDefinitions.ts` | 205 | ⭐ TTB enums: `TRANSFER_TYPES`, `LOSS_REASON_CODES`, `TTB_ACCOUNTS`, `STAGE_TO_TTB_ACCOUNT`, `GAUGING_METHODS`, `getReportingPeriodForDate()`, `proofGallons()`, `abvToProof()` |
| `definitions.ts` | 286 | Dropdown configs: `BARREL_SIZES`, `CHAR_LEVELS`, `PO_STATUS_OPTIONS`, `CONTACT_TYPES`, `EVENT_TYPES`, liquor classes, `BARREL_AGE_DEFAULTS` (Proxy with settings fallback), `estimateCocktailPrice()` |
| `status.ts` | 20 | `useAgeVerification()` SSR-safe localStorage; `BATCH_STAGES` derived from STAGE_DISPLAY |

## Calculation composables

| File | LOC | Purpose |
|---|---|---|
| `useTABCCalculations.ts` | 293 | Texas TABC monthly report generator (4 sections: production / materials / disposition / storage) |
| `useComplianceDeadlines.ts` | 260 | Compliance calendar (TTB + TABC + FET + permit renewals) with urgency levels |
| `useProofingCalculator.ts` | 114 | Interactive proofing-down calculator (multi-step water additions) |
| `useProductionCosts.ts` | 198 | Multi-component cost breakdown (batch + barrel + bottling + TTB excise + TABC excise) |
| `useUnitConversion.ts` | 54 | Reactive wrapper around `utils/conversions.ts` |
| `useBottleStock.ts` | 94 | 12-month trailing depletion analysis; months-remaining metric |
| `useIngredientResolver.ts` | 84 | Resolve ingredient.item — works for both Item and Bottle ingredient sources |

## Utils (`utils/`)

| File | LOC | Purpose |
|---|---|---|
| `conversions.ts` | 123 | ⭐ Master unit table: `convertUnitRatio`, density math (ABV-aware), `proofing()`, `stepProofing()`, `proofingDown()` |
| `proofGallons.ts` | 25 | `toGallons()`, `calculateProofGallons(volume, unit, abv)` — TTB standard |
| `units.ts` | 80 | Unit metadata: `allUnits`, `volumeUnits`, `weightUnits`, `formatWithUnits()`, `formatInventoryQuantity()` |
| `formatting.ts` | 15 | `Dollar` formatter, `formatVolume()` |
| `helpers.ts` | 93 | `latestPrice()` (PO → manual fallback), `recipePrice()`, `bulkSpiritIngredientCost()`, `latestProduction()`, `bottleCost()`. ⚠️ `latestPrice()` duplicates logic in `useItemStore`. |
| `errorMessage.ts` | 20 | ⭐ Client-side `getErrorMessage(err)` — handles FetchError, Error, unknown |
| `distillingMigration.ts` | 63 | `normalizeDistillingRuns()` — legacy single-run → multi-run array. Used by reports + distilling component. |
| `inventory.ts` | 46 | `bottleStockCheck()`, `currentStock()`. ⚠️ Likely superseded by `useBottleStock.ts` — verify before deleting. |
| `vesselTransfer.ts` | 60 | `transferBatch()`, `fullTransfer()`. ⚠️ **Unused** — `useVesselStore` has the canonical implementations. Dead code. |
| `seededShuffle.ts` | 42 | Deterministic Fisher-Yates shuffle (used for daily-rotating featured cocktails on home page) |

## Server-side counterpart

`server/utils/errorMessage.ts` (9 lines) — `isH3Error()` type guard. **Not a duplicate** of client's `errorMessage.ts` — different purpose, different layer.
