---
paths:
  - "stores/**/*.ts"
  - "composables/**/*.ts"
  - "app/stores/**/*.ts"
  - "app/composables/**/*.ts"
---

# Nuxt 4 Data Flow — Quick Reminders

Use `/nuxt data` for full reference (useFetch, Pinia SSR, hydration, useState).

## Critical Rules
- **Shallow reactivity**: `useFetch` data is `shallowRef` — replace entire object, don't mutate in-place
- **Default values**: `data` and `error` default to `undefined` (was `null` in Nuxt 3)
- **$fetch in setup**: NEVER use `$fetch` directly in component setup — double-fetches. Use `useFetch`
- **Composables after await**: Nuxt context is lost after `await` in setup — call composables before any await
- **import.meta.client**: Use instead of deprecated `process.client`

## GDC Conventions
- Stores use `$fetch` in actions with `ensureLoaded()` pattern
- CUD operations mutate local state optimistically
- Use `useState` for SSR-safe shared reactive values (not plain `ref`)
