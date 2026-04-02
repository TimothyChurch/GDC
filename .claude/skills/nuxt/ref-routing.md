# Nuxt 4 Routing Reference

Nuxt 4.3.1 | File-based routing | Middleware | Navigation
Docs: https://nuxt.com/docs/4.x/getting-started/routing | https://nuxt.com/docs/4.x/directory-structure/pages

## Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| Internal page link | `<NuxtLink to="/path">` | Prefetch, SPA navigation, active classes |
| Redirect in middleware/setup | `navigateTo('/path')` | Works SSR + client, returns promise |
| Back/forward navigation | `useRouter().back()` | Programmatic history control |
| Guard admin routes | Named middleware + `definePageMeta` | Reusable, declarative |
| Force re-render on param change | `definePageMeta({ key: route => route.fullPath })` | Avoids stale component state |
| Catch-all 404 page | `[...slug].vue` | Matches any unmatched route |
| Group pages sharing a layout | Route groups `(group)/` | No URL prefix, shared layout |

## File-Based Routing

Docs: https://nuxt.com/docs/4.x/directory-structure/pages

```
pages/
├── index.vue              → /
├── about.vue              → /about
├── bottles/
│   ├── index.vue          → /bottles
│   └── [_id].vue          → /bottles/:id
├── admin/
│   ├── index.vue          → /admin
│   ├── batch/
│   │   ├── index.vue      → /admin/batch
│   │   └── [_id].vue      → /admin/batch/:id
│   └── reports/
│       └── production.vue → /admin/reports/production
└── [...slug].vue          → catch-all (404)
```

### Dynamic routes:
- `[id].vue` — required param: `/users/123`
- `[_id].vue` — GDC convention: underscore prefix for MongoDB `_id`
- `[[id]].vue` — optional param: `/users` or `/users/123`
- `[...slug].vue` — catch-all: `/path/to/anything`

### Route parameters:
```ts
const route = useRoute()
const id = route.params._id        // From [_id].vue
const slug = route.params.slug     // From [...slug].vue — array of segments
```

## definePageMeta

Docs: https://nuxt.com/docs/4.x/api/utils/define-page-meta

```ts
definePageMeta({
  layout: 'admin',                      // Layout name (string | false)
  middleware: 'auth',                    // Single or array: ['auth', 'admin-only']
  name: 'batch-detail',                 // Named route
  path: '/custom-path/:id',             // Override file-based path
  alias: ['/old-path'],                 // Additional paths for this page
  redirect: '/new-path',                // Redirect to another route
  keepalive: true,                       // Keep component alive on navigation
  key: route => route.fullPath,          // Force re-render on param change
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: { name: 'layout', mode: 'out-in' },

  // Custom properties (accessed via route.meta)
  title: 'Dashboard',
  requiresAdmin: true,

  // Route validation
  validate: async (route) => {
    return /^\w+$/.test(route.params._id as string)
  },
})
```

### IMPORTANT — definePageMeta is a macro:
- Must be at top-level of `<script setup>` (not inside functions or conditionals)
- Cannot reference variables defined in the same `<script setup>`
- Metadata is extracted at build time via static analysis
- For dynamic values, use a function that receives `route`:
  ```ts
  definePageMeta({
    key: route => route.fullPath,
    middleware: (to) => { /* inline middleware */ },
  })
  ```

## Route Middleware

Docs: https://nuxt.com/docs/4.x/directory-structure/middleware

### Named middleware (`middleware/` directory):
```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth()
  if (!user.value) await fetchUser()
  if (!user.value) return navigateTo('/login')
})
```

### Global middleware (`*.global.ts`):
```ts
// middleware/tracking.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Runs on EVERY navigation
})
```

### Inline middleware (in definePageMeta):
```ts
definePageMeta({
  middleware: [
    (to, from) => {
      if (!hasPermission()) return abortNavigation()
    },
  ],
})
```

### Execution order:
1. Global middleware (alphabetical by filename)
2. Page-defined middleware (in array order)

### Middleware return values:
| Return | Effect |
|--------|--------|
| nothing / `undefined` | Continue navigation |
| `navigateTo('/path')` | Redirect |
| `navigateTo('/path', { replace: true })` | Redirect without history entry |
| `abortNavigation()` | Cancel navigation |
| `abortNavigation(error)` | Cancel with error (triggers error page) |

## NuxtLink

Docs: https://nuxt.com/docs/4.x/api/components/nuxt-link

```vue
<!-- Basic -->
<NuxtLink to="/about">About</NuxtLink>
<NuxtLink :to="{ name: 'batch-detail', params: { _id: batch._id } }">
  {{ batch.name }}
</NuxtLink>

<!-- External links -->
<NuxtLink to="https://example.com" external>External</NuxtLink>
<NuxtLink to="https://example.com" target="_blank">New tab</NuxtLink>

<!-- Prefetch control -->
<NuxtLink to="/heavy-page" :prefetch="false">No prefetch</NuxtLink>
<NuxtLink to="/page" no-prefetch>Also no prefetch</NuxtLink>
<NuxtLink to="/page" :prefetch-on="{ interaction: true }">On hover/focus</NuxtLink>

<!-- Active styles -->
<NuxtLink to="/admin" active-class="text-primary" exact-active-class="font-bold">
  Admin
</NuxtLink>
```

