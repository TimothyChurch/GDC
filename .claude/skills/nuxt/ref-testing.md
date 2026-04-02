# Nuxt 4 Testing Reference

Nuxt 4.3.1 | Vitest | @nuxt/test-utils | Component testing | API testing
Docs: https://nuxt.com/docs/4.x/getting-started/testing | https://nuxt.com/docs/4.x/api/kit/test-utils

## Setup

### vitest.config.ts (defineVitestConfig):
```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,              // Use describe/it/expect without imports
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['utils/**', 'composables/**', 'server/utils/**'],
    },
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
})
```

### nuxt.config.ts — register test module conditionally:
```ts
modules: [
  ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module'] : []),
],
```

## GDC Test Structure

```bash
npm run test          # Run all tests
npx vitest run        # Run once (CI)
npx vitest --watch    # Watch mode
npx vitest run tests/utils/conversions.test.ts  # Single file
```

```
tests/
├── utils/
│   ├── conversions.test.ts    — Unit conversion utilities
│   ├── formatting.test.ts     — Formatting helpers
│   └── proofGallons.test.ts   — Proof gallon calculations
├── composables/
│   └── definitions.test.ts    — Liquor definitions
└── server/
    └── validation.test.ts     — Zod/Yup validation schemas, sanitize()
```

File naming: `tests/<layer>/<module>.test.ts` — mirrors source structure.

## Decision Matrix

| What to test | Approach | Tools | When to use |
|---|---|---|---|
| Pure functions (utils, helpers) | Unit test | `vitest` | Always — fast, no setup |
| Composables (no DOM) | Unit test | `vitest` + mock imports | Stateless logic, computed values |
| Vue components | Component test | `mountSuspended` | Render output, prop behavior, events |
| API route handlers | Unit test | Direct import + mock event | Validate request handling, errors |
| useFetch / data flow | Component test | `registerEndpoint` | Test component with mocked API |
| Pinia stores | Unit test | `createPinia` + mock `$fetch` | Store actions, state mutations |
| Auth middleware | Unit test | Mock `navigateTo` + context | Route guard logic |
| Full user flows | E2E test | Playwright / Cypress | Critical paths only (login, checkout) |

## Unit Testing — Pure Functions

```ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '~/utils/helpers'

describe('myFunction', () => {
  it('handles basic case', () => {
    expect(myFunction('input')).toBe('expected')
  })

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toBeUndefined()
  })

  it('handles floating point', () => {
    expect(myFunction(0.1 + 0.2)).toBeCloseTo(0.3, 5)
  })
})
```

### Common assertions:
```ts
expect(value).toBe(exact)              // Strict equality
expect(value).toEqual(deep)            // Deep equality
expect(value).toBeCloseTo(0.3, 5)     // Float comparison
expect(value).toBeTruthy()             // Truthy check
expect(value).toContain('substring')   // String/array contains
expect(value).toHaveLength(3)          // Length check
expect(fn).toThrow('message')          // Error throwing
expect(fn).toHaveBeenCalledWith(args)  // Mock verification
```

## Component Testing

### mountSuspended — SSR-aware mounting (returns Vue Test Utils wrapper):
```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'

it('renders component with props', async () => {
  const component = await mountSuspended(MyComponent, {
    props: { title: 'Test' },
  })
  expect(component.text()).toContain('Test')
  expect(component.find('h1').exists()).toBe(true)
})

it('emits events', async () => {
  const component = await mountSuspended(MyButton)
  await component.find('button').trigger('click')
  expect(component.emitted('submit')).toHaveLength(1)
})
```

### renderSuspended — Testing Library integration:
```ts
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'

it('renders accessible content', async () => {
  await renderSuspended(MyComponent, { props: { label: 'Submit' } })
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDefined()
})
```

## Mocking

### mockNuxtImport — mock auto-imported composables:
```ts
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useAuth', () => {
  return () => ({
    user: ref({ name: 'Test User' }),
    isAuthenticated: ref(true),
  })
})

mockNuxtImport('useRoute', () => {
  return () => ({ params: { _id: 'abc123' } })
})
```

