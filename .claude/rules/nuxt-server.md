---
paths:
  - "server/**/*.ts"
---

# Nuxt 4 Server — Quick Reminders

Use `/nuxt server` for full API reference (handlers, caching, middleware, route rules).

## Critical Rules
- **createError**: Use `status`/`statusText` (NOT `statusCode`/`statusMessage`) — Nuxt 4 breaking change
- **Server middleware**: MUST NOT return a value — only modify `event` or throw
- **readBody on GET**: Throws 405 — use `getValidatedQuery` for query params
- **useRuntimeConfig**: ALWAYS pass `event` in server handlers
- **Auto-imports**: `server/utils/` exports are auto-imported; use `#server` alias

## GDC Conventions
- Handler pattern: auth check → validation (`sanitize` + `validateBody`) → business logic → return
- Sensitive fields: always `.select('-password')`
- Yup validation via `server/utils/validation.ts`
