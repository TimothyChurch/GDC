# Nuxt Data Flow Memory

## Project Architecture
- See CLAUDE.md for full project structure
- 10 Pinia stores with lazy loading pattern (`loaded` ref + `ensureLoaded()`)
- Stores use `$fetch` in actions, local state mutation after CUD ops
- Layouts call `ensureLoaded()` on stores

## Key Patterns
- Stores are initialized in `layouts/admin.vue` for admin pages
- Public pages may also use stores for data
- All stores follow consistent pattern: items ref, loading ref, saving ref, CRUD actions

## Notes
- Record data flow patterns, hydration issues, and payload optimization findings here
