# GDC Architecture

## Stack (verified against package.json — CLAUDE.md was wrong on several)

| Layer | Tech |
|---|---|
| Framework | Nuxt 4.3.1, Vue 3.5, TypeScript |
| Database | MongoDB Atlas via `nuxt-mongoose` (Mongoose 8) |
| State | Pinia 2 |
| UI | Nuxt UI v4, Tailwind CSS v4, `@nuxt/image` |
| Auth | **Custom** session-based (`server/utils/session.ts` + `useSession`). NOT next-auth or @sidebase/nuxt-auth. |
| Payments | **Square** (`square` SDK). NOT Stripe. |
| Uploads | Cloudinary |
| Calendar | v-calendar |
| Charts | chart.js + vue-chartjs |
| Analytics | nuxt-meta-pixel (Facebook Pixel) |
| SEO | @nuxtjs/sitemap |
| Validation | yup |
| Testing | Vitest + happy-dom + @nuxt/test-utils |

**Not present** (despite CLAUDE.md claims): `@sidebase/nuxt-auth`, `next-auth`, `socket.io`, `@stripe/stripe-js`-as-primary, `prisma` (installed but not used).

## Layout

```
GDC/
├── app.vue               UApp wrapper, age modal mount
├── error.vue             Top-level error page
├── nuxt.config.ts        Modules, route rules, runtime config, CSP headers
├── layouts/
│   ├── admin.vue         AdminHeader + AdminSidebar + breadcrumbs + slot
│   └── default.vue       SiteHeader + slot + SiteFooter + ModalAge
├── middleware/auth.ts    Client-side guard for /admin/*
│
├── server/
│   ├── api/              102 file-based REST routes (see api.md)
│   ├── models/           18 Mongoose schemas
│   ├── middleware/auth.ts  Session-based gate for non-public routes
│   └── utils/            api-handlers (CRUD factory), validation (yup), rbac, session, cloudinary, square,
│                          transferEngine (atomic ledger), transferEngineCore (invariants), unitConverter (strict)
│
├── stores/               17 Pinia stores (16 use useCrudStore factory)
├── composables/          27 composables (auth, calculations, definitions, UI helpers)
├── utils/                10 utilities (conversions, proofGallons, formatting, helpers)
├── types/interfaces/     22 TypeScript interfaces (one per resource + DTOs)
│
├── components/           142 components in 20 folders + 6 root orphans
├── pages/                73 pages (10 public + 1 admin parent + 62 admin)
│
├── plugins/              EMPTY (no custom plugins)
├── public/               Static assets
├── scripts/              7 one-off migration scripts (TS, run with tsx)
└── tests/                5 unit test files (~1% coverage)
```

## Data flow (request → response)

```
[Browser]
  ↓
Page (pages/admin/*.vue)
  ↓ uses
Store (stores/use*Store.ts) — Pinia
  ↓ $fetch
API route (server/api/*/*.ts) — defineEventHandler
  ↓ checks
auth middleware (server/middleware/auth.ts) — session
  ↓ delegates to
api-handlers.ts factory OR custom logic
  ↓ validates with
validation.ts (yup schema) + sanitize() + validateObjectId()
  ↓ writes via
Mongoose model (server/models/*.schema.ts)
  ↓
MongoDB Atlas
```

## Route rules (nuxt.config.ts)

- All routes get strict security headers (X-Frame-Options DENY, CSP, HSTS, no-sniff)
- `/api/**` → `Cache-Control: private, no-store`
- `/admin/**` → `ssr: false` (client-only render)
- `/`, `/about`, `/privacy`, `/contact` → prerendered
- `/api/bottle/public`, `/api/cocktail/public` → SWR 300s
- `/api/event/upcoming` → SWR 60s
- Sitemap excludes `/admin/**`, `/login`, `/return`

## Auto-import boundaries

- `composables/`, `utils/`, `components/`, `stores/` → auto-imported in client code
- `server/utils/` → auto-imported in server routes (Nuxt 4 server auto-imports)
- Cross-boundary: client cannot import from `server/`; server cannot import from `composables/` (use `server/utils/` instead)

## Domain model graph (high-level)

```
Recipe ──▶ Batch ──▶ Production ──▶ Bottle (catalog)
   │         │           │            │
   │         ▼           ▼            ▼
   │      Vessel    Item (consumed)  Inventory (stock)
   │         ▲                          ▲
   ▼         │                          │
BulkSpirit ──┘                       PurchaseOrder
                                         │
                                         ▼
Contact ─▶ Event (Square checkout)    Item
   │
   └─▶ Message (inbox)

Transfer (NEW, orphan)── references all of: Batch, Vessel, User, ReportingPeriod
ReportingPeriod (NEW, orphan) ── snapshots TTB form data
EquipmentLog ── attached to Batch
Settings ── singleton (theme, distillery info, categories, barrel defaults)
User ── auth + audit trail
```

## Public vs admin separation

| Public | Admin |
|---|---|
| `pages/index.vue`, `pages/about`, `pages/bottles/*`, `pages/events/*`, `pages/menu/*` | `pages/admin/**` |
| `usePublicBottleStore`, `usePublicCocktailStore` (read-only) | All other stores (CRUD) |
| `/api/bottle/public`, `/api/cocktail/public`, `/api/event/upcoming`, `/api/event/public/*`, `/api/contact/inquiry`, `/api/contact/subscribe`, `/api/event/request`, `/api/auth/login`, `/api/square/*` | All other API routes (gated by `server/middleware/auth.ts`) |
| `layouts/default.vue` | `layouts/admin.vue` |

## Build/dev

- `npm run dev` — port 3001, Vite HMR
- `npm run build` — Nuxt build (Nitro server)
- `npm run preview` — production preview
- `npm run test` — Vitest

## Env vars (runtime config)

Mapped via `runtimeConfig` in `nuxt.config.ts` — Nuxt auto-maps `NUXT_*` env vars:
- `NUXT_ENV_MONGODB_URI` — MongoDB Atlas connection string
- `NUXT_SESSION_SECRET` — 32+ chars
- `NUXT_DOMAIN` — site URL
- `NUXT_SQUARE_ACCESS_TOKEN`, `NUXT_SQUARE_WEBHOOK_SIGNATURE_KEY`, `NUXT_SQUARE_ENVIRONMENT`, `NUXT_PUBLIC_SQUARE_LOCATION_ID`
- `NUXT_CLOUDINARY_CLOUD_NAME`, `NUXT_CLOUDINARY_API_KEY`, `NUXT_CLOUDINARY_API_SECRET`
- `NUXT_PUBLIC_WS_URL` — declared but **no socket.io implementation present** (dead config?)

Real `.env` is gitignored; `.env.example` is the template.
