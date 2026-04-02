# Nuxt 4 Data Fetching & State Management Reference

Nuxt 4.3.1 | Pinia for state | useFetch/useAsyncData for SSR-safe fetching
Docs: https://nuxt.com/docs/4.x/getting-started/data-fetching | https://nuxt.com/docs/4.x/getting-started/state-management

## Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| Render data in page/component setup | `useFetch` | SSR-safe, auto-dedup, payload transfer |
| Complex async (multiple calls, transforms) | `useAsyncData` + `$fetch` | Full control over fetching logic |
| Button clicks, form submits | `$fetch` directly | No SSR concern, no reactive state needed |
| Shared global state with CRUD actions | Pinia store | Persistent across navigation, devtools |
| Simple shared reactive value | `useState` | SSR-safe ref replacement |
| Below-fold / non-blocking data | `useLazyFetch` | Does not block navigation |
| Client-only data | `useFetch({ server: false, lazy: true })` | Skips SSR, fetches on mount |
| Fetch on demand | `useFetch({ immediate: false })` | Call `execute()` when ready |

## useFetch

Docs: https://nuxt.com/docs/4.x/api/composables/use-fetch

```ts
const { data, pending, status, error, refresh, execute, clear } = await useFetch(
  '/api/items',  // string | Ref<string> | () => string
  {
    method: 'GET',
    query: { page: 1 },           // Reactive — auto-refetches on change
    body: { name: 'test' },       // For POST/PUT
    headers: { Authorization: 'Bearer ...' },
    key: 'items',                  // Deduplication key (auto-generated if omitted)
    server: true,                  // Execute on server (default: true)
    lazy: false,                   // Non-blocking navigation (default: false)
    immediate: true,               // Fire immediately (default: true)
    deep: false,                   // Shallow ref (default in Nuxt 4: false)
    watch: [someRef],              // Reactive sources for auto-refresh (or false)
    default: () => [],             // Factory for initial value
    transform: (data) => data,     // Modify response before caching
    pick: ['title', 'id'],         // Select specific keys (reduces payload)
    dedupe: 'cancel',              // 'cancel' | 'defer' for concurrent requests
    timeout: 5000,                 // Milliseconds before abort
    getCachedData(key, nuxtApp, ctx) {
      // ctx.cause: 'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'
      return nuxtApp.payload.data[key]  // Return undefined to trigger fresh fetch
    },
    // Interceptors (from ofetch)
    onRequest({ request, options }) {},
    onResponse({ response }) {},
    onResponseError({ response }) {},
  }
)
```

### Return value:
```ts
data: Ref<T | undefined>       // shallowRef in Nuxt 4 (NOT deep reactive)
pending: Ref<boolean>           // true only when status === 'pending'
status: Ref<'idle' | 'pending' | 'success' | 'error'>
error: Ref<Error | undefined>  // undefined when no error (was null in Nuxt 3)
refresh: (opts?) => Promise<void>
execute: (opts?) => Promise<void>  // Same as refresh
clear: () => void               // Reset to default, cancel pending
```

## useAsyncData

Docs: https://nuxt.com/docs/4.x/api/composables/use-async-data

```ts
const { data } = await useAsyncData(
  'user-profile',  // Key (string | Ref | () => string)
  (nuxtApp, { signal }) => $fetch('/api/profile'),
  { /* same options as useFetch minus HTTP-specific ones */ }
)
```

- Key can be reactive — auto-refetches when key changes
- Handler receives `AbortSignal` for cancellation
- Key can be omitted (auto-generated from file/line) but explicit is recommended

## $fetch

Docs: https://nuxt.com/docs/4.x/api/utils/dollarfetch

- Built on `ofetch` library, auto-imported globally
- **In server routes**: Internal API calls skip network (direct function call)
- **In browser**: Cookies/headers included automatically
- **In SSR context**: Does NOT forward cookies by default — use `useRequestFetch()`

```ts
// Forward cookies during SSR
const requestFetch = useRequestFetch()
const data = await requestFetch('/api/me')

// Or manually
const headers = useRequestHeaders(['cookie'])
const data = await $fetch('/api/me', { headers })
```

## Nuxt 4 Breaking Changes (vs Nuxt 3)

