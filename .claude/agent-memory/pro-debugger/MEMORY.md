# Pro-Debugger Agent Memory

## Critical Bug Patterns

### Empty String to ObjectId Cast Failure
- Mongoose throws `CastError` when an empty string `""` is passed to a `Schema.Types.ObjectId` field
- The `recipe` field on Bottle (and similar ObjectId ref fields on other models) must be stripped or set to `null` before saving
- Store defaults often initialize ref fields as `""` which silently fails on create/update
- Fix pattern: `if (!data.recipe) delete data.recipe;` for create, `if (!data.recipe) data.recipe = null;` for update
- **Fixed in**: Bottle (recipe), Inventory (location)
- API endpoints should also strip: `if (!sanitized.location) delete sanitized.location;` in create, `sanitized.location = null;` in update
- See `debugging-patterns.md` for full details

### Yup Number Validation with Empty Strings
- `yup.number()` casts `""` to `NaN`, which fails validation
- Fix: add `.nullable().transform((value, original) => (original === "" ? null : value))` before `.min()`/`.max()`
- **Fixed in**: Bottle (abv, price), Inventory (quantity)
- Always check BOTH create and update schemas when fixing this pattern

### Store Error Propagation to useFormPanel
- If a store's CRUD method catches errors without re-throwing, `useFormPanel.save()` thinks it succeeded and closes the panel
- Fix: add `throw error;` after the toast in the catch block so `useFormPanel` keeps the panel open on failure
- Toast description should use `error?.data?.statusMessage || error?.data?.message` because Nuxt's `createError` uses `statusMessage`, not `message`

## Architecture Notes
- `useFormPanel` snapshots data via `JSON.parse(JSON.stringify(...))` which strips `undefined` values
- Store `_id: undefined as unknown as string` vs `_id: ''` -- both work for the `!bottle.value._id` isNew check, but `undefined` is cleaner because JSON serialization strips it
- Mongoose ignores `_id: ''` (generates a new ObjectId), but it's better to strip it explicitly
- `$fetch` body can be plain object (auto-serialized) or `JSON.stringify()` (sent as-is) -- both work identically
- `server/utils/` is auto-imported in Nuxt 3 server routes -- `sanitize`, `validateBody`, and all schemas are available without imports
- `nuxt-mongoose` auto-imports model classes (Bottle, Recipe, etc.) in server routes

### API Update Endpoint 404 Swallowing
- Many update endpoints have a pattern where `findOneAndUpdate` returns null (not found), then `throw createError(404)` is thrown inside a try-catch that catches ALL errors and replaces them with generic 500
- Fix: add `if (error.statusCode) throw error;` before the generic 500 catch to let intentional errors propagate
- **Fixed in**: Inventory update endpoint

### Incomplete Validation Schemas
- Some Yup schemas were created with only partial field coverage (e.g. inventoryCreateSchema only validated `date`, missing `item` and `quantity`)
- Always cross-reference the Mongoose schema required fields against the Yup create schema to ensure all required fields are validated
- **Fixed in**: inventoryCreateSchema (added item, quantity, location)

## Files of Interest
- `composables/useFormPanel.ts` -- generic form panel composable, catches errors silently (by design, delegates to store)
- `server/utils/validation.ts` -- all Yup schemas for create/update, `sanitize()`, `validateBody()`
- `server/models/bottle.schema.ts` -- Bottle schema with `recipe: Schema.Types.ObjectId` ref
- `server/models/inventory.schema.ts` -- Inventory schema with `item` (required ObjectId) and `location` (optional ObjectId ref to Vessel)

## Stores Fixed (error propagation + toast format)
- `useBottleStore` -- throw error, statusMessage || message
- `useInventoryStore` -- throw error, statusMessage || message, strip empty ObjectId fields
