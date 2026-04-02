# Nuxt 4 TypeScript Reference

Nuxt 4.3.1 | Auto-imports | Type augmentation | Project references | Strict patterns
Docs: https://nuxt.com/docs/4.x/getting-started/introduction#typescript

## Auto-Imports

Docs: https://nuxt.com/docs/4.x/guide/concepts/auto-imports

### Auto-imported directories:

| Directory | What's imported | Scope |
|-----------|----------------|-------|
| `composables/` | All exported functions (recursive) | App |
| `utils/` | All exported functions (recursive) | App |
| `server/utils/` | All exported functions (recursive) | Server only |
| `vue` | ref, computed, watch, onMounted, etc. | App |
| `vue-router` | useRoute, useRouter | App |
| `nuxt` | useFetch, useAsyncData, useState, navigateTo | App |
| `h3` | defineEventHandler, readBody, createError | Server only |

### `#imports` for explicit imports:
```ts
// Use when auto-import isn't available (e.g., standalone .ts files, tests)
import { ref, computed, useFetch, useRoute, navigateTo } from '#imports'
```

### Custom auto-import dirs:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: ['services', 'helpers/**'],  // Add custom dirs
    autoImport: false,                 // Disable entirely (not recommended)
  },
})
```

## Type Aliases

| Alias | Resolves to | Available in |
|-------|-------------|--------------|
| `#imports` | All auto-imported composables, utils, Vue/Nuxt APIs | App + Server |
| `#components` | All auto-imported components | App |
| `#server` | `server/utils/` exports | Server only |
| `~` / `@` | Project root (srcDir) | App + Server |
| `#app` | Nuxt app internals (NuxtApp, NuxtError, etc.) | App |
| `#build` | Build-time generated types | Both |

```ts
import { UButton, UModal } from '#components'       // Rarely needed
import { sanitize, validateBody } from '#server'     // Server code only
import type { Batch } from '~/types'                 // Path alias
import type { NuxtError } from '#app'                // Nuxt internals
```

## Project References

Docs: https://nuxt.com/docs/4.x/getting-started/introduction#typescript

Nuxt 4 generates separate tsconfigs for type isolation:

```
.nuxt/
├── tsconfig.json          → Root config (extends all)
├── tsconfig.app.json      → Client/universal code
└── tsconfig.server.json   → Server-only code
```

### Key implications:
- Server types (H3, Nitro) are NOT available in client code
- Client types (Vue, browser APIs) are NOT available in server code
- `#server` alias only resolves in server context
- Run `npx nuxi prepare` to regenerate types after config changes

### IDE setup:
- Root `tsconfig.json` extends `.nuxt/tsconfig.json` automatically
- Restart TS server after `nuxi prepare` for fresh types

## Type Augmentation

### Extending RuntimeConfig:
```ts
// Automatically typed from nuxt.config.ts — no manual declaration needed
// nuxt.config.ts runtimeConfig shape generates the types
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',           // Private — server only
    public: { apiBase: '' }, // Public — server + client
  },
})
```

### Extending AppConfig:
```ts
// app.config.ts — auto-typed
export default defineAppConfig({
  theme: { primaryColor: '#3B82F6' },
})

// types/app-config.d.ts — for stricter typing
declare module 'nuxt/schema' {
  interface AppConfigInput {
    theme?: { primaryColor?: string }
  }
}
export {}
```

### Extending PageMeta:
```ts
// types/router.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAdmin?: boolean
  }
}
export {}  // Required — makes it a module
```

### Extending NuxtApp:
```ts
// types/nuxt.d.ts
declare module '#app' {
  interface NuxtApp {
    $myHelper: () => void
  }
}
export {}
```