### 1. Shallow reactivity by default
```ts
// Nuxt 4: data is shallowRef — in-place mutation does NOT trigger reactivity
data.value.someProperty = 'new'  // SILENT FAILURE

// Fix: Replace entire object
data.value = { ...data.value, someProperty: 'new' }

// Or opt in to deep reactivity
const { data } = await useFetch('/api/items', { deep: true })
```

### 2. Singleton data layer — shared keys share data
Multiple components using the same key share `data`, `error`, `status` refs.
- `deep`, `transform`, `pick`, `getCachedData`, `default` must MATCH across same-key calls
- Data auto-cleaned when last consumer unmounts

### 3. Default values changed
- `data` defaults to `undefined` (was `null`)
- `error` defaults to `undefined` (was `null`)

### 4. Pending behavior changed
`pending` is `true` only when `status === 'pending'`. With `immediate: false`, `pending` starts `false`.

### 5. Dedupe boolean removed
```diff
- refresh({ dedupe: true })
+ refresh({ dedupe: 'cancel' })
```

### 6. getCachedData enhanced
Called on every fetch (including watch/manual refresh), receives `ctx.cause`.

### 7. Parsed error data
`error.data` is automatically parsed — no manual JSON parsing needed.

## useState

Docs: https://nuxt.com/docs/4.x/api/composables/use-state

SSR-safe `ref` replacement. JSON-serializable values only.

```ts
// composables/useCounter.ts
export const useCounter = () => useState('counter', () => 0)

// Any component
const counter = useCounter()
counter.value++

// Clear state
clearNuxtState('counter')  // Resets to initial value in Nuxt 4
```

## Pinia SSR Integration

Docs: https://pinia.vuejs.org/ssr/nuxt.html

`@pinia/nuxt` handles automatic state serialization/deserialization via Nuxt's payload.

### SSR best practices:
1. Use `import.meta.client` (NOT deprecated `process.client`) for client-only logic
2. Use `skipHydrate()` for non-serializable values:
   ```ts
   import { skipHydrate } from 'pinia'
   const router = useRouter()
   const routerRef = skipHydrate(ref(router))
   ```
3. Pass `pinia` instance when using stores outside setup:
   ```ts
   const pinia = usePinia()
   const store = useMyStore(pinia)
   ```
4. No module-scope mutable state outside `defineStore` — causes SSR memory leaks

### GDC store pattern:
Stores use `$fetch` in actions with `ensureLoaded()` lazy loading. CUD ops mutate local state. This is valid — Pinia handles SSR state transfer.

## SSR Hydration Best Practices

### How it works:
1. Server runs `useFetch`/`useAsyncData`, stores in `nuxtApp.payload.data[key]`
2. Server renders HTML with the data
3. Client receives HTML + serialized payload (via `devalue` — supports Date, Map, Set, Ref)
4. Client hydration checks payload first — no re-fetch

### Header/cookie forwarding:
- `useFetch` with relative URLs auto-proxies browser headers (via `useRequestFetch()`)
- For manual `$fetch`: whitelist specific headers only
- NEVER proxy: `host`, `accept`, `content-length`, `x-forwarded-*`, `cf-*`

### Payload minimization:
```ts
const { data } = await useFetch('/api/mountains', {
  pick: ['title', 'description'],  // Only these fields in payload
})
```

### Serialization note:
- Payload (server → client): `devalue` — Date, Map, Set, Ref supported
- API routes (server → browser): `JSON.stringify` — Date objects become strings

## Anti-Patterns

1. **`$fetch` in component setup** — double-fetches (server + client). Use `useFetch` instead
2. **Side effects in `useAsyncData` handler** — may run multiple times. Use `callOnce()` instead
3. **Conflicting options with same key** — same key must have matching `transform`, `pick`, `deep`, `default`
4. **Static URL with reactive params** — URL must be a getter/computed for reactive refetching:
   ```ts
   // BAD: URL built once
   useFetch(`/api/users/${id.value}`, { watch: [id] })
   // GOOD: Reactive URL
   useFetch(() => `/api/users/${id.value}`)
   ```
5. **Proxying all headers to external APIs** — SSRF risk. Whitelist specific headers
6. **Mutable state outside `defineStore`/`useState`** — SSR memory leak
7. **Mutating shallowRef in-place** — no reactivity in Nuxt 4. Replace entire object
8. **Using `useRoute()` in middleware** — use `to`/`from` parameters instead
9. **Composables after `await`** — Nuxt context lost after await in setup
