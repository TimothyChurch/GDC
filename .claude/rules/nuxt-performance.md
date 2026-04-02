---
paths:
  - "pages/**/*.vue"
  - "layouts/**/*.vue"
  - "app/pages/**/*.vue"
  - "app/layouts/**/*.vue"
  - "nuxt.config.ts"
---

# Nuxt 4 Performance & SEO — Quick Reminders

Use `/nuxt performance` for full reference (SEO meta, images, hydration, rendering modes).

## Critical Rules
- **useServerSeoMeta**: DEPRECATED — use `if (import.meta.server) { useSeoMeta({...}) }` instead
- **OG images**: Must be absolute URLs (not relative paths)
- **NuxtImg**: Always set `width`/`height` to prevent CLS; use `loading="eager"` + `fetchPriority: 'high'` for LCP
- **Lazy hydration**: Use `Lazy` prefix + `hydrate-on-visible`/`hydrate-on-idle` for below-fold content

## GDC Route Rules
- Public pages: `prerender: true` (/, /about, /privacy, /contact)
- Admin: `ssr: false` (no SEO needed)
- Public API: `swr: 300` (/api/bottle/public, /api/cocktail/public)
- Title template: `'%s - Galveston Distilling Co'`
