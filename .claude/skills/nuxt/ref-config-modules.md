# Nuxt 4 Configuration & Modules Reference

Nuxt 4.3.1 | nuxt.config.ts | Runtime config | App config | Modules | Layers
Docs: https://nuxt.com/docs/4.x/getting-started/configuration | https://nuxt.com/docs/4.x/directory-structure/nuxt-config

## nuxt.config.ts — Key Options

```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',   // REQUIRED in Nuxt 4

  modules: ['@nuxt/ui', '@pinia/nuxt', 'nuxt-mongoose'],  // Executed in order

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },
  devServer: { port: 3001 },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      meta: [{ property: 'og:site_name', content: 'Galveston Distilling Co' }],
      link: [{ rel: 'icon', href: '/favicon.ico' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  routeRules: {
    '/': { prerender: true },
    '/admin/**': { ssr: false },
    '/api/bottle/public': { swr: 300 },
  },

  runtimeConfig: {
    apiSecret: '',           // Server-only → NUXT_API_SECRET
    public: { apiBase: '' }, // Client + server → NUXT_PUBLIC_API_BASE
  },

  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'lightningcss' },
  },

  nitro: {
    prerender: { routes: [], crawlLinks: true },
    compressPublicAssets: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,        // Disable for faster dev, enable in CI
  },

  experimental: {
    defaults: { nuxtLink: { prefetchOn: 'interaction' } },
  },
})
```

## Runtime Config

Docs: https://nuxt.com/docs/4.x/guide/going-further/runtime-config

```ts
// nuxt.config.ts — define defaults (empty strings as placeholders)
runtimeConfig: {
  sessionSecret: '',        // → NUXT_SESSION_SECRET
  stripe: { key: '' },      // → NUXT_STRIPE_KEY
  public: {
    stripe: { key: '' },    // → NUXT_PUBLIC_STRIPE_KEY
  },
}
```

- Env vars MUST match nested path with `_` separators: `runtimeConfig.stripe.key` → `NUXT_STRIPE_KEY`
- `.env` for development only — use platform env vars in production
- Server-only: `useRuntimeConfig(event)` in server routes
- Public (anywhere): `useRuntimeConfig().public`
- NEVER use `process.env` at runtime — always `useRuntimeConfig()`

## App Config

Docs: https://nuxt.com/docs/4.x/guide/directory-structure/app-config

```ts
// app.config.ts
export default defineAppConfig({
  theme: { primaryColor: '#1B4D3E' },
  ui: { /* Nuxt UI component defaults */ },
})
```

```ts
// Usage — reactive, auto-imported
const appConfig = useAppConfig()
appConfig.theme.primaryColor  // Reactive read

// Client-side update (does NOT persist across requests)
updateAppConfig({ theme: { primaryColor: '#2E7D32' } })
```

## Decision Matrix: runtimeConfig vs appConfig vs .env

| Need | Use | Why |
|------|-----|-----|
| API keys, DB URIs, secrets | `runtimeConfig` (non-public) | Server-only, env-overridable |
| Public URLs, feature flags | `runtimeConfig.public` | Client-accessible, env-overridable |
| Theme colors, UI defaults | `appConfig` | Reactive, no env needed |
| Build-time only values | `.env` + `process.env` in config | Only available at build time |
| Per-request server values | `runtimeConfig` + event | Scoped to request context |

| Feature | `runtimeConfig` | `appConfig` |
|---------|-----------------|-------------|
| Defined in | `nuxt.config.ts` | `app.config.ts` |
| Access | `useRuntimeConfig()` | `useAppConfig()` |
| Env override | Yes (`NUXT_*`) | No |
| Server secrets | Yes (non-public keys) | No — client-exposed |
| Reactive | No | Yes |
| Best for | API keys, URLs, secrets | Theme, UI config, feature flags |

## Modules

Docs: https://nuxt.com/docs/4.x/guide/concepts/modules

### Order matters — modules that depend on others must come after them.

```ts
modules: [
  '@nuxt/ui',               // Must come before modules that use its components
  '@pinia/nuxt',
  'nuxt-mongoose',
  ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module'] : []),
],
```

### GDC installed modules:

| Module | Purpose | Config Key |
|--------|---------|------------|
| `@nuxt/ui` | Component library (v4) | `ui` |
| `@vueuse/nuxt` | VueUse composables | — |
| `nuxt-mongoose` | MongoDB/Mongoose | `mongoose` |
| `@pinia/nuxt` | State management | — |
| `@unlok-co/nuxt-stripe` | Stripe payments | `stripe` |
| `nuxt-meta-pixel` | Facebook tracking | `metapixel` |
| `@nuxtjs/sitemap` | Sitemap generation | `sitemap` |
| `@nuxt/image` | Image optimization | `image` |

### Module config examples:

```ts
mongoose: {
  uri: process.env.NUXT_ENV_MONGODB_URI || '',
  options: {},
  modelsDir: 'models',
},
sitemap: { exclude: ['/admin/**', '/login', '/return'] },
image: { quality: 80, formats: ['webp', 'avif'] },
```

## Layers

Docs: https://nuxt.com/docs/4.x/getting-started/layers

```ts
export default defineNuxtConfig({
  extends: [
    './base-layer',                    // Local directory
    'github:org/repo',                 // GitHub
    'npm:@company/nuxt-base-layer',   // npm package
  ],
})
```

Layers share: components, composables, pages, layouts, plugins, utils, server routes, and config. Child config merges over parent.

## Aliases

| Alias | Resolves to | Context |
|-------|------------|---------|
| `~` / `@` | `<srcDir>` (project root in Nuxt 4) | Components, pages, composables |
| `~~` / `@@` | `<rootDir>` | Monorepo root |
| `#imports` | Auto-imported composables/utils | Explicit imports when auto-import disabled |
| `#components` | Auto-imported components | Explicit component imports |
| `#server` | `server/utils/` | Server-side auto-imports |
| `#app` | Nuxt app runtime | Internal Nuxt composables |
| `#build` | Build output directory | Generated types and manifests |

```ts
// Auto-import config
imports: {
  dirs: ['utils/**', 'composables/**'],
},
components: {
  dirs: [{ path: '~/components', pathPrefix: false }],
},
```

## TypeScript Config

Docs: https://nuxt.com/docs/4.x/guide/concepts/typescript

```ts
// nuxt.config.ts
typescript: {
  strict: true,              // Enables strict mode in generated tsconfig
  typeCheck: false,           // Set true for CI — runs vue-tsc alongside build
  tsConfig: {
    compilerOptions: {
      moduleResolution: 'bundler',
      verbatimModuleSyntax: true,
    },
  },
},
```

- Nuxt auto-generates `.nuxt/tsconfig.json` — extend it, do not replace
- Run `npx nuxi typecheck` for standalone type checking
- `shim: false` (Nuxt 4 default) — disables legacy `*.vue` shims, relies on Volar

## Anti-Patterns

1. **`process.env` at runtime** — use `useRuntimeConfig()` instead
2. **Secrets in `runtimeConfig.public`** — use non-public keys for server-only values
3. **Secrets in `app.config.ts`** — fully client-exposed
4. **Hardcoded env values** — use empty defaults with env var override
5. **Module order ignored** — dependent modules must come after their dependencies
6. **Missing `compatibilityDate`** — required in Nuxt 4, build will warn/fail
7. **Replacing tsconfig.json** — extend Nuxt's generated config instead
