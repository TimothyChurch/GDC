# GDC Integrations

External services the app talks to.

## Square (payments + bookings)

**SDK**: `square` v44 (server) + `@stripe/stripe-js` is installed but unused (see tech-debt — likely a vestige).

### Routes (`server/api/square/*`)

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/square/create-checkout` | Public | Build a Square hosted-payment URL for an event + addOns |
| `POST /api/square/confirm-order` | Public | Fallback: poll Square for order state, update Event.bookings |
| `GET  /api/square/order-status?orderId=` | Public | Read-only Square order state |
| `POST /api/square/webhook` | HMAC-SHA256 verified | Process `payment.completed` events from Square |

### Util

`server/utils/square.ts` — Square SDK setup, helpers. Reads from `useRuntimeConfig().squareAccessToken`, `squareEnvironment` ('sandbox' or 'production'), `public.squareLocationId`.

### Webhook signature verification

```ts
// from server/api/square/webhook.post.ts
const signature = getHeader(event, 'x-square-hmacsha256-signature')
const computed = crypto.createHmac('sha256', signatureKey).update(rawBody).digest('base64')
if (signature !== computed) throw createError({ statusCode: 403 })
```

⚠️ The webhook is the only signature-verified endpoint. Don't add public Square endpoints without verification.

### Idempotency

`Event.processedOrders[]` (String[]) tracks every Square orderId already applied. Webhook checks before mutating Event.bookings.

### Env vars

```
NUXT_SQUARE_ACCESS_TOKEN
NUXT_SQUARE_WEBHOOK_SIGNATURE_KEY
NUXT_SQUARE_ENVIRONMENT          # 'sandbox' | 'production'
NUXT_PUBLIC_SQUARE_LOCATION_ID
```

## Cloudinary (image uploads)

**SDK**: `cloudinary` v2

### Routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/upload` | session | multipart upload, max 10MB, JPEG/PNG/WebP/GIF/PDF allowed |
| `DELETE /api/upload/[id]` | ⚠️ none | Delete by Cloudinary publicId (must start with `gdc/`) |

### Util

`server/utils/cloudinary.ts` — `getCloudinary(event)` returns configured SDK instance.

### Composable

`composables/useFileUpload.ts` (42 LOC) — wraps the upload route for client-side use.

### Component

`components/Form/FormImageUpload.vue` — file picker + preview + upload, used in PanelRecipe, PanelEvent, PanelBottle, PanelCocktail, PanelItem.

### Env vars

```
NUXT_CLOUDINARY_CLOUD_NAME
NUXT_CLOUDINARY_API_KEY
NUXT_CLOUDINARY_API_SECRET
```

### Storage convention

All uploads land in `gdc/` namespace. The DELETE route validates publicId starts with `gdc/` to prevent arbitrary deletions across the Cloudinary account. ⚠️ The DELETE route lacks auth — see `tech-debt.md`.

## Meta Pixel (Facebook analytics)

**Module**: `nuxt-meta-pixel` v2

Configured in `nuxt.config.ts`:
```ts
public: {
  metapixel: { default: { id: '1254208522870414' } },
}
```

Auto-registers on every page load. CSP allows Facebook domains:
```
script-src 'self' 'unsafe-inline' https://connect.facebook.net
img-src 'self' data: blob: https://www.facebook.com
frame-src https://www.facebook.com
connect-src 'self' https://*.facebook.com https://*.facebook.net
```

No custom event tracking yet — basic page view only.

## @nuxtjs/sitemap

**Module**: `@nuxtjs/sitemap` v7

Auto-generates `/sitemap.xml`. Configured in `nuxt.config.ts`:
```ts
sitemap: { exclude: ['/admin/**', '/login', '/return'] }
site: { url: process.env.DOMAIN || 'https://galvestondistilling.com' }
```

## @nuxt/image

**Module**: `@nuxt/image` v2

```ts
image: { quality: 80, format: ['webp', 'jpg'] }
```

Use `<NuxtImg>` for any displayed image — auto-resizes and serves WebP with JPG fallback. Cloudinary URLs are passed through as-is.

## v-calendar

**Component**: `v-calendar` v3

Used by `components/Site/SiteDatePicker.vue` (which wraps the root-level `components/DatePicker.vue`). 13 use sites in admin panels.

## chart.js + vue-chartjs

Registered globally via `composables/useChartRegistration.ts` (35 LOC) — call once in setup. Used by:
- All `Report/Report*Chart*.vue` components
- `Dashboard/DashboardRevenue.vue`
- `Bottle/BottleInventorySection.vue`
- `Item/ItemInventory.vue`

## MongoDB (nuxt-mongoose)

**Module**: `nuxt-mongoose` v1

Configured in `nuxt.config.ts`:
```ts
mongoose: {
  uri: process.env.NUXT_ENV_MONGODB_URI || '',
  options: { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 },
  modelsDir: 'models',  // server/models
}
```

Models defined in `server/models/*.schema.ts` are auto-imported in server routes via `#server` alias (or sometimes by explicit name).

## NOT integrated (despite installed packages)

- **`@stripe/stripe-js`** — listed in package.json, never imported. Vestige from a prior architecture. Remove? See `tech-debt.md`.
- **`prisma`** — was listed in CLAUDE.md as installed; not actually in package.json now. Was likely removed in an earlier cleanup.
- **`socket.io`** — referenced in CLAUDE.md as "installed for real-time features"; not in package.json. Public WebSocket env var (`NUXT_PUBLIC_WS_URL`) declared but unused.
- **`@sidebase/nuxt-auth` / `next-auth`** — not in package.json, despite CLAUDE.md claims. Custom session auth is the only auth.

## Env var summary

```
# Database
NUXT_ENV_MONGODB_URI

# Auth
NUXT_SESSION_SECRET    # 32+ chars

# Site
NUXT_DOMAIN

# Square
NUXT_SQUARE_ACCESS_TOKEN
NUXT_SQUARE_WEBHOOK_SIGNATURE_KEY
NUXT_SQUARE_ENVIRONMENT
NUXT_PUBLIC_SQUARE_LOCATION_ID

# Cloudinary
NUXT_CLOUDINARY_CLOUD_NAME
NUXT_CLOUDINARY_API_KEY
NUXT_CLOUDINARY_API_SECRET

# Unused (declared, no implementation)
NUXT_PUBLIC_WS_URL
```

`.env` is gitignored; `.env.example` is the template.
