# Nuxt 3 → 4 Migration Reference

All breaking changes consolidated | Nuxt 4.3.1
Docs: https://nuxt.com/docs/getting-started/upgrade

---

## 1. Directory Structure

Docs: https://nuxt.com/docs/4.x/guide/directory-structure

Nuxt 4 defaults `srcDir` to `app/` instead of the project root.

| Directory | Nuxt 3 (root) | Nuxt 4 (default) |
|-----------|---------------|-------------------|
| Components, pages, layouts, middleware, plugins, composables, utils, assets | `./components/` etc. | `app/components/` etc. |
| Server | `./server/` | `./server/` (unchanged, resolves from rootDir) |
| Layers, modules, public | `./layers/` etc. | `./layers/` etc. (unchanged, resolves from rootDir) |
| Shared code (NEW) | N/A | `shared/utils/`, `shared/types/` (auto-imported in both app and server) |
| TypeScript configs | Single `tsconfig.json` | Separate `tsconfig.app.json` + `tsconfig.server.json` |

### Keep root-level structure (no move required):
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: '.',
})
```

### Or move files into app/:
```bash
mkdir app
mv components/ composables/ layouts/ middleware/ pages/ plugins/ utils/ assets/ app.vue app.config.ts app/
```

---

## 2. Data Fetching Changes

Docs: https://nuxt.com/docs/4.x/getting-started/data-fetching

### Shallow reactivity by default (`deep: false`)
```diff
  const { data } = await useFetch('/api/items')
- data.value.name = 'new'           // Nuxt 3: triggers reactivity
+ data.value.name = 'new'           // Nuxt 4: SILENT FAILURE (shallowRef)

  // Fix 1: Replace entire object
+ data.value = { ...data.value, name: 'new' }

  // Fix 2: Opt in to deep reactivity
+ const { data } = await useFetch('/api/items', { deep: true })
```

### Default values changed from `null` to `undefined`
```diff
- data.value === null                // Nuxt 3 initial
+ data.value === undefined           // Nuxt 4 initial

- error.value === null               // Nuxt 3 no error
+ error.value === undefined          // Nuxt 4 no error

  // Safe check (works for both):
  if (data.value) { ... }
```

### Pending behavior aligned with status
```diff
- // Nuxt 3: pending starts true even with immediate: false
+ // Nuxt 4: pending is true ONLY when status === 'pending'
+ // With immediate: false, pending starts false
```

### Dedupe boolean removed
```diff
- refresh({ dedupe: true })          // Nuxt 3: boolean
+ refresh({ dedupe: 'cancel' })      // Nuxt 4: string only
- refresh({ dedupe: false })
+ refresh({ dedupe: 'defer' })
```

### Singleton data layer
- Multiple components using the same `key` now share `data`, `error`, and `status` refs
- `deep`, `transform`, `pick`, `getCachedData`, `default` must MATCH across same-key calls
- Data auto-cleaned when last consumer unmounts

### getCachedData receives context
```ts
getCachedData(key, nuxtApp, ctx) {
  // ctx.cause: 'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'
  if (ctx.cause === 'refresh:manual') return undefined // force refetch
  return nuxtApp.payload.data[key]
}
```

### Error data auto-parsed
```diff
- const parsed = JSON.parse(error.value.data)  // Nuxt 3: manual parse
+ const parsed = error.value.data               // Nuxt 4: already parsed
```

### clearNuxtData / clearNuxtState behavior
```diff
- clearNuxtState('key')  // Nuxt 3: set to undefined
+ clearNuxtState('key')  // Nuxt 4: reset to initial value (from factory)
```

---

## 3. Error Handling

Docs: https://nuxt.com/docs/4.x/getting-started/error-handling

### createError uses Web API naming (server-side)
```diff
  // In server/api/ handlers:
- throw createError({ statusCode: 404, statusMessage: 'Not Found' })
+ throw createError({ status: 404, statusText: 'Not Found' })
```

- `statusCode`/`statusMessage` still work client-side but deprecated on server
- `message` field is NOT sent to clients — use `statusText` for user-facing messages
- `data` field IS sent to clients and auto-parsed

---

## 4. TypeScript Changes

Docs: https://nuxt.com/docs/4.x/guide/concepts/typescript

### Environment checks — `import.meta` replaces `process`
```diff
- if (process.client) { ... }
+ if (import.meta.client) { ... }

- if (process.server) { ... }
+ if (import.meta.server) { ... }

- if (process.dev) { ... }
+ if (import.meta.dev) { ... }
```

### Stricter index access
`compilerOptions.noUncheckedIndexedAccess` is now `true` by default:
```ts
const arr = [1, 2, 3]
const val = arr[0] // Type: number | undefined (was number in Nuxt 3)
```

### Separate TypeScript configs
- `tsconfig.app.json` — client/Vue types only
- `tsconfig.server.json` — H3/Nitro types only
- Server types (H3, Nitro) not available in client code and vice versa
- `#server` alias only works in server context

### builder:watch emits absolute paths
```diff
  nuxt.hook('builder:watch', (event, path) => {
-   // path was relative: 'components/MyComp.vue'
+   // path is now absolute: '/home/user/project/components/MyComp.vue'
  })
```

