# GDC Webapp Improvement Plan

## Phase 1: Critical Fixes (Broken / Security)

These are things that are actively broken or represent serious security risks.

### 1. Fix broken references to deleted files
- `types/index.ts` still imports/exports `InventoryItems` — that file is deleted
- `pages/admin/vessels.vue` still uses `<TableVessels />` — that component is deleted
- These will cause build or runtime errors

### 2. Fix the `uesProductionStore` typo
- `stores/useProductionStore.ts` exports the store as `uesProductionStore`
- `components/Form/FormProduction.vue` and `components/Table/TableProductions.vue` both import this typo
- This is fragile and confusing — rename to `useProductionStore`

### 3. Remove password logging and secure auth
- `composables/useAuth.ts` logs the user's password to the console
- `pages/login.vue` also logs email + password to console
- The user cookie stores the raw password in plaintext — strip the password from the cookie value
- Cookie should use `secure`, `httpOnly`, and `sameSite` options

### 4. Protect API endpoints
- Every single API route (`server/api/**`) has zero authentication checks — anyone with the URL can create, read, update, or delete any record
- Add server middleware that validates the user session before allowing access to `/api/batch/*`, `/api/bottle/*`, etc.
- The current auth middleware only runs client-side, so the API is completely open

### 5. Hash passwords
- `server/models/user.schema.ts` stores passwords as plain strings
- Use `bcrypt` to hash on creation and compare on login
- The `find.put.ts` endpoint currently queries by raw password match

### 6. Remove hardcoded WebSocket IP
- `pages/admin/controls.vue:5` has a hardcoded WebSocket IP — move to an environment variable

---

## Phase 2: Data Integrity & Validation

### 7. Add form validation across all forms
- None of the 12 form components validate input before submitting
- Yup is already installed — use it with Nuxt UI's `UForm` `:validate` prop
- Priority forms: `FormBatch`, `FormBottle`, `FormCocktail`, `FormProduction`, `FormUser`
- Key validations needed:
  - Required fields (name, recipe, date, etc.)
  - Number ranges (price > 0, ABV 0–100, quantity >= 0)
  - Email format on login, user, and contact forms
  - Password minimum length

### 8. Fix schema/interface mismatches
- Many Mongoose schemas use `type: String` where the TypeScript interface expects `ObjectId` — affects Bottle (`recipe`), Production (`vessel`, `bottle`, `bottling.*`), PurchaseOrder (`vendor`, `items[].item`), and Item (`vendor`)
- Schemas mark most fields as `required: false` while interfaces declare them as required — pick one source of truth and align them
- Add nested subdocument schemas for array fields in Recipe (`items`), Batch (`fermenting.readings`), and Vessel (`contents`) — currently just `type: Array` with no structure

### 9. Add server-side input validation
- API endpoints accept any JSON body without validation
- Add Zod or Yup validation in each POST/PUT handler to reject malformed data before it reaches MongoDB
- Sanitize string inputs to prevent NoSQL injection (e.g., `server/api/inventory/[item].get.ts` passes the route param directly to `Inventory.find()`)

---

## Phase 3: UX — Loading, Errors, and Feedback

### 10. Add loading states to all async operations
- No form has a loading/disabled state during save — users can double-submit
- No table shows a loading indicator during data fetch
- Add `loading` ref to each store action, bind it to button `:loading` prop

### 11. Add error handling and user-facing error messages
- Almost every store action and form submission lacks `try/catch`
- When API calls fail, nothing is shown to the user — operations fail silently
- Use Nuxt UI's `useToast()` to show error toasts on failure
- API endpoints that do have `catch` blocks return raw error objects instead of using `createError()`

### 12. Add delete confirmation dialogs
- `TableCocktails`, `TableRecipes`, `TableProductions`, `TableItems` all delete on click with no confirmation
- `ModalDeleteWarning.vue` exists but references undefined variables and isn't wired up
- Wire it into all delete flows with the item name shown in the confirmation message

### 13. Add empty states to all tables
- None of the 12 table components show a message when there's no data
- Use Nuxt UI's `empty-state` slot on `UTable` to show "No batches found" / "No items match your search" messages

### 14. Add success feedback
- Most CRUD operations complete with no visual confirmation
- Add success toasts after create/update/delete operations

---

## Phase 4: Functionality Gaps

### 15. Build out the admin dashboard
- `components/Admin/AdminDashboard.vue` is a placeholder — just says "Dashboard goes here"
- This should be the operational hub. Suggested widgets:
  - Active batches by stage (brewing, fermenting, distilling, barreled)
  - Low inventory alerts
  - Recent production runs
  - Upcoming batch schedule
- The `Dashboard/` component directory already has `DashboardBrewing`, `DashboardFermenters`, `DashboardUpcoming`, etc. but they aren't composed into the main dashboard

