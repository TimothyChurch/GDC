# Nuxt 4 Performance & SEO Reference

Nuxt 4.3.1 | SEO meta | Rendering modes | Image optimization | Lazy hydration
Docs: https://nuxt.com/docs/4.x/getting-started/seo-meta | https://nuxt.com/docs/4.x/guide/best-practices/performance

## 1. useSeoMeta

Docs: https://nuxt.com/docs/4.x/api/composables/use-seo-meta

```ts
// 100+ typed properties — XSS-safe, flat API
useSeoMeta({
  title: 'Galveston Distilling Co',
  description: 'Craft spirits from Galveston, Texas',
  // OpenGraph
  ogTitle: 'Galveston Distilling Co',
  ogDescription: 'Craft spirits from Galveston, Texas',
  ogImage: 'https://galvestondistilling.com/og-image.jpg',  // Must be absolute URL
  ogType: 'website',
  ogUrl: 'https://galvestondistilling.com',
  ogSiteName: 'Galveston Distilling Co',
  // Twitter Cards
  twitterCard: 'summary_large_image',
  twitterTitle: 'Galveston Distilling Co',
  twitterDescription: 'Craft spirits from Galveston, Texas',
  twitterImage: 'https://galvestondistilling.com/og-image.jpg',
  // Indexing
  robots: 'index, follow',
})

// Reactive meta (use computed getters):
useSeoMeta({
  title: () => `${batch.value.name} | GDC`,
  description: () => `Details for ${batch.value.name}`,
})

// Server-only static meta (useServerSeoMeta is DEPRECATED in Nuxt 4):
if (import.meta.server) {
  useSeoMeta({ robots: 'index, follow', description: 'Static description' })
}
```

## 2. useHead

Docs: https://nuxt.com/docs/4.x/api/composables/use-head

```ts
useHead({
  title: 'Page Title',
  titleTemplate: '%s - Galveston Distilling Co',
  // Or function form:
  // titleTemplate: (title) => title ? `${title} - GDC` : 'Galveston Distilling Co',
  htmlAttrs: { lang: 'en' },
  bodyAttrs: { class: 'overflow-hidden' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'canonical', href: 'https://galvestondistilling.com/spirits' },
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  script: [
    { src: 'https://cdn.example.com/script.js', async: true, tagPosition: 'bodyClose' },
  ],
})
```

- Supports refs, computed, reactive objects, and functions for reactivity
- `tagPosition`: `'head'` (default), `'bodyClose'`, `'bodyOpen'`
- Use `useHeadSafe` for user-generated/untrusted content

## 3. definePageMeta

Docs: https://nuxt.com/docs/4.x/api/utils/define-page-meta

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  keepalive: true,                    // Preserve component state on navigation
  // keepalive: { max: 10 },         // With options
  pageTransition: { name: 'fade' },
  title: 'Dashboard',                // Used by titleTemplate
})
</script>
```

## 4. NuxtImg / NuxtPicture

Docs: https://image.nuxt.com/usage/nuxt-img

```vue
<!-- LCP hero image (above-fold) -->
<NuxtImg
  src="/hero-banner.jpg"
  format="webp"
  :preload="{ fetchPriority: 'high' }"
  loading="eager"
  width="1200"
  height="600"
  alt="Galveston Distilling Co"
/>

<!-- Below-fold image -->
<NuxtImg
  src="/product-photo.jpg"
  format="webp"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  densities="x1 x2"
  width="400"
  height="300"
  quality="80"
  alt="Spirit bottle"
/>

<!-- NuxtPicture — auto format fallback (avif → webp → jpeg) -->
<NuxtPicture src="/photo.jpg" format="avif" />
```

| Prop | Purpose |
|------|---------|
| `width` / `height` | Explicit dimensions (critical for CLS) |
| `format` | `webp`, `avif`, `jpeg`, `png` |
| `quality` | 0-100 compression |
| `sizes` | Responsive: `"(max-width: 768px) 100vw, 50vw"` |
| `densities` | Retina: `"x1 x2"` |
| `loading` | `"lazy"` (default) or `"eager"` |
| `preload` | For LCP images: `{ fetchPriority: 'high' }` |
| `placeholder` | Show placeholder while loading |
| `provider` | Image provider: `ipx` (default), `cloudinary`, `imgix`, etc. |

## 5. Rendering Modes

Docs: https://nuxt.com/docs/4.x/guide/concepts/rendering

| Mode | Config | Best For |
|------|--------|----------|
| **SSR** | default | Dynamic content needing SEO |
| **SSG/Prerender** | `prerender: true` | Static pages (homepage, about) |
| **SPA** | `ssr: false` | Admin dashboards, no SEO |
| **SWR** | `swr: 3600` | Semi-dynamic content (server cache) |
| **ISR** | `isr: 3600` | CDN-level caching (Netlify/Vercel) |

- **SWR**: Server-side cache. Stale served while regenerating. Works everywhere.
- **ISR**: CDN-level cache. Persists until next deploy. Best on Netlify/Vercel.

## 6. Route Rules

Docs: https://nuxt.com/docs/4.x/guide/concepts/rendering

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/spirits': { swr: 3600 },
    '/admin/**': { ssr: false },
    '/api/products/**': { cache: { maxAge: 3600 } },
    '/old-page': { redirect: '/new-page' },
    '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000' } },
    '/admin/**': { appLayout: 'admin' },        // NEW in 4.3
    '/protected/**': { appMiddleware: 'auth' },
  },
})
```