### Key props:
| Prop | Type | Description |
|------|------|-------------|
| `to` | `string \| RouteLocationRaw` | Target route |
| `external` | `boolean` | Force external link behavior |
| `prefetch` | `boolean` | Prefetch target page (default: true) |
| `noPrefetch` | `boolean` | Disable prefetch |
| `target` | `string` | Link target (`_blank`, etc.) |
| `activeClass` | `string` | Class when route matches |
| `exactActiveClass` | `string` | Class when route matches exactly |

## Programmatic Navigation

Docs: https://nuxt.com/docs/4.x/api/utils/navigate-to

```ts
// navigateTo — use in middleware, plugins, or component setup
await navigateTo('/login')
await navigateTo('/login', { replace: true })        // No back button
await navigateTo('/login', { redirectCode: 301 })    // Permanent redirect (SSR only)
await navigateTo({ name: 'batch-detail', params: { _id: '123' } })
await navigateTo('https://external.com', { external: true })

// abortNavigation — use in middleware only
return abortNavigation()                 // Cancel silently
return abortNavigation(createError({ statusCode: 403 }))  // Cancel with error
```

### useRoute / useRouter:
```ts
const route = useRoute()
route.params._id           // Route params
route.query.page            // Query string (?page=1)
route.path                  // /admin/batch/123
route.fullPath              // /admin/batch/123?page=1
route.name                  // Named route
route.meta                  // definePageMeta values

const router = useRouter()
router.push('/path')
router.replace('/path')
router.back()
router.go(-2)
```

### Watch for route changes:
```ts
watch(() => route.params._id, (newId) => {
  fetchBatch(newId)
})
```

## Route Validation

Docs: https://nuxt.com/docs/4.x/api/utils/define-page-meta#validate

```ts
definePageMeta({
  validate: async (route) => {
    // Return boolean — false shows 404 error page
    return /^[a-f\d]{24}$/.test(route.params._id as string)
  },
  // Or return an error object for custom status
  validate: async (route) => {
    if (!isValid(route.params._id)) {
      return createError({ statusCode: 404, statusMessage: 'Batch not found' })
    }
    return true
  },
})
```

## Route Groups

Docs: https://nuxt.com/docs/4.x/directory-structure/pages#route-groups

Parentheses in directory names create logical groups without affecting the URL path.

```
pages/
├── (admin)/
│   ├── dashboard.vue      → /dashboard  (uses admin layout)
│   └── settings.vue       → /settings   (uses admin layout)
├── (public)/
│   ├── about.vue          → /about      (uses default layout)
│   └── contact.vue        → /contact    (uses default layout)
```

Apply a shared layout to a group via `definePageMeta` in each page, or via route rules in `nuxt.config.ts`:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/dashboard': { appMiddleware: 'auth' },
  },
})
```

## Page Transitions

Docs: https://nuxt.com/docs/4.x/getting-started/transitions

### Global config:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
})
```

### CSS for transitions:
```css
.page-enter-active, .page-leave-active {
  transition: all 0.3s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
```

### Per-page override:
```ts
definePageMeta({
  pageTransition: { name: 'slide-right', mode: 'out-in' },
  pageTransition: false,  // Or disable entirely
})
```

## NuxtPage

Docs: https://nuxt.com/docs/4.x/api/components/nuxt-page

`<NuxtPage>` renders the matched page component. Required in `app.vue` or layout files.

```vue
<!-- app.vue — basic usage -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<!-- With keepalive -->
<NuxtPage keepalive />
<NuxtPage :keepalive="{ include: ['BatchDetail'] }" />

<!-- Custom page key (force re-render on route change) -->
<NuxtPage :page-key="route => route.fullPath" />
<NuxtPage page-key="static" />

<!-- Transition props -->
<NuxtPage :transition="{ name: 'fade', mode: 'out-in' }" />
```

### Props:
| Prop | Type | Description |
|------|------|-------------|
| `keepalive` | `boolean \| KeepAliveProps` | Cache page component |
| `pageKey` | `string \| Function` | Control when page re-renders |
| `transition` | `TransitionProps \| false` | Override page transition |

## GDC Routing Conventions

- MongoDB IDs use `[_id]` param naming
- Admin routes under `/admin/**` — all use `layout: 'admin'` via route rules
- Auth middleware: `middleware/auth.ts` — protects `/admin/*` routes
- Public pages: `/`, `/about`, `/bottles`, `/menu`, `/events/*`, `/contact`
- Report pages: `/admin/reports/*` (production, ttb-*, tabc-*)
