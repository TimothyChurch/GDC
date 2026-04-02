# Nuxt 4 Error Handling Reference

Nuxt 4.3.1 | Error pages | Error boundaries | createError | showError
Docs: https://nuxt.com/docs/4.x/getting-started/error-handling

## Decision Matrix

| Scenario | Use | Why |
|----------|-----|-----|
| API route validation/not-found | `throw createError()` server-side | Returns proper HTTP error JSON |
| Page-level fatal error (client) | `throw createError({ fatal: true })` | Shows `error.vue` full-page |
| Non-fatal client error display | `showError()` | Triggers `error.vue` without throwing |
| Recoverable component error | `<NuxtErrorBoundary>` | Catches render errors, shows fallback UI |
| Middleware auth check | `abortNavigation(createError(...))` | Stops navigation, shows error page |
| useFetch failure handling | `error` ref + `onResponseError` | Graceful per-request error handling |
| Global error logging | `vue:error` hook in plugin | Catches all unhandled Vue errors |

## error.vue — Full-Screen Error Page

```vue
<!-- error.vue (project root, NOT in pages/) -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold">{{ error.statusCode }}</h1>
    <p class="mt-2">{{ error.statusMessage || error.message }}</p>
    <UButton class="mt-4" @click="handleError">Go Home</UButton>
  </div>
</template>
```

**NuxtError properties:**
```ts
interface NuxtError {
  statusCode: number        // HTTP status code
  statusMessage: string     // User-facing message
  message: string           // Detailed message (dev mode)
  data: any                 // Custom structured error data
  url: string               // Request URL that caused the error
  cause: Error              // Original underlying error
}
```

Note: In Nuxt 4, `error.vue` receives `error` as a **prop**, not via `useError()`.

## createError — Throwing Errors

### Server-side (API routes) — throws H3Error:
```ts
// server/api/batch/[_id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, '_id')
  const batch = await BatchModel.findById(id)

  if (!batch) {
    throw createError({
      status: 404,             // Nuxt 4: use 'status' (not 'statusCode')
      statusText: 'Not Found', // Nuxt 4: use 'statusText' (not 'statusMessage')
      data: { id },            // Sent to client — use for structured info
    })
  }
  return batch
})
```

### Client-side — triggers error page:
```ts
// fatal: true → replaces page with error.vue
throw createError({
  statusCode: 404,
  statusMessage: 'Page Not Found',
  fatal: true,
})

// fatal: false (default) → error is catchable by NuxtErrorBoundary
throw createError({
  statusCode: 400,
  statusMessage: 'Invalid input',
})
```

### Nuxt 4 BREAKING — server createError naming:
```diff
// Server-side (H3 standard)
- createError({ statusCode: 404, statusMessage: 'Not Found' })
+ createError({ status: 404, statusText: 'Not Found' })

// Client-side (still accepts both)
createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
```

- **Server**: `status` + `statusText` (Web API standard). `message` is for logging only, NOT sent to clients.
- **Client**: Can use `statusCode`/`statusMessage` or `status`/`statusText`.
- `data` is always sent to clients — use for structured error info.

## showError — Trigger Error Page Without Throwing

```ts
// Useful inside catch blocks or conditional logic
showError({
  statusCode: 500,
  statusMessage: 'Something went wrong',
})

// With custom data
showError(createError({
  statusCode: 403,
  statusMessage: 'Access Denied',
  data: { requiredRole: 'admin' },
}))
```

## clearError — Clearing Errors

```ts
clearError()                        // Just clear, stay on current route
clearError({ redirect: '/' })      // Clear and redirect home
clearError({ redirect: '/login' }) // Clear and redirect to login
```

### useError composable:
```ts
const error = useError()  // Ref<NuxtError | undefined>
if (error.value) {
  console.log(error.value.statusCode)
}
```

## NuxtErrorBoundary — Component-Level Error Catching

```vue
<template>
  <NuxtErrorBoundary @error="logError">
    <template #default>
      <SomeRiskyComponent />
    </template>

    <template #error="{ error, clearError }">
      <div class="p-4 bg-red-50 rounded">
        <p>Failed to load: {{ error.message }}</p>
        <UButton @click="clearError">Retry</UButton>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>

<script setup lang="ts">
const logError = (error: Error) => {
  console.error('Caught by boundary:', error)
}
</script>
```

**Key behaviors:**
- Catches **render errors** in child components only
- Does NOT catch errors in `<script setup>` execution
- `clearError` re-renders the default slot (retries rendering)
- `@error` event fires when an error is caught
- Nest multiple boundaries for granular error handling per section

## API Error Handling — Server Event Handlers

```ts
// server/api/production/create.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation errors
  if (!body.batchId) {
    throw createError({ status: 400, statusText: 'batchId is required' })
  }

  try {
    const result = await ProductionModel.create(body)
    return result
  } catch (err: any) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      throw createError({
        status: 422,
        statusText: 'Validation Failed',
        data: err.errors,
      })
    }
    // Re-throw unexpected errors as 500
    throw createError({ status: 500, statusText: 'Internal Server Error' })
  }
})
```

## useFetch Error Handling

```ts
// Error ref
const { data, error, status } = await useFetch('/api/batch')

// Nuxt 4: error is Ref<Error | undefined> (was Ref<Error | null>)
if (error.value) {
  console.error(error.value.statusCode)
  console.error(error.value.data)  // Auto-parsed in Nuxt 4
}

// Watch for errors reactively
watch(error, (err) => {
  if (err) showError({ statusCode: err.statusCode, statusMessage: err.message })
})

// onResponseError interceptor — handle specific status codes
const { data } = await useFetch('/api/batch', {
  onResponseError({ response }) {
    if (response.status === 401) navigateTo('/login')
    if (response.status === 403) showError({ statusCode: 403, statusMessage: 'Forbidden' })
  },
})
```

## Nuxt 4 Error Handling Changes (vs Nuxt 3)

| Change | Nuxt 3 | Nuxt 4 |
|--------|--------|--------|
| Server createError fields | `statusCode`, `statusMessage` | `status`, `statusText` |
| `error` ref default | `null` | `undefined` |
| `error.data` parsing | Manual | Automatic |
| error.vue receives error | Via `useError()` or prop | **Prop only** |

## Anti-Patterns

1. **`message` in server `createError`** expecting client visibility — use `statusText` instead
2. **`throw new Error()` in API routes** — use `createError()` for proper HTTP status codes
3. **Ignoring `error` ref from `useFetch`** — always check and display errors to users
4. **Placing `error.vue` in `pages/`** — it belongs in the project root
5. **Using `statusCode`/`statusMessage` in server `createError`** — deprecated in Nuxt 4
6. **Omitting `fatal: true`** on client `createError` when you want `error.vue` — without it, only `NuxtErrorBoundary` catches it
7. **Catching errors silently** without user feedback — always show fallback UI or message