Page-level route rules (requires `experimental.inlineRouteRules: true`):
```vue
<script setup>
defineRouteRules({ prerender: true })
</script>
```

## 7. Lazy Hydration

Docs: https://nuxt.com/docs/4.x/directory-structure/app/components

### Lazy prefix — defers JS chunk loading:
```vue
<LazyMountainsList v-if="show" />
```

### Hydration strategies (one per component):

| Strategy | Trigger | Use Case |
|----------|---------|----------|
| `hydrate-on-visible` | Scrolls into viewport | Below-fold, footers |
| `hydrate-on-idle` | Browser idle | Non-critical UI, sidebars |
| `hydrate-on-interaction` | Click, mouseover, focus | Interactive widgets |
| `hydrate-on-media-query` | Media query matches | Mobile/desktop-specific |
| `hydrate-after` | Milliseconds elapse | Delayed content |
| `hydrate-when` | Boolean becomes true | Conditional features |
| `hydrate-never` | Never | Static/decorative content |

```vue
<template>
  <LazyFooter hydrate-on-visible />
  <LazySidebar hydrate-on-idle />
  <LazyCommentForm hydrate-on-interaction="click,focus" />
  <LazyMobileNav hydrate-on-media-query="(max-width: 768px)" />
  <LazyStaticBanner hydrate-never />
</template>
```

All strategies emit `@hydrated` event. Only works with props in template (not `v-bind` spread).

## 8. Core Web Vitals

Source: https://web.dev/articles/vitals

| Metric | Good | Poor | Key Strategies |
|--------|------|------|----------------|
| **LCP** | < 2.5s | > 4.0s | Preload hero images, SSR/prerender, `fetchPriority: 'high'` |
| **INP** | < 200ms | > 500ms | Lazy hydration, code splitting, defer scripts |
| **CLS** | < 0.1 | > 0.25 | Image dimensions, font fallbacks, no dynamic injection |

**Measurement tools:**
- `npx nuxi analyze` — bundle composition
- Nuxt DevTools — timeline, assets, render tree
- Chrome DevTools Performance Panel — LCP, CLS, INP
- Lighthouse / PageSpeed Insights — comprehensive audits

**Vue performance patterns:**
- `shallowRef` for large datasets (default in Nuxt 4 `useFetch`)
- `v-once` for static content, `v-memo` for expensive list renders
- `NuxtLink` prefetch tuning: set `prefetchOn: 'interaction'` in config to reduce network requests

## 9. robots.txt & Sitemap

### @nuxtjs/robots
Docs: https://nuxtseo.com/robots

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/robots'],
  robots: {
    groups: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: 'https://galvestondistilling.com/sitemap.xml',
  },
})
```

### @nuxtjs/sitemap
Docs: https://nuxtseo.com/sitemap

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: { url: 'https://galvestondistilling.com' },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],   // Dynamic URLs from API
    exclude: ['/admin/**', '/login'],
    defaults: { changefreq: 'weekly', priority: 0.8 },
  },
})
```

Dynamic URL source:
```ts
// server/api/__sitemap__/urls.ts
export default defineSitemapEventHandler(() => [
  { loc: '/spirits/vodka', lastmod: new Date() },
  { loc: '/spirits/gin', lastmod: new Date() },
])
```

## Anti-Patterns

1. Missing `width`/`height` on images — causes CLS
2. Not preloading LCP images — use `fetchPriority: 'high'`
3. Loading all components eagerly — use `Lazy` prefix + hydration strategies
4. Using `useServerSeoMeta` (deprecated) — use `import.meta.server` guard
5. Not using `pick`/`transform` on `useFetch` — bloated SSR payloads
6. Relative OG image URLs — must be absolute
7. No title template — inconsistent SEO across pages
8. Ignoring bundle analysis — run `npx nuxi analyze` regularly