### mockComponent — replace component in tests:
```ts
import { mockComponent } from '@nuxt/test-utils/runtime'

mockComponent('ChartBottleInventory', {
  setup() {
    return () => h('div', 'mocked chart')
  },
})
```

### vi.mock — standard Vitest patterns:
```ts
import { vi } from 'vitest'

vi.mock('~/utils/helpers', () => ({
  formatDate: vi.fn(() => '2024-01-01'),
}))

// Spy on functions
const spy = vi.spyOn(console, 'error')
myFunction()
expect(spy).toHaveBeenCalledWith('expected error')
spy.mockRestore()
```

## API Testing

### registerEndpoint — mock API routes for component tests:
```ts
import { registerEndpoint } from '@nuxt/test-utils/runtime'

registerEndpoint('/api/batch', {
  method: 'GET',
  handler: () => [
    { _id: '1', name: 'Batch 1' },
    { _id: '2', name: 'Batch 2' },
  ],
})

registerEndpoint('/api/batch/:id', {
  method: 'PUT',
  handler: async (event) => {
    const body = await readBody(event)
    return { _id: getRouterParam(event, 'id'), ...body }
  },
})
```

### Testing server handlers directly:
```ts
import { describe, it, expect } from 'vitest'
import { sanitize, batchCreateSchema } from '~/server/utils/validation'

describe('sanitize', () => {
  it('strips NoSQL injection operators', () => {
    expect(sanitize({ email: { $ne: '' } })).toEqual({ email: {} })
  })

  it('removes prototype pollution keys', () => {
    expect(sanitize({ __proto__: { admin: true }, name: 'ok' }))
      .toEqual({ name: 'ok' })
  })
})

describe('batchCreateSchema', () => {
  it('validates valid batch', async () => {
    const valid = { recipe: 'abc', batchSize: 50, batchSizeUnit: 'gal',
                    pipeline: ['Mashing'], currentStage: 'Upcoming' }
    await expect(batchCreateSchema.validate(valid)).resolves.toBeDefined()
  })

  it('rejects invalid batch size', async () => {
    await expect(batchCreateSchema.validate({ recipe: 'abc', batchSize: -1,
      batchSizeUnit: 'gal', pipeline: ['Mashing'], currentStage: 'Upcoming',
    })).rejects.toThrow('Must be greater than 0')
  })
})
```

## Common Patterns

### Testing Pinia stores:
```ts
import { createPinia, setActivePinia } from 'pinia'

describe('useBatchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useBatchStore()
    expect(store.batches).toEqual([])
  })

  it('creates a batch via $fetch', async () => {
    vi.mocked($fetch).mockResolvedValue({ _id: '1', name: 'New' })
    const store = useBatchStore()
    await store.createBatch({ name: 'New' })
    expect(store.batches).toHaveLength(1)
  })
})
```

### Testing middleware:
```ts
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const navigateToMock = vi.fn()
mockNuxtImport('navigateTo', () => navigateToMock)

it('redirects unauthenticated users', async () => {
  mockNuxtImport('useAuth', () => () => ({ isAuthenticated: ref(false) }))
  await authMiddleware({ path: '/admin/batch' } as any)
  expect(navigateToMock).toHaveBeenCalledWith('/login')
})
```

### Testing useFetch consumers:
```ts
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { mountSuspended } from '@nuxt/test-utils/runtime'

registerEndpoint('/api/bottles', () => [{ _id: '1', name: 'Bourbon' }])

it('renders fetched bottles', async () => {
  const component = await mountSuspended(BottleList)
  expect(component.text()).toContain('Bourbon')
})
```

## Anti-Patterns

1. Testing implementation details (internal state) instead of behavior
2. Not using `toBeCloseTo` for floating-point comparisons
3. Testing Mongoose models directly — requires DB connection; mock `$fetch` instead
4. Not resetting mocks between tests — use `beforeEach` + `vi.clearAllMocks()`
5. Overly broad tests — prefer one assertion per behavior
6. Skipping edge cases (empty arrays, undefined, zero, negative values)
7. Importing from `#imports` without mocking in unit tests
