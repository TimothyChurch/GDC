# Nuxt 4 Composables & Plugins Reference

Nuxt 4.3.1 | Auto-imported composables | defineNuxtPlugin
Docs: https://nuxt.com/docs/4.x/directory-structure/composables | https://nuxt.com/docs/4.x/directory-structure/plugins

## Auto-Import Directories

```
composables/          → Auto-imported (top-level + named exports)
utils/                → Auto-imported (top-level + named exports)
server/utils/         → Auto-imported in server/ code only
```

### Scanning rules:
- Only top-level files and `index.ts` in subdirectories are scanned
- Named exports and default exports are both auto-imported
- Nested directories (e.g., `composables/helpers/math.ts`) are NOT auto-imported unless configured

### Custom auto-import directories:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: ['composables/**', 'utils/**'],  // Enable recursive scanning
  },
})
```

## Key Nuxt Composables

### callOnce — Run code exactly once (SSR-safe):
```ts
// Runs on server during SSR, skips on client hydration
await callOnce(async () => {
  await initializeAnalytics()
})

// With key (for deduplication across components)
await callOnce('init-tracking', async () => {
  await setupTracking()
})

// Nuxt 4: runs in all environments by default
// To restrict: callOnce({ mode: 'server' }, callback)
```

### useCookie — SSR-safe cookie access:
```ts
const token = useCookie('auth-token', {
  maxAge: 60 * 60 * 24 * 7,  // 7 days
  httpOnly: false,             // false to access in client
  secure: true,
  sameSite: 'lax',
  default: () => '',
  watch: true,                 // Watch for changes (default: true)
})

// Read/write (reactive)
console.log(token.value)
token.value = 'new-token'

// Delete cookie
token.value = null
```

### useState — SSR-safe reactive state:
```ts
// Define shared state
const counter = useState('counter', () => 0)
counter.value++

// Clear state
clearNuxtState('counter')

// clearNuxtState() clears ALL state
```

### useRequestHeaders — Forward browser headers during SSR:
```ts
const headers = useRequestHeaders(['cookie', 'authorization'])
const data = await $fetch('/api/me', { headers })
```

### useRequestFetch — Auto-forward headers:
```ts
const requestFetch = useRequestFetch()
const data = await requestFetch('/api/me')  // Cookies forwarded automatically
```

### useRequestURL — Get current request URL:
```ts
const url = useRequestURL()
console.log(url.origin)   // https://galvestondistilling.com
console.log(url.pathname)  // /admin/batch/123
```

### useNuxtApp — Access Nuxt app instance:
```ts
const nuxtApp = useNuxtApp()
nuxtApp.payload.data       // SSR payload
nuxtApp.hook('page:finish', () => { /* ... */ })
nuxtApp.$fetch             // Configured fetch instance
```

### useRuntimeConfig:
```ts
// In components/composables (no event needed)
const config = useRuntimeConfig()
const publicKey = config.public.stripe.key

// In server handlers (ALWAYS pass event)
const config = useRuntimeConfig(event)
const secret = config.sessionSecret
```

### useAppConfig:
```ts
const appConfig = useAppConfig()
appConfig.theme.primaryColor  // Reactive
```

### refreshNuxtData — Refetch all or specific data:
```ts
// Refresh all useFetch/useAsyncData
await refreshNuxtData()

// Refresh specific keys
await refreshNuxtData(['batches', 'recipes'])
```

### clearNuxtData — Clear cached data:
```ts
clearNuxtData('batches')    // Clear specific key
clearNuxtData()             // Clear all
```

### preloadComponents — Preload lazy components:
```ts
await preloadComponents('LazyBatchForm')
await preloadComponents(['LazyBatchForm', 'LazyRecipeForm'])
```

## Plugins

Docs: https://nuxt.com/docs/4.x/directory-structure/plugins

### Plugin directory:
```
plugins/
├── chartjs.ts           → Runs on client + server
├── analytics.client.ts  → Client-only (suffix)
└── logger.server.ts     → Server-only (suffix)
```

### Basic plugin:
```ts
// plugins/chartjs.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Registration logic
  nuxtApp.vueApp.component('Chart', ChartComponent)
})
```

### Plugin with provide (inject helper):
```ts
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      formatDate: (date: Date) => date.toLocaleDateString(),
    },
  }
})

// Usage in components:
const { $formatDate } = useNuxtApp()
$formatDate(new Date())
```

### Plugin execution order:
```ts
// plugins/01.init.ts (numbered prefix for ordering)
export default defineNuxtPlugin({
  name: 'init-plugin',
  enforce: 'pre',         // 'pre' | 'default' | 'post'
  dependsOn: ['other-plugin'],  // Wait for dependency
  async setup(nuxtApp) {
    // Plugin logic
  },
})
```

### Plugin with hooks:
```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    // App is created
  })

  nuxtApp.hook('page:start', () => {
    // Navigation started
  })

  nuxtApp.hook('page:finish', () => {
    // Navigation complete
  })

  nuxtApp.hook('vue:error', (error) => {
    // Vue error caught
  })
})
```

## App Lifecycle Hooks

### Client-side hooks:
| Hook | When |
|------|------|
| `app:created` | Vue app created |
| `app:mounted` | Vue app mounted to DOM |
| `app:suspense:resolve` | Suspense resolved |
| `page:start` | Navigation begins |
| `page:finish` | Navigation complete |
| `page:transition:finish` | After page transition |
| `vue:error` | Vue error caught |
| `vue:setup` | Component setup runs |

### Server-side hooks:
| Hook | When |
|------|------|
| `app:rendered` | SSR render complete |
| `app:redirected` | Redirect during SSR |
| `app:error` | Fatal error during SSR |
| `app:error:cleared` | Error cleared |

## GDC Composable Patterns

### Custom composable structure:
```ts
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)

  const login = async (email: string, password: string) => {
    const data = await $fetch('/api/users/find', {
      method: 'PUT',
      body: { email, password },
    })
    user.value = data
  }

  const logout = () => {
    user.value = null
    navigateTo('/login')
  }

  return { user, login, logout }
}
```

### Composable conventions:
- Prefix with `use` — `useAuth`, `useProofingCalculator`, `useBatchStore`
- Return reactive state and methods as an object
- Use `useState` for SSR-safe shared state (not plain `ref`)
- Place in `composables/` for auto-import

### GDC key composables:
| Composable | Purpose |
|------------|---------|
| `useAuth` | Login/logout, user state |
| `useProofingCalculator` | Alcohol proofing calculations |
| `definitions` | Liquor class/type constants |
| `modalStatus` | Modal open/close state |
| `status` | Batch status definitions |
| `batchPipeline` | Pipeline stage management |
| `useProductionCosts` | Cost calculations |
| `useTABCCalculations` | TABC regulatory calcs |

## Anti-Patterns

1. Using composables after `await` in setup — Nuxt context is lost
2. Calling composables outside setup/plugin context — will error
3. Using `ref()` for shared state instead of `useState()` — SSR hydration mismatch
4. Heavy initialization in plugins — prefer composables with lazy init
5. Not using suffixes (`.client.ts`, `.server.ts`) for environment-specific plugins
6. Module-scope mutable state in composables — SSR memory leak
7. Not providing `event` to `useRuntimeConfig()` in server handlers
