# GDC Future Improvements Plan

A comprehensive plan for the next round of improvements to the Galveston Distilling Co application, covering security hardening, bug fixes, public site polish, testing, data model upgrades, file uploads, and remaining feature gaps.

---

## Table of Contents

1. [Phase 1: Critical Security & Bug Fixes](#phase-1-critical-security--bug-fixes)
2. [Phase 2: API Hardening & Data Model](#phase-2-api-hardening--data-model)
3. [Phase 3: Public-Facing Site](#phase-3-public-facing-site)
4. [Phase 4: File Upload System](#phase-4-file-upload-system)
5. [Phase 5: Missing Detail Pages & Feature Gaps](#phase-5-missing-detail-pages--feature-gaps)
6. [Phase 6: Testing](#phase-6-testing)
7. [Phase 7: Performance & DevOps](#phase-7-performance--devops)
8. [Phase 8: Accessibility & Polish](#phase-8-accessibility--polish)
9. [Phase 9: TTB Compliance & Advanced Reporting](#phase-9-ttb-compliance--advanced-reporting)

---

## Phase 1: Critical Security & Bug Fixes

**Goal**: Fix actively dangerous issues — forgeable auth, password hash leaks, and data corruption bugs.

### Step 1: Server-Side Session Authentication

**Problem**: The current auth system stores `{ authenticated: true }` in a plain cookie set client-side. Anyone can forge this cookie and bypass all authentication. This provides zero actual protection.

**Solution**: Replace with server-side sessions using signed/encrypted cookies.

**Files to create:**
- `server/utils/session.ts` — session helpers using `h3`'s `useSession()` or `unstorage` with a server-side session store

**Files to modify:**
- `server/middleware/auth.ts` — validate session server-side (check session store, not cookie JSON)
- `server/api/users/find.put.ts` (login) — create server-side session on successful login, set signed session cookie
- `composables/useAuth.ts` — login/logout calls API and reads session state from a `/api/auth/me` endpoint instead of setting cookies directly
- `nuxt.config.ts` — add `nitro.storage` config for session store (can use memory for dev, MongoDB for prod)

**Implementation details:**
- Use `h3`'s built-in `useSession(event, { password: process.env.SESSION_SECRET })` which provides encrypted cookies
- Login endpoint: verify bcrypt password, create session with `{ userId, email, authenticated: true }`
- Auth middleware: call `useSession()` to decrypt and validate, reject if invalid
- Add `SESSION_SECRET` env var (32+ character random string)
- Create `/api/auth/me` GET endpoint that returns current user from session (no password)
- Create `/api/auth/logout` POST endpoint that destroys session

### Step 2: Strip Password Hashes from Users API

**Problem**: `GET /api/users` returns full user documents including bcrypt password hashes. Any authenticated user can read all passwords.

**Files to modify:**
- `server/api/users/index.get.ts` — add `.select('-password')` to the query
- `server/api/users/[_id].get.ts` (if exists) — same treatment

### Step 3: Fix Vessel ABV Calculation Bug

**Problem**: In `stores/useVesselStore.ts` (line 81-87), the weighted ABV calculation divides by `contents.length` (count of items) instead of total volume. This produces incorrect ABV values when blending.

**Current (wrong):**
```javascript
abv: contents.map(c => (c.abv * c.volume) / 100).reduce((acc, curr) => acc + curr, 0) / contents.length
```

**Correct:**
```javascript
const totalVolume = contents.reduce((acc, c) => acc + c.volume, 0);
abv: totalVolume > 0
  ? contents.reduce((acc, c) => acc + (c.abv * c.volume), 0) / totalVolume
  : 0
```

**Files to modify:**
- `stores/useVesselStore.ts` — fix `updateVessel()` ABV calculation

### Step 4: Fix Missing Stripe Return Page

**Problem**: After Stripe checkout, customers are redirected to `/return?session_id=...` which is a 404.

**Files to create:**
- `pages/return.vue` — read `session_id` from query, call `/api/stripe/checkout-session` to verify payment, display confirmation or error

**Files to modify:**
- `server/api/stripe/create-checkout-session.js` — move hardcoded price ID to env var (`STRIPE_PRICE_ID`), convert to TypeScript

### Step 5: Remove Stripe Debug Endpoint

**Files to delete:**
- `server/api/stripe/stripe.ts` — debug endpoint that serves no purpose

### Step 6: Fix `convertUnitRatio` Error Handling

**Problem**: `utils/conversions.ts` throws `TypeError` on unknown unit pairs with no fallback.

**Files to modify:**
- `utils/conversions.ts` — add guard: return `1` (or throw a descriptive error) when `fromUnit` or `toUnit` is not in the conversion map

---

## Phase 2: API Hardening & Data Model

**Goal**: Add validation to all update endpoints, fix error handling, add timestamps and indexes, clean up data model mismatches.

### Step 7: Add Validation to All PUT Endpoints

**Problem**: `validateBody()` is only called on POST (create) endpoints. All 11 PUT (update) endpoints accept arbitrary data.

**Files to modify (add `validateBody()` calls):**
- `server/api/batch/[id].put.ts`
- `server/api/bottle/[_id].put.ts`
- `server/api/cocktail/[id].put.ts`
- `server/api/contact/[id].put.ts`
- `server/api/inventory/[_id].put.ts`
- `server/api/item/[_id].put.ts`
- `server/api/production/[id].put.ts`
- `server/api/purchaseOrder/[_id].put.ts`
- `server/api/recipe/[_id].put.ts`
- `server/api/vessel/[id].put.ts`
- `server/api/users/[_id].put.ts`

**Implementation**: Reuse the existing Yup schemas from `server/utils/validation.ts`, making fields optional for updates (`.partial()` equivalent or separate update schemas).

### Step 8: Fix Inconsistent Error Handling in GET Endpoints

**Problem**: Several GET endpoints `return error` instead of `throw createError(...)`, sending 200 OK with an error object as the body.

**Files to modify:**
- `server/api/bottle/index.get.ts` — replace `return error` with `throw createError({ statusCode: 500, statusMessage: 'Failed to fetch bottles' })`
- `server/api/bottle/[_id].get.ts` — same
- `server/api/inventory/[_id].get.ts` — same
- `server/api/inventory/[item].get.ts` — same
- `server/api/users/index.get.ts` — same (also add `.select('-password')` per Step 2)

### Step 9: Add Timestamps to All Mongoose Schemas

**Problem**: No schema has `timestamps: true`. Cannot track when records were created or modified.

**Files to modify (add `{ timestamps: true }` as second arg to `new Schema()`):**
- `server/models/batch.schema.ts`
- `server/models/bottle.schema.ts`
- `server/models/cocktail.schema.ts`
- `server/models/contact.schema.ts`
- `server/models/inventory.schema.ts`
- `server/models/item.schema.ts`
- `server/models/production.schema.ts`
- `server/models/purchaseOrder.schema.ts`
- `server/models/recipe.schema.ts`
- `server/models/user.schema.ts`
- `server/models/vessel.schema.ts`

**Also update type interfaces** to include `createdAt?: string` and `updatedAt?: string`.

### Step 10: Add Database Indexes

**Files to modify:**
- `server/models/batch.schema.ts` — index on `status`, `recipe`
- `server/models/purchaseOrder.schema.ts` — index on `vendor`, `status`, `date`
- `server/models/inventory.schema.ts` — index on `item`
- `server/models/cocktail.schema.ts` — index on `visible`
- `server/models/production.schema.ts` — index on `bottle`, `date`
- `server/models/item.schema.ts` — index on `vendor`, `type`
- `server/models/contact.schema.ts` — index on `type`

### Step 11: Fix Production Schema/Interface Mismatch

**Problem**: `Production.bottling.glassware/cap/label` are `string` in the TypeScript interface but `Schema.Types.ObjectId` refs in the Mongoose schema. The production detail page displays raw ObjectIDs.

**Files to modify:**
- `types/interfaces/Production.ts` — keep as `string` (ObjectId serializes to string)
- `pages/admin/production/[_id].vue` — resolve item names via `itemStore.getItemById()` for glassware, cap, and label fields

### Step 12: Export User Type & Clean Up Dead Code

**Files to modify:**
- `types/index.ts` — add `User` to the barrel export
- `composables/modalStatus.ts` — remove unused `cocktailModalOpen`, `calculatorModalStatus`, `toggleCalculatorModal` exports

### Step 13: Fix Inventory API Route Conflict

**Problem**: Both `server/api/inventory/[_id].get.ts` and `server/api/inventory/[item].get.ts` are dynamic catch-all routes at the same path level.

**Solution**: Rename `[item].get.ts` to a nested route or add a prefix:
- `server/api/inventory/by-item/[item].get.ts`

**Files to modify:**
- Rename `server/api/inventory/[item].get.ts` to `server/api/inventory/by-item/[item].get.ts`
- Update all `$fetch('/api/inventory/${itemId}')` calls in stores to use new path

### Step 14: Add Missing Data Model Fields

**Files to modify:**
- `types/interfaces/Bottle.ts` + `server/models/bottle.schema.ts` — add `volume?: number`, `volumeUnit?: string` (bottle size: 750mL, 375mL, etc.)
- `types/interfaces/Contact.ts` + `server/models/contact.schema.ts` — add `notes?: string`, split address into `city?: string`, `state?: string`, `zip?: string` (keep `address` as street)
- `types/interfaces/Batch.ts` + `server/models/batch.schema.ts` — add `batchNumber?: string`, `notes?: string`
- `types/interfaces/Recipe.ts` + `server/models/recipe.schema.ts` — add `notes?: string`, `targetAbv?: number`
- `types/interfaces/Vessel.ts` + `server/models/vessel.schema.ts` — add `location?: string`, `status?: string` (active/retired)
- `types/interfaces/User.ts` + `server/models/user.schema.ts` — add `role?: string` (Admin/Manager/Staff/ReadOnly)

---

## Phase 3: Public-Facing Site

**Goal**: Fix the public website from a placeholder to a polished, SEO-friendly distillery marketing site.

### Step 15: Fix Global SEO & Meta

**Files to modify:**
- `app.vue` — replace `"Opinionated Vite Starter Template"` with real description: `"Galveston Distilling Co — Handcrafted spirits from Galveston Island, Texas"`
- `app.vue` — remove the `overflow-y-hidden` constraint and `p-3` from NuxtPage (let layouts manage their own padding)
- `nuxt.config.ts` — add `app.head` with charset, viewport, Open Graph defaults, `lang: 'en'`
- `nuxt.config.ts` — remove unused `import path` and `import fs`
- `nuxt.config.ts` — set `devtools: { enabled: process.env.NODE_ENV !== 'production' }`

### Step 16: Add Per-Page SEO

**Files to modify (add `useSeoMeta()` to each):**
- `pages/index.vue` — title: "Galveston Distilling Co | Handcrafted Texas Spirits"
- `pages/menu.vue` — title: "Cocktail Menu | Galveston Distilling Co"
- `pages/bottles/index.vue` — title: "Our Spirits | Galveston Distilling Co"
- `pages/bottles/[id].vue` — dynamic title from bottle name
- `pages/events/index.vue` — title: "Events | Galveston Distilling Co"
- `pages/events/cocktailClass.vue` — title: "Cocktail Classes | Galveston Distilling Co"

### Step 17: Fix Age Verification Persistence

**Problem**: Age verification resets on every page refresh because it's stored in a Vue ref.

**Files to modify:**
- `composables/status.ts` — store `ageVerified` in `localStorage` (or a cookie) instead of a Vue ref. Check on mount and only show modal if not previously verified.
- `components/Modal/ModalAge.vue` — add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

### Step 18: Fix Featured Spirits Randomization

**Problem**: Random sort inside `computed()` re-shuffles on every reactivity trigger and causes SSR hydration mismatches.

**Files to modify:**
- `components/Site/SiteFeaturedSpirits.vue` — move randomization to `onMounted()` with a stored ref, so it only randomizes once per page load and avoids SSR mismatch

### Step 19: Create Missing Public Pages

**Files to create:**
- `pages/about.vue` — About/Our Story page with distillery history, team, and mission
- `pages/privacy.vue` — Privacy policy page
- `pages/return.vue` — Stripe checkout return/confirmation page (see Step 4)

**Files to modify:**
- `components/Site/SiteNewsletter.vue` — update privacy policy link from `href="#"` to `/privacy`

### Step 20: Fix Newsletter Form

**Option A** (simple): Make the newsletter form collect emails into the database.
- Create `server/models/subscriber.schema.ts` and `server/api/subscribers/create.post.ts`
- Add `@submit.prevent` handler in `SiteNewsletter.vue` that calls the API
- Show success/error feedback

**Option B** (production): Integrate with Mailchimp/ConvertKit via their API.

### Step 21: Create `.env.example`

**Files to create:**
- `.env.example` — document all required environment variables:
```
NUXT_ENV_MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_PRICE_ID=
NUXT_PUBLIC_WS_URL=ws://localhost:1880/ws
DOMAIN=http://localhost:3001
SESSION_SECRET=
```

---

## Phase 4: File Upload System

**Goal**: Enable photo and file uploads throughout the app using Cloudinary.

### Step 22: Cloudinary Setup & Upload API

**Prerequisites**: Create a Cloudinary account and obtain credentials.

**Files to create:**
- `server/api/upload/index.post.ts` — accept multipart form data, upload to Cloudinary, return URL and public ID
- `server/api/upload/[id].delete.ts` — delete a file from Cloudinary by public ID
- `composables/useFileUpload.ts` — `upload(file, folder)` and `remove(publicId)` with loading/progress state

**Files to modify:**
- `.env` / `.env.example` — add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `nuxt.config.ts` — add `@nuxt/image` module with Cloudinary provider
- `package.json` — add `cloudinary` and `@nuxt/image` packages

### Step 23: Image Upload Component

**Files to create:**
- `components/Form/FormImageUpload.vue` — drag-and-drop zone, click-to-browse, preview thumbnail, remove/replace, loading spinner, file type and size validation (images, max 5MB)
  - Props: `modelValue` (current URL), `folder` (Cloudinary subfolder), `label`
  - Emits: `update:modelValue`

### Step 24: Add Image Uploads to Entities

**Files to modify:**
- `components/Form/FormBottle.vue` — add `FormImageUpload` for bottle product photo (`img` field already exists in interface)
- `components/Panel/PanelBottle.vue` — add image upload to panel
- `components/Form/FormCocktail.vue` — add `FormImageUpload` for cocktail menu photo
- `components/Panel/PanelCocktail.vue` — add image upload
- `types/interfaces/Cocktail.ts` — add `img?: string`
- `server/models/cocktail.schema.ts` — add `img: String`

### Step 25: Document/File Upload Component

**Files to create:**
- `components/Form/FormFileUpload.vue` — similar to image upload but for PDFs/documents, shows file name and type icon instead of image preview

**Use cases:**
- Purchase order invoices/receipts
- Recipe reference documents
- Batch process notes

---

## Phase 5: Missing Detail Pages & Feature Gaps

**Goal**: Fill remaining admin feature gaps.

### Step 26: Vessel Detail Page

**Files to create:**
- `pages/admin/vessels/[_id].vue` — vessel detail showing:
  - Vessel info (name, type, capacity, weight, location)
  - Current contents with recipe names resolved
  - Contents history / transfer log
  - For barrels: char level, cost, fill date, aging duration
  - Edit/empty/transfer actions

**Files to modify:**
- `pages/admin/vessels.vue` → rename to `pages/admin/vessels/index.vue`
- `components/Table/TableVessels.vue` — add "View Details" to row actions, navigation to detail page
- `components/Vessel/VesselCard.vue` — click navigates to detail page

### Step 27: Cocktail Admin Detail Page

**Files to create:**
- `pages/admin/cocktails/[_id].vue` — cocktail detail showing:
  - Name, glassware, menu category, visibility status
  - Ingredient list with resolved item names, amounts, costs
  - Cost breakdown and margin analysis
  - Description and directions
  - Image (when upload system is available)
  - Edit action opening panel

### Step 28: Equipment Session Logging

**Problem**: Equipment controls page sends WebSocket commands but doesn't log usage history.

**Files to create:**
- `server/models/equipmentLog.schema.ts` — schema: `{ equipment: String, action: String, value: Number, timestamp: Date, batch?: ObjectId }`
- `server/api/equipmentLog/index.get.ts` — list logs
- `server/api/equipmentLog/create.post.ts` — create log entry

**Files to modify:**
- `pages/admin/controls.vue` — after each WebSocket send (power change, agitator toggle), also POST to `/api/equipmentLog/create`
- `pages/admin/controls.vue` — add a collapsible "Recent Activity" section showing the last 20 log entries

### Step 29: Cascade Delete Protection

**Problem**: Deleting a Contact, Recipe, or Vessel leaves dangling ObjectId references in related documents.

**Implementation options (choose one per relationship):**

**Option A — Block delete if referenced:**
- Before deleting a Contact, check if any Items or POs reference it. If so, return 400 error with message.
- Before deleting a Recipe, check if any Batches reference it. Block if active batches exist.

**Option B — Nullify references:**
- On Contact delete, set `item.vendor = null` for all Items referencing it.
- On Recipe delete, set `batch.recipe = null` for all Batches referencing it.

**Files to modify:**
- `server/api/contact/[id].delete.ts` — add reference check
- `server/api/recipe/[_id].delete.ts` — add reference check
- `server/api/vessel/[id].delete.ts` — add reference check (check batch contents)
- `server/api/item/[_id].delete.ts` — check recipe ingredients, PO items
- `server/api/bottle/[_id].delete.ts` — check production records

### Step 30: Role-Based Access Control

**Dependencies**: Step 1 (server-side sessions), Step 14 (role field on User)

**Files to create:**
- `server/utils/rbac.ts` — helper: `requireRole(event, ...roles)` that reads the session user's role and throws 403 if unauthorized

**Files to modify:**
- `server/middleware/auth.ts` — attach user role to event context from session
- `server/api/users/*.ts` — require Admin role for user management
- `server/api/*/[id].delete.ts` — require Manager or Admin role for all deletes

---

## Phase 6: Testing

**Goal**: Establish a test suite covering critical business logic and API endpoints.

### Step 31: Unit Tests for Utilities

**Files to create:**
- `tests/utils/conversions.test.ts` — test `convertUnitRatio()` for all unit pairs, unknown units, edge cases
- `tests/utils/formatting.test.ts` — test `Dollar.format()` with various inputs
- `tests/utils/helpers.test.ts` — test `recipePrice()`, `latestPrice()`, `bottleCost()`, `latestProduction()`
- `tests/utils/inventory.test.ts` — test `bottleStockCheck()`, `currentStock()`

### Step 32: Unit Tests for Composables

**Files to create:**
- `tests/composables/useProofingCalculator.test.ts` — test all proofing calculations, edge cases (0 ABV, 100% ABV, zero volume)
- `tests/composables/definitions.test.ts` — test `estimateCocktailPrice()`

### Step 33: Server Validation Tests

**Files to create:**
- `tests/server/validation.test.ts` — test all Yup schemas in `server/utils/validation.ts` with valid and invalid inputs, test `sanitize()` function with NoSQL injection payloads

### Step 34: API Integration Tests

**Files to create:**
- `tests/api/auth.test.ts` — test login, session creation, unauthorized access, invalid credentials
- `tests/api/batch.test.ts` — test CRUD operations, status advancement
- `tests/api/bottle.test.ts` — test CRUD operations

These use `@nuxt/test-utils` with `setup({ server: true })` for real API testing.

---

## Phase 7: Performance & DevOps

**Goal**: Optimize loading performance, fix package issues, add security headers.

### Step 35: Lazy Store Initialization

**Problem**: All 11 stores fetch all data on instantiation. Navigating to any page triggers all stores to load simultaneously.

**Solution**: Change stores to lazy-load — only fetch when first accessed.

**Pattern for each store:**
```typescript
const loaded = ref(false)
const ensureLoaded = async () => {
  if (!loaded.value) {
    await fetchData()
    loaded.value = true
  }
}
```

**Files to modify:**
- All 11 stores in `stores/` — remove the immediate `getXxx()` call at store definition, add `ensureLoaded()`, call it from components that need the data

**Alternatively**: Keep eager loading but add a `loaded` flag to prevent duplicate fetches, and only load stores actually used on the current page.

### Step 36: Pin Package Versions

**Files to modify:**
- `package.json`:
  - Change `"vue": "latest"` to a pinned version (e.g., `"^3.5.0"`)
  - Change `"vue-router": "latest"` to a pinned version (e.g., `"^4.5.0"`)
  - Change `"name": "nuxt-app"` to `"name": "gdc"`
  - Remove `nuxt-storage` if confirmed unused
  - Remove `socket.io` if only `@vueuse/core` WebSocket is used
  - Consider upgrading `date-fns` from `^2.30.0` to `^3.x` (API changes required)

### Step 37: Add Security Headers

**Files to modify:**
- `nuxt.config.ts` — add `routeRules` or `nitro.routeRules`:
```typescript
routeRules: {
  '/**': {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  }
}
```

### Step 38: Clean Up nuxt.config.ts

**Files to modify:**
- `nuxt.config.ts`:
  - Remove unused `import path from "path"` and `import fs from "fs"`
  - Add `app.head` with charset and viewport meta
  - Conditionally enable devtools: `devtools: { enabled: process.env.NODE_ENV !== 'production' }`

### Step 39: Remove console.error Statements

**Problem**: 27 `console.error` statements remain across stores and API endpoints.

**Solution**: In API endpoints, errors are already handled with `throw createError()`. In stores, errors are handled with toast notifications. The `console.error` calls are redundant.

**Files to modify**: All stores and API endpoints — remove `console.error` calls (or replace with a proper server logger like `consola` in API routes).

---

## Phase 8: Accessibility & Polish

**Goal**: Improve accessibility to WCAG AA compliance and fix UX polish items.

### Step 40: Add Skip Navigation

**Files to modify:**
- `layouts/default.vue` — add `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to main content</a>` before header, add `id="main-content"` to main content area
- `layouts/admin.vue` — same pattern

### Step 41: Add ARIA Attributes to Key Components

**Files to modify:**
- `components/Modal/ModalAge.vue` — add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- `components/Site/SiteHeader.vue` — add `aria-label` to dark mode toggle and admin link
- `pages/admin/controls.vue` — add `aria-label` to range inputs
- `pages/menu.vue` — add `role="tablist"` and `role="tab"` to filter buttons
- `pages/bottles/index.vue` — same for filter buttons

### Step 42: Improve Color Contrast

**Problem**: Text at `text-parchment/30` and `text-parchment/40` opacity may fail WCAG AA contrast requirements.

**Files to modify:**
- `assets/css/main.css` — consider adding utility classes for accessible muted text that meets 4.5:1 contrast ratio
- Global search and replace: raise minimum opacity from `/30` to `/50` for informational text, `/40` to `/60` for secondary labels

### Step 43: Clean Up Dead Code

**Files to modify:**
- `composables/modalStatus.ts` — remove `cocktailModalOpen`, `calculatorModalStatus`, `toggleCalculatorModal`
- `server/api/stripe/create-checkout-session.js` — remove unused `const body = await readBody(event)`

---

## Phase 9: TTB Compliance & Advanced Reporting

**Goal**: Generate reports required by the Alcohol and Tobacco Tax and Trade Bureau (TTB).

### Step 44: TTB Monthly Production Summary

TTB Form 5110.11 — "Monthly Report of Production Operations"

**Files to create:**
- `components/Report/ReportTTBProduction.vue` — monthly report showing:
  - Proof gallons produced by spirit type
  - Grain/material used (from recipe ingredients)
  - Losses (angel's share from barrel data)
  - Month selector
- `pages/admin/reports/ttb-production.vue` — page wrapper

**Data requirements:**
- Production records with batch linkage (needs `batch` field on Production — see Step 14)
- ABV data from batches to calculate proof gallons (volume x ABV x 2 = proof gallons)
- Recipe ingredient quantities

### Step 45: TTB Storage Report

TTB Form 5110.11 — "Storage Operations" section

**Files to create:**
- `components/Report/ReportTTBStorage.vue` — showing:
  - Spirits on hand at start of month (proof gallons)
  - Spirits received into storage
  - Spirits removed from storage (for bottling)
  - Spirits on hand at end of month
  - Losses during storage (angel's share)
- `pages/admin/reports/ttb-storage.vue` — page wrapper

### Step 46: TTB Processing Report

TTB Form 5110.28 — "Monthly Report of Processing Operations"

**Files to create:**
- `components/Report/ReportTTBProcessing.vue` — showing:
  - Spirits bottled (proof gallons, wine gallons)
  - Bottles filled by size and type
  - Dumped from barrels (proof gallons)
- `pages/admin/reports/ttb-processing.vue` — page wrapper

### Step 47: Update Reports Hub

**Files to modify:**
- `pages/admin/reports/index.vue` — add cards for TTB Production, TTB Storage, TTB Processing reports
- `components/Admin/AdminSidebar.vue` — keep single "Reports" link (hub page handles navigation)

---

## Files Summary

### New Files (27+)
```
server/utils/session.ts
server/api/auth/me.get.ts
server/api/auth/logout.post.ts
server/api/upload/index.post.ts
server/api/upload/[id].delete.ts
server/api/equipmentLog/create.post.ts
server/api/equipmentLog/index.get.ts
server/api/inventory/by-item/[item].get.ts
server/api/subscribers/create.post.ts
server/models/equipmentLog.schema.ts
server/models/subscriber.schema.ts
server/utils/rbac.ts
composables/useFileUpload.ts
components/Form/FormImageUpload.vue
components/Form/FormFileUpload.vue
pages/admin/vessels/[_id].vue
pages/admin/cocktails/[_id].vue
pages/about.vue
pages/privacy.vue
pages/return.vue
.env.example
tests/utils/conversions.test.ts
tests/utils/formatting.test.ts
tests/utils/helpers.test.ts
tests/utils/inventory.test.ts
tests/composables/useProofingCalculator.test.ts
tests/server/validation.test.ts
tests/api/auth.test.ts
components/Report/ReportTTBProduction.vue
components/Report/ReportTTBStorage.vue
components/Report/ReportTTBProcessing.vue
pages/admin/reports/ttb-production.vue
pages/admin/reports/ttb-storage.vue
pages/admin/reports/ttb-processing.vue
```

### Modified Files (40+)
```
server/middleware/auth.ts
server/api/users/find.put.ts
server/api/users/index.get.ts
composables/useAuth.ts
stores/useVesselStore.ts
utils/conversions.ts
server/api/stripe/create-checkout-session.js
server/api/batch/[id].put.ts (+ 10 more PUT endpoints)
server/api/bottle/index.get.ts (+ 4 more GET error fixes)
server/models/*.schema.ts (all 11 — timestamps + indexes)
types/interfaces/*.ts (6 — new fields)
types/index.ts
composables/modalStatus.ts
app.vue
nuxt.config.ts
package.json
components/Site/SiteFeaturedSpirits.vue
components/Site/SiteNewsletter.vue
components/Modal/ModalAge.vue
composables/status.ts
pages/admin/controls.vue
pages/admin/production/[_id].vue
pages/admin/vessels.vue → pages/admin/vessels/index.vue
components/Table/TableVessels.vue
components/Vessel/VesselCard.vue
layouts/default.vue
layouts/admin.vue
pages/index.vue (+ 5 more public pages — SEO)
assets/css/main.css
components/Form/FormBottle.vue
components/Form/FormCocktail.vue
pages/admin/reports/index.vue
components/Admin/AdminSidebar.vue
All 11 stores (lazy loading + console.error removal)
```

### Deleted Files (2)
```
server/api/stripe/stripe.ts
server/api/inventory/[item].get.ts (moved to by-item/)
```

---

## Priority Order

If time is limited, implement in this order:

1. **Phase 1** (Steps 1-6) — Critical security and bugs. Non-negotiable.
2. **Phase 2** (Steps 7-14) — API hardening. Prevents data corruption.
3. **Phase 3, Steps 15-17** — SEO meta, age verification, app.vue fixes. Quick wins.
4. **Phase 6** (Steps 31-34) — Tests. Establishes safety net for future changes.
5. **Phase 7, Steps 36-38** — Package pins, security headers. Low effort, high value.
6. **Phase 3, Steps 18-21** — Remaining public site fixes.
7. **Phase 4** (Steps 22-25) — File uploads. Requires Cloudinary account.
8. **Phase 5** (Steps 26-30) — Detail pages and feature gaps.
9. **Phase 8** (Steps 40-43) — Accessibility polish.
10. **Phase 9** (Steps 44-47) — TTB compliance. Requires domain expertise.
