# Nuxt Server Specialist Memory

## Project Architecture
- See CLAUDE.md for full project structure
- Server code lives in `server/` with Nitro auto-imports from `server/utils/`
- 11 resources with standard CRUD endpoints
- MongoDB Atlas via Mongoose, schemas in `server/models/`

## Key Patterns
- All POST/PUT endpoints use `sanitize()` + `validateBody()` from `server/utils/validation.ts`
- Auth via `requireSession()` from `server/utils/session.ts`
- RBAC on user management via `server/utils/rbac.ts`
- Stores use `$fetch` to call API endpoints

## Public vs Admin API Pattern
- Public endpoints: `server/api/{resource}/public.get.ts` with `defineCachedEventHandler`
- Public endpoints use `.select()` to return only visitor-facing fields
- Cocktail public endpoint resolves ingredient names server-side (batch lookup Items + Bottles)
- Public stores (`usePublicBottleStore`, `usePublicCocktailStore`) loaded in `layouts/default.vue`
- Admin stores (`useBottleStore`, `useCocktailStore`, `useItemStore`) only loaded in admin layout
- SWR route rules in `nuxt.config.ts`: `/api/bottle/public` (300s), `/api/cocktail/public` (300s), `/api/event/upcoming` (60s)

## Nitro/Mongoose Quirks
- `nuxt-mongoose` `.lean()` returns types with `StringConstructor` instead of `string`
- Fix: cast lean results with `as unknown as YourInterface[]` (local lean interfaces)
- `defineCachedEventHandler` requires `name` and `getKey` to avoid cache collisions

## API Handler Factories (Phase 2.2)
- `server/utils/api-handlers.ts` — 5 factory functions auto-imported in server context
- `createGetAllHandler(Model, { select?, sort?, populate?, limit? })`
- `createGetByIdHandler(Model, { paramName?, populate? })`
- `createCreateHandler(Model, { schema?, populate?, falsyFields? })`
- `createUpdateHandler(Model, { paramName?, schema?, populate?, nullableFields? })`
- `createDeleteHandler(Model, { paramName?, referenceChecks?, preDelete? })`
- extractId helper auto-detects `_id` or `id` from route params
- Custom endpoints kept as-is: batch/create (log entry), users/* (RBAC+bcrypt), bottle/public, cocktail/public, inventory/index, settings, stripe, event/request, event/upcoming

## Known Issues
- `Event` Mongoose model collides with DOM global `Event` type in TS — pre-existing, not a regression
- nuxt-mongoose `.lean()` returns `StringConstructor` instead of `string` — pre-existing

## Notes
- Record server-side patterns, caching decisions, and Nitro quirks here as discovered
