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

## Notes
- Record server-side patterns, caching decisions, and Nitro quirks here as discovered
