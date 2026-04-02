# Nuxt 4 Server & Nitro Reference

Nuxt 4.3.1 | Nitro server engine | H3 HTTP framework
Docs: https://nuxt.com/docs/4.x/directory-structure/server | https://nitro.build/guide

## Directory Structure

```
server/
├── api/           → Auto-prefixed with /api/*
├── routes/        → No prefix, maps to /*
├── middleware/     → Runs before ALL routes (server-side)
├── plugins/       → Nitro lifecycle hooks
└── utils/         → Auto-imported helpers (#server alias)
```

- `server/utils/` exports are auto-imported across all `server/` code
- Use `#server` alias for clean imports within server directory (client code errors on import)
- Nuxt 4 generates separate `tsconfig.json` for `server/` — better type inference

## API Route Handlers

### HTTP method matching (suffix convention):
```ts
// server/api/users.get.ts    → GET  /api/users
// server/api/users.post.ts   → POST /api/users
// server/api/users/[id].ts   → /api/users/:id (all methods)
// server/api/foo/[...slug].ts → catch-all
```

### Handler structure:
```ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return { id }  // Auto-serialized to JSON
})
```

### Environment-specific handlers:
```ts
// server/routes/test.get.dev.ts   → only in development
// server/routes/test.get.prod.ts  → only in production
```

## Request Handling (All auto-imported from H3)

### Validated input (RECOMMENDED — use Zod or Yup):
```ts
import { z } from 'zod'

// Body (POST/PUT only — throws 405 on GET)
const body = await readValidatedBody(event, z.object({
  name: z.string(),
  email: z.string().email(),
}).parse)

// Query params
const query = await getValidatedQuery(event, z.object({
  page: z.coerce.number().default(1),
}).parse)

// Route params
const params = await getValidatedRouterParams(event, z.object({
  id: z.string().min(1),
}).parse)
```

### Other utilities:
```ts
const cookies = parseCookies(event)
setCookie(event, 'name', 'value', { httpOnly: true })
const auth = getRequestHeader(event, 'authorization')
setResponseStatus(event, 202)
await sendRedirect(event, '/new-path', 302)
```

### Background tasks (non-blocking):
```ts
export default defineEventHandler((event) => {
  event.waitUntil(sendEmailNotification())  // Runs after response sent
  return 'done'
})
```

### Internal server-to-server calls:
```ts
// Forwards headers and context automatically
const data = await event.$fetch('/api/other')
```

## Error Handling

Docs: https://nuxt.com/docs/4.x/api/utils/create-error

```ts
throw createError({
  status: 404,         // HTTP status code (default: 500)
  statusText: 'Not Found',  // Sent to client
  data: { field: 'id' },    // Additional client-visible data
  cause: originalError,      // For stack traces
})
```

### Nuxt 4.3 BREAKING — use Web API naming:
```diff
- createError({ statusCode: 404, statusMessage: 'Not Found' })
+ createError({ status: 404, statusText: 'Not Found' })
```

- `statusText` and `data` are visible to clients; `message` is NOT propagated
- Always `throw` (not `return`) createError in server handlers

## Server Middleware

Docs: https://nuxt.com/docs/4.x/directory-structure/server

Runs before EVERY route handler. Completely separate from Vue route middleware.

```ts
// server/middleware/log.ts
export default defineEventHandler((event) => {
  console.log('Request:', getRequestURL(event))
  // MUST NOT return anything — only modify event or throw
})
```

- Order controlled by filename: `01.cors.ts`, `02.auth.ts`
- Use `event.context` to pass data to handlers: `event.context.auth = { user: 123 }`
- For route-specific logic, check path: `if (!getRequestURL(event).pathname.startsWith('/api/')) return`

## Runtime Configuration

Docs: https://nuxt.com/docs/4.x/api/composables/use-runtime-config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',           // Private: server-only
    public: { apiBase: '' }  // Public: server + client
  },
})
```

Env vars: `NUXT_API_SECRET`, `NUXT_PUBLIC_API_BASE` (`.env` for dev only — use platform vars in production)

```ts
// In server handlers — ALWAYS pass event
const config = useRuntimeConfig(event)
const secret = config.apiSecret
```

## Caching

Docs: https://nitro.build/guide/cache

### Cached event handlers:
```ts
export default defineCachedEventHandler((event) => {
  return fetchExpensiveData()
}, {
  maxAge: 60 * 60,      // 1 hour
  swr: true,            // Serve stale while revalidating
  name: 'stats',        // Cache key identifier
  varies: ['cookie'],   // Differentiate by request headers
})
```

### Cached functions (reusable across handlers):
```ts
// server/utils/github.ts
export const getGitHubStars = defineCachedFunction(
  async (repo: string) => {
    const data = await $fetch(`https://api.github.com/repos/${repo}`)
    return data.stargazers_count
  },
  { maxAge: 60 * 60, name: 'ghStars', getKey: (repo) => repo }
)
```

### Route-level caching in config:
```ts
routeRules: {
  '/api/products/**': { cache: { maxAge: 3600 } },
}
```

## Route Rules

Docs: https://nuxt.com/docs/4.x/guide/concepts/rendering

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/admin/**': { ssr: false },
    '/api/**': { cors: true },
    '/old-page': { redirect: '/new-page' },
    '/admin/**': { appLayout: 'admin' },        // NEW in 4.3
    '/protected/**': { appMiddleware: 'auth' },
  },
})
```

| Property | Purpose |
|----------|---------|
| `prerender` | Static HTML at build time |
| `swr` | Stale-while-revalidate (server cache) |
| `isr` | Incremental Static Regeneration (CDN cache) |
| `ssr` | Enable/disable SSR per route |
| `cache` | `{ maxAge: number }` for API responses |
| `cors` | Add CORS headers |
| `headers` | Custom response headers |
| `redirect` | Server-side redirect |
| `appLayout` | Layout assignment (4.3+) |
| `appMiddleware` | Route middleware |
| `noScripts` | Disable JS loading |

## Server Plugins

```ts
// server/plugins/my-plugin.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => { /* ... */ })
  nitroApp.hooks.hook('error', (error) => { /* ... */ })
})
```

## Anti-Patterns

1. Returning values from server middleware (breaks request pipeline)
2. Calling `readBody` on GET requests (throws 405)
3. Using `message` in createError expecting client visibility (use `statusText`)
4. Not passing `event` to `useRuntimeConfig()` (prevents per-request overrides)
5. Using bare `throw new Error()` instead of `createError()`
6. Using deprecated `statusCode`/`statusMessage` (use `status`/`statusText`)
7. Putting secrets in `runtimeConfig.public`
8. Blocking handlers with long sync operations — use `event.waitUntil()`

## GDC Project Conventions

- Auth: session-based via `server/utils/session.ts` with h3 `useSession()` encrypted cookies
- Validation: `server/utils/validation.ts` — `sanitize()` then `validateBody()` (Yup) on all POST/PUT
- Handler pattern: auth check → input extraction → validation → business logic → return
- Sensitive fields excluded: `.select('-password')`
- Resources: batch, bottle, cocktail, contact, inventory, item, production, purchaseOrder, recipe, users, vessel