## Strict TypeScript

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,       // Enables strict in generated tsconfig
    typeCheck: true,     // Runs vue-tsc on build (slower builds)
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,  // Additional strictness
      },
    },
  },
})
```

### Decision matrix:
| Setting | Dev speed | Type safety | Recommended |
|---------|-----------|-------------|-------------|
| `strict: false` | Fast | Low | No |
| `strict: true` | Normal | High | Yes |
| `strict: true` + `typeCheck: true` | Slow | Highest | CI only |

## import.meta

Docs: https://nuxt.com/docs/4.x/api/advanced/import-meta

Compile-time constants — dead code is tree-shaken in production.

```ts
// Nuxt 4 BREAKING — replaces process.client/process.server
if (import.meta.client) { /* browser only */ }
if (import.meta.server) { /* SSR only */ }
if (import.meta.dev) { /* development only */ }
if (import.meta.prerender) { /* during prerendering */ }
if (import.meta.test) { /* test environment */ }
```

| Check | True when |
|-------|-----------|
| `import.meta.client` | Running in browser |
| `import.meta.server` | Running on server (SSR) |
| `import.meta.dev` | Development mode |
| `import.meta.prerender` | During prerendering |
| `import.meta.test` | Test environment |

## Component Typing

### defineProps:
```ts
const props = defineProps<{
  batch: Batch
  editable?: boolean
}>()

// With defaults
const props = withDefaults(defineProps<{
  title: string
  count?: number
}>(), {
  count: 0,
})
```

### defineEmits:
```ts
const emit = defineEmits<{
  submit: [batch: Batch]
  cancel: []
  update: [field: string, value: unknown]
}>()
```

### defineModel (two-way binding):
```ts
// Parent: <MyInput v-model="name" v-model:count="total" />
const name = defineModel<string>({ required: true })
const count = defineModel<number>('count', { default: 0 })
```

### defineExpose:
```ts
defineExpose({
  reset: () => { /* ... */ },
  validate: (): boolean => { /* ... */ },
})

// Parent access via template ref
const formRef = useTemplateRef<InstanceType<typeof MyForm>>('form')
formRef.value?.reset()
```

## Server Typing

### Typed event handlers:
```ts
export default defineEventHandler(async (event): Promise<Batch[]> => {
  return BatchModel.find().lean()
})
```

### readValidatedBody with Zod:
```ts
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    name: z.string().min(1),
    email: z.string().email(),
    quantity: z.coerce.number().positive(),
  }).parse)
  // body is fully typed: { name: string; email: string; quantity: number }
})
```

### Typed query and params:
```ts
const query = await getValidatedQuery(event, z.object({
  page: z.coerce.number().default(1),
}).parse)

const params = await getValidatedRouterParams(event, z.object({
  id: z.string().min(1),
}).parse)
```

## Common Patterns

### Type-safe $fetch:
```ts
// In Pinia stores or composables
const batches = await $fetch<Batch[]>('/api/batch')
const batch = await $fetch<Batch>(`/api/batch/${id}`)
const created = await $fetch<Batch>('/api/batch/create', {
  method: 'POST',
  body: { name: 'New Batch' },
})
```

### Typed composables:
```ts
// composables/useBatchFilter.ts
export function useBatchFilter(batches: Ref<Batch[]>) {
  const status = ref<BatchStatus>('brewing')
  const filtered = computed(() =>
    batches.value.filter(b => b.status === status.value)
  )
  return { status, filtered }
}
```

### Utility types:
```ts
import type { NuxtError } from '#app'
import type { H3Event } from 'h3'
import type { RouteLocationNormalized } from 'vue-router'

// Extract useFetch return type
type FetchReturn<T> = ReturnType<typeof useFetch<T>>

// Template ref typing
const formRef = useTemplateRef<InstanceType<typeof UForm>>('form')
const divRef = useTemplateRef<HTMLDivElement>('myDiv')
```

### Type guard pattern (prefer over non-null assertion):
```ts
// BAD
const id = route.params._id!

// GOOD
const id = route.params._id
if (!id || typeof id !== 'string') {
  throw createError({ status: 400, statusText: 'Missing ID' })
}
```

## Anti-Patterns

1. `process.client`/`process.server` — use `import.meta.client`/`import.meta.server`
2. Importing `#server` in client code — server-only alias, causes build errors
3. Skipping `npx nuxi prepare` after config changes — stale types
4. Using `any` for API responses — type with `useFetch<Type>()` or `$fetch<Type>()`
5. Missing `export {}` in `.d.ts` augmentation files — won't be treated as modules
6. Non-null assertions (`!`) — use type guards or runtime checks instead