---

## 5. Composable Changes

### callOnce runs in ALL environments
```diff
- // Nuxt 3: only ran on server during SSR
+ // Nuxt 4: runs in ALL environments by default
+ callOnce({ mode: 'server' }, callback)  // restrict to server only
```

### useServerSeoMeta deprecated
```diff
- useServerSeoMeta({ description: 'Static text' })
+ if (import.meta.server) {
+   useSeoMeta({ description: 'Static text' })
+ }
```

### useCookie — no behavioral changes but check types
Default values follow the same `null` → `undefined` pattern as data fetching.

---

## 6. Compatibility Flags

Docs: https://nuxt.com/docs/getting-started/upgrade

### Full Nuxt 4 mode (recommended for new projects):
```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  // No future.compatibilityVersion needed — Nuxt 4 is already v4
})
```

### Gradual migration with individual flags:
```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  experimental: {
    normalizePageNames: false,   // keep old page component names
  },
})
```

### Testing Nuxt 5 early:
```ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 5,    // opt in to Nuxt 5 breaking changes
  },
})
```

---

## 7. Removed / Deprecated Features

| Feature | Status | Replacement |
|---------|--------|-------------|
| `window.__NUXT__` | Removed after hydration | `useNuxtApp().payload` |
| `useServerSeoMeta` | Deprecated | `if (import.meta.server) useSeoMeta(...)` |
| `process.client/server/dev` | Deprecated | `import.meta.client/server/dev` |
| `generate` top-level config | Removed | `nitro: { prerender: { ... } }` |
| Head tag `vmid`/`hid`/`children`/`body` props | Removed (Unhead v2) | Use `key` for dedup |
| EJS template compilation | Removed | `getContents()` function |
| `treeshakeClientOnly` experimental flag | Always `true` | N/A |
| `configSchema` experimental flag | Always `true` | N/A |
| `polyfillVueUseHead` experimental flag | Always `false` | N/A |
| `respectNoSSRHeader` experimental flag | Always `false` | N/A |
| Boolean `dedupe` in refresh | Removed | `'cancel'` or `'defer'` string |

---

## 8. Template & Component Changes

### Page component names normalized
Page component names now match route names (affects `<KeepAlive>`):
```diff
  <KeepAlive
-   :include="['index']"
+   :include="['index']"   // now matches route.name, not file name
  />
```

### Route metadata deduplication
```diff
- route.meta.name           // Nuxt 3: duplicated in meta
+ route.name                // Nuxt 4: access directly on route
```

### Middleware folder scanning
Child folders in `middleware/` with `index` files are now auto-registered as middleware (consistent with plugins behavior).

### SPA loading screen location
SPA loading template renders outside `#__nuxt__` div. Revert:
```ts
experimental: { spaLoadingTemplateLocation: 'within' }
```

---

## 9. Config Changes

### compatibilityDate is required
```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',  // REQUIRED in Nuxt 4
})
```

### generate → nitro.prerender
```diff
- generate: { exclude: ['/admin'], routes: ['/sitemap.xml'] }
+ nitro: { prerender: { ignore: ['/admin'], routes: ['/sitemap.xml'] } }
```

### Route rules — new layout and middleware assignment (4.3+)
```ts
routeRules: {
  '/admin/**': { appLayout: 'admin' },
  '/protected/**': { appMiddleware: 'auth' },
}
```

### Module loading order corrected
Layer modules now load BEFORE project modules (reversed from Nuxt 3).

### Vite Environment API (Nuxt 5 preview)
`server`/`client` options in `extendViteConfig()` deprecated — use `applyToEnvironment()` hook.

---

## Migration Checklist

### Required
- [ ] Add `compatibilityDate` to nuxt.config.ts
- [ ] Replace `process.client/server/dev` with `import.meta.client/server/dev`
- [ ] Update `createError` to use `status`/`statusText` in server routes
- [ ] Replace `dedupe: true/false` with `dedupe: 'cancel'/'defer'`
- [ ] Run `npx nuxi prepare` to regenerate types

### Data Fetching
- [ ] Audit in-place mutations of `useFetch`/`useAsyncData` data (shallowRef)
- [ ] Update `null` checks to `undefined` checks (or use truthiness)
- [ ] Verify `pending` usage — no longer `true` before first fetch with `immediate: false`
- [ ] Check for conflicting options on same-key data fetching calls
- [ ] Remove manual `JSON.parse` on `error.value.data`

### Head & SEO
- [ ] Replace `useServerSeoMeta` with guarded `useSeoMeta`
- [ ] Remove `vmid`, `hid`, `children`, `body` from head tags

### Directory & Types
- [ ] Either move files to `app/` or set `srcDir: '.'`
- [ ] Update `builder:watch` hooks to handle absolute paths
- [ ] Handle `noUncheckedIndexedAccess` type errors
- [ ] Consider splitting shared code into `shared/utils/` and `shared/types/`

### Testing
- [ ] Test `callOnce` behavior — now runs in all environments
- [ ] Test `clearNuxtData`/`clearNuxtState` — resets to initial value, not undefined
- [ ] Verify `<KeepAlive>` include/exclude lists match route names
- [ ] Run full build: `npm run build`
