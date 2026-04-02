# Nuxt 4 Deployment Reference

Nuxt 4.3.1 | Netlify | Environment variables | Build optimization | Preview
Docs: https://nuxt.com/docs/4.x/getting-started/deployment

## 1. Netlify Deployment

### netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_OPTIONS = "--max-old-space-size=4096"
```

### How it works:
1. `npm run build` → Nitro builds to `.output/`
2. Netlify auto-detects Nuxt → uses `netlify` preset
3. Server routes → Netlify Functions (serverless)
4. Static assets → Netlify CDN
5. Prerendered pages → static HTML files

### Netlify preset (auto-detected):
```ts
// nuxt.config.ts — usually NOT needed (auto-detected)
export default defineNuxtConfig({
  nitro: {
    preset: 'netlify',  // Only set manually if detection fails
  },
})
```

## 2. Environment Variables

Docs: https://nuxt.com/docs/4.x/guide/going-further/runtime-config

### Naming convention (NUXT_ prefix):
```
# Server-only (runtimeConfig root keys)
NUXT_SESSION_SECRET=your-secret
NUXT_STRIPE_KEY=sk_live_...

# Client-exposed (runtimeConfig.public keys)
NUXT_PUBLIC_STRIPE_KEY=pk_live_...

# Non-NUXT (read directly by modules)
NUXT_ENV_MONGODB_URI=mongodb+srv://...
```

### How env mapping works:
```ts
// nuxt.config.ts
runtimeConfig: {
  sessionSecret: '',     // ← NUXT_SESSION_SECRET
  stripe: { key: '' },   // ← NUXT_STRIPE_KEY
  public: {
    stripe: { key: '' }, // ← NUXT_PUBLIC_STRIPE_KEY
  },
}
```

### Build-time vs runtime env vars:

| Type | When resolved | Example |
|------|--------------|---------|
| `runtimeConfig` | At runtime (server start) | `NUXT_SESSION_SECRET` |
| `runtimeConfig.public` | At runtime (injected into client) | `NUXT_PUBLIC_STRIPE_KEY` |
| `process.env` in config | At build time only | `NUXT_ENV_MONGODB_URI` (module config) |
| `appConfig` | At build time (bundled) | Static app settings |

- `.env` file for local dev only — set vars in Netlify dashboard for production
- Nested keys use `_` separators: `stripe.key` → `NUXT_STRIPE_KEY`

## 3. Build Optimization

### Commands:
```bash
npm run build      # Production build
npx nuxi analyze   # Bundle size analysis (opens interactive visualization)
```

### Build output:
```
.output/
├── server/        → Serverless functions
│   ├── chunks/    → Server code chunks
│   └── index.mjs  → Entry point
├── public/        → Static assets + prerendered HTML
│   ├── _nuxt/     → Client JS/CSS bundles
│   └── *.html     → Prerendered pages
└── nitro.json     → Build metadata
```

### Reduce bundle size:
```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
  },
  experimental: {
    treeshakeClientOnly: true,
  },
})
```

### Vite splitChunks for large deps:
```ts
// nuxt.config.ts
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chart': ['chart.js'],
          'stripe': ['@stripe/stripe-js'],
        },
      },
    },
  },
},
```

## 4. Preview

```bash
npm run build && npm run preview
# Serves production build at http://localhost:3000
```

- Tests SSR, API routes, and prerendered pages locally
- Uses `.env` for environment variables (same as dev)
- Netlify deploy previews: every PR gets a unique URL with scoped env vars

## 5. Static Generation

Docs: https://nuxt.com/docs/4.x/api/commands/generate

### Full static site:
```bash
npx nuxi generate   # Prerender all discoverable routes to .output/public/
```

### Selective prerendering via routeRules:
```ts
// nuxt.config.ts
routeRules: {
  '/': { prerender: true },
  '/about': { prerender: true },
  '/privacy': { prerender: true },
  '/contact': { prerender: true },
}
```

### Programmatic prerender hints:
```ts
// nuxt.config.ts
nitro: {
  prerender: {
    routes: ['/sitemap.xml', '/robots.txt'],
    crawlLinks: true,   // Follow links from prerendered pages
    ignore: ['/admin'],  // Skip admin routes
  },
}
```

### Decision: prerender vs SSR vs SPA

| Route type | Strategy | Config |
|-----------|----------|--------|
| Marketing pages | Prerender | `{ prerender: true }` |
| Product listings | SWR cache | `{ swr: 300 }` |
| Admin dashboard | Client-only SPA | `{ ssr: false }` |
| API endpoints | Server cache | `{ cache: { maxAge: 3600 } }` |

## 6. Common Deployment Issues

### Build fails with memory error
**Fix**: `NODE_OPTIONS = "--max-old-space-size=4096"` in netlify.toml

### API routes return 404
**Cause**: Netlify Functions not deployed. **Fix**: Ensure `publish = "dist"` matches build output.

### Environment variables not loading
**Fix**: Check `NUXT_*` naming convention. Redeploy after adding vars in Netlify dashboard.

### MongoDB connection fails in production
**Fix**: Set `NUXT_ENV_MONGODB_URI` in Netlify + whitelist `0.0.0.0/0` in MongoDB Atlas.

### Prerendered pages show stale data
**Fix**: Use `swr` instead of `prerender` for dynamic content.

### SSR errors that work in dev
**Cause**: Browser APIs (window, document, localStorage) used during SSR.
**Fix**: Guard with `import.meta.client` or use `.client.vue` suffix.

### Server-only modules imported in client code
**Cause**: Mongoose, fs, or node modules imported in components.
**Fix**: Keep node-only code in `server/` directory. Use `#server` alias.

## 7. CDN & Caching

### Route-level caching in nuxt.config.ts:
```ts
routeRules: {
  // Static assets — immutable, long cache
  '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  // API: stale-while-revalidate
  '/api/bottle/public': { swr: 300 },
  '/api/cocktail/public': { swr: 300 },
  '/api/event/upcoming': { swr: 60 },
  // CORS for API routes
  '/api/**': { cors: true },
}
```

### Netlify CDN headers:
```toml
# netlify.toml
[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

## 8. CI/CD Patterns

### Basic Netlify CI (automatic):
Netlify runs `npm run build` on every push. No additional CI config needed for simple deploys.

### GitHub Actions (test before deploy):
```yaml
# .github/workflows/deploy.yml
name: Test & Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

### Build command with tests:
```toml
# netlify.toml — fail deploy if tests fail
[build]
  command = "npm run test && npm run build"
```

### Branch deploy strategy:

| Branch | Deploy context | URL |
|--------|---------------|-----|
| `main` | Production | galvestondistilling.com |
| `develop` | Branch deploy | develop--site.netlify.app |
| PR branches | Deploy preview | deploy-preview-42--site.netlify.app |