### 16. Complete incomplete components
- `FormInventory.vue` — uses a `UCommandPalette` but has no actual form structure or submit flow
- `FormVesselContentsMove.vue` — destination card is empty, no submit button
- `VesselTransfer.vue` — references undefined functions `fullTransfer()` and `transferBatch()`; displays raw `{{ transfer }}` debug object
- `DashboardBatchCard.vue` — still shows "Batch info will go here"

### 17. Add table pagination
- Only `TableProductions` has pagination — all others load the full dataset
- As data grows, tables like Batches, Items, Inventory, and PurchaseOrders will become slow
- Add pagination (or at minimum virtual scrolling) to all data tables

### 18. Add consistent table sorting and filtering
- Only 3 of 12 tables have sortable column headers
- Only 4 of 12 tables have a search/filter input
- Standardize: every table should have a search bar and sortable columns

### 19. Improve the sidebar navigation
- `AdminSidebar.vue` is missing links to several admin pages (vessels, controls, proofing, purchase orders)
- No active-route indicator — user can't tell which page they're on
- Consider a collapsible sidebar for smaller screens

### 20. Add logout functionality
- There's no logout button or route — once authenticated, the only way out is clearing cookies manually

---

## Phase 5: Aesthetics & Responsive Design

### 21. Fix mobile responsiveness
- Forms use rigid 12-column grids (`col-span-5`, `col-span-2`) that don't adapt to mobile
- `FormRecipe.vue` sets `min-w-5xl` — wider than any phone screen
- Tables have no horizontal scroll wrapper — they overflow on small screens
- Dashboard grid components use `grid-flow-col` without responsive breakpoints
- Sidebar is fixed-width `w-80` with no collapse behavior on mobile

### 22. Improve the public-facing pages
- `pages/index.vue` hides content on mobile (`hidden md:flex`) with no mobile alternative
- `pages/menu.vue` uses fixed `w-80` card widths that don't flex for screen size
- `pages/bottles.vue` has no loading or empty states
- Both `menu.vue` and `bottles.vue` declare a `search` ref that's never bound to an input
- Missing `key` prop on `v-for` loops in `menu.vue` and `bottles.vue` — causes rendering bugs

### 23. Improve the login page
- No loading state on the login button during authentication
- No "forgot password" flow
- Form state bindings are mismatched — inputs bind to `user.email`/`user.password` but form state uses separate refs
- Error message displays but has no way to clear except refreshing

### 24. Fix the age verification modal
- `ModalAge.vue` redirects to disney.com on "No" — replace with a more appropriate response page
- Buttons say "Yes" / "No" with no context — should say "I am 21 or older" / "I am under 21"

### 25. Clean up chart components
- `ChartAllBottlesInventory.vue` and `ChartBottleInventory.vue` have no responsive wrapper — charts overflow on mobile
- No loading state while chart data is being fetched

---

## Phase 6: Code Quality & Maintainability

### 26. Remove all debug console.log statements
Found across at least 8 files: `useAuth.ts`, `login.vue`, `controls.vue`, `FormCocktail.vue`, `FormProduction.vue`, `default.vue`, `DashboardUpcoming.vue` (outputs entire store object), and `server/api/users/find.put.ts`

### 27. Extract duplicated patterns into composables
- **Delete flow** — 6 table components each implement their own delete logic; extract to a `useTableCrud()` composable
- **Sortable column headers** — 3 tables duplicate the same render function for sortable headers; extract to a `createSortableColumn()` helper
- **Price formulas** — `TableCocktails.vue` and `FormCocktail.vue` both hardcode `((cost - 1.5) / 2.5) * 4 + 7`; extract to a shared utility

### 28. Fix miscellaneous typos and bugs
- `FormRecipe.vue:78` — "Volumne" should be "Volume"
- `SiteDatePicker.vue:14` — date format `'yyy'` should be `'yyyy'`
- `TableProductions.vue:21` — `map()` result is never captured (line does nothing)
- `AdminHeader.vue:67` — renders literal text `(user, authorized)` instead of variable values
- `createProduction` in `useProductionStore.ts` is an empty function

### 29. Remove unused dependencies
- `@auth/core`, `@sidebase/nuxt-auth`, `next-auth`, `@next-auth/prisma-adapter` — all installed but unused (custom auth is used instead)
- `prisma` and `@prisma/client` — installed but Mongoose is the active ORM
- Keeping these adds confusion about the intended architecture and bloats `node_modules`

### 30. Optimize store data fetching
- Every store fetches its entire dataset on initialization — even if the user never visits that page
- All update/create/delete operations re-fetch the entire collection afterward
- Switch to lazy loading (fetch on first access) and optimistic updates (update local state, don't re-fetch everything)