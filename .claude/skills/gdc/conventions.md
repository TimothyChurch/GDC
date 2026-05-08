# GDC Conventions

## File naming

| Layer | Pattern | Example |
|---|---|---|
| Server route (CRUD) | `server/api/{resource}/index.get.ts`, `[id].get.ts`, `create.post.ts`, `[id].put.ts`, `[id].delete.ts` | `server/api/batch/[id].put.ts` |
| Mongoose schema | `server/models/{resource}.schema.ts` | `server/models/batch.schema.ts` |
| TypeScript interface | `types/interfaces/{Resource}.ts` (PascalCase) | `types/interfaces/Batch.ts` |
| Pinia store | `stores/use{Resource}Store.ts` | `stores/useBatchStore.ts` |
| Composable | `composables/use{Thing}.ts` (or kebab/lower for non-`use`) | `composables/useBatchStore.ts`, `composables/batchPipeline.ts` |
| Component | `components/{Group}/{GroupName}.vue` (PascalCase, prefixed with group) | `components/Panel/PanelBatch.vue` |
| Page | `pages/{path}.vue` (kebab-case) | `pages/admin/batch/[_id].vue` |

## ⚠️ Param naming inconsistency (existing tech debt)

API routes mix `[id]` and `[_id]` for dynamic params:
- `[id]`: batch, cocktail, contact, event, message, production, vessel, upload
- `[_id]`: bottle, bulkSpirit, inventory, item, purchaseOrder, recipe, users

Pages mix `[_id]` and `[id]` similarly. **For new resources: pick `[id]` and stick with it** unless modifying an existing resource (don't change a working route's name).

## Server API patterns

### CRUD via `api-handlers.ts` factory (preferred for new routes)

```ts
import { Resource } from '#server'  // mongoose model auto-import
import { resourceCreateSchema } from '~/server/utils/validation'

export default createCreateHandler(Resource, {
  schema: resourceCreateSchema,
  populate: 'someRef',
  falsyFields: ['optionalRef'],   // strip if empty string
})
```

Available factories in `server/utils/api-handlers.ts`:
- `createGetAllHandler(model, { select, sort, populate, limit })`
- `createGetByIdHandler(model, { populate })`
- `createCreateHandler(model, { schema, populate, falsyFields })`
- `createUpdateHandler(model, { schema, populate, nullableFields })` — `nullableFields: ['contact']` allows `null` to clear a ref
- `createDeleteHandler(model, { references: [{ model, field }], preDelete })`

### Custom routes (when factories don't fit)

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const sanitized = sanitize(body)                       // strip $/__proto__
  await validateBody(sanitized, mySchema)                // yup validation
  validateObjectId(sanitized.itemId, 'itemId')           // ObjectId guard
  // … logic
  return { ok: true }
})
```

`server/utils/validation.ts` exports `sanitize`, `validateBody`, `validateObjectId`, plus all yup schemas.

### Auth gating

- `server/middleware/auth.ts` runs on every API call; rejects unauthed requests except a hard-coded public list.
- Inside a handler, escalate with `requireRole(event, 'Admin', 'Manager')` from `server/utils/rbac.ts`.
- Public routes must be added to the public list in the middleware **and** to the `routeRules` SWR config in `nuxt.config.ts` if cacheable.

## Pinia store patterns

### Default: use the `useCrudStore` factory

```ts
// stores/useFooStore.ts
import { defineStore } from 'pinia'
import type { Foo } from '~/types'

export const useFooStore = defineStore('foo', () => {
  const crud = useCrudStore<Foo>({
    name: 'foo',
    apiPath: '/api/foo',
    defaultItem: { name: '' },
    sort: (a, b) => a.name.localeCompare(b.name),
    beforeCreate: (item) => stripEmpty(item, ['recipe']),
  })
  // domain-specific helpers
  const lowStock = computed(() => crud.items.value.filter(/*…*/))
  return { ...crud, lowStock }
})
```

### Auto-fetch pattern

Stores call `ensureLoaded()` lazily — components don't need to manually fetch. `ensureLoaded()` is idempotent (no-op if already loaded).

### Singletons (Settings)

`useSettingsStore` is the only store that doesn't follow CRUD — single document, GET/PUT only. Don't force it through `useCrudStore`.

## Vue component patterns

- `<script setup lang="ts">` everywhere — no Options API
- Auto-imports: `ref`, `computed`, `useState`, `definePageMeta`, `useRoute`, `useRouter`, all components, all composables, all stores
- Pages set layout via `definePageMeta({ layout: 'admin' })`
- Pages set auth via `definePageMeta({ middleware: 'auth' })`
- Toasts via `useToast()` (Nuxt UI v4)
- Modals/panels via `useOverlay()` and `LazyPanel*` components — see `components.md`

## Error handling

- **Client side**: catch + `getErrorMessage(err)` from `utils/errorMessage.ts` → toast
- **Server side**: throw with `createError({ statusCode, statusMessage })`; H3 handles serialization
- Server util `isH3Error()` in `server/utils/errorMessage.ts` (different from client's — both are needed)

## Validation

- Yup schemas live in `server/utils/validation.ts` — one place, reused by every route
- Two schemas per resource: `*CreateSchema` (strict) and `*UpdateSchema` (partial)
- `sanitize()` is called BEFORE validate to strip `$`, `__proto__`, `prototype`, `constructor`

## TypeScript

- `tsconfig.json` is minimal — extends `.nuxt/tsconfig.json`
- Type imports: `import type { Batch } from '~/types'` — barrel exports from `types/index.ts`
- IDs are typed as `string` in interfaces (Mongoose returns ObjectId, JSON serializes to string)
- `import.meta.client` / `import.meta.server` for SSR guards (Nuxt 4)

## Styling

- Tailwind v4 with `@nuxt/ui` v4 — color tokens via `app.config.ts` (theme.primaryColor, etc.)
- Custom fonts: Merriweather + Cormorant Garamond (defined in `assets/css/main.css`)
- Site uses warm/amber palette; admin uses neutral palette
- Dark mode via `useColorMode()` from VueUse — toggle in `composables/dark.ts`

## Lazy loading

- Heavy components (Panels, Modals): always `LazyPanelX` / `LazyModalX` for code-splitting
- Public landing components: `LazySite*` for below-the-fold
- Page-level: SSR disabled for `/admin/**` (client-only) — see `nuxt.config.ts`
