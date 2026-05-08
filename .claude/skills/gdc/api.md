# GDC API Layer

102 routes across 21 resources. All under `server/api/**/*.ts`. File-based routing.

## Auth gate (`server/middleware/auth.ts`)

Runs on every `/api/**` request. Allows through (without session check):

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login`, `/api/auth/logout` | Login itself is rate-limited (5 attempts / 15 min / IP) |
| POST | `/api/contact/create`, `/api/contact/subscribe`, `/api/contact/inquiry` | Public forms (inquiry has honeypot + 3s bot check) |
| POST | `/api/event/request` | Public event booking request |
| POST/GET | `/api/square/**` | Webhook is HMAC-verified separately |
| GET | `/api/auth/me`, `/api/cocktail/**`, `/api/bottle/**`, `/api/item/**`, `/api/event/upcoming`, `/api/event/public/**` | Public reads |

All other `/api/**` requests require a valid session (401 if missing).

## Server utils (`server/utils/`)

| File | Purpose |
|---|---|
| `api-handlers.ts` | CRUD factory (`createGetAllHandler`, `createCreateHandler`, etc.) — used by ~50 routes |
| `validation.ts` | Yup schemas + `sanitize()` + `validateObjectId()` + `validateBody()` |
| `rbac.ts` | `requireRole(event, ...roles)` — Admin > Manager > Staff > ReadOnly hierarchy |
| `session.ts` | `useSession()` wrapper, 7d cookie, httpOnly, secure prod, sameSite=lax |
| `cloudinary.ts` | `getCloudinary(event)` — config from runtime env |
| `square.ts` | Square SDK setup + helpers |
| `errorMessage.ts` | `isH3Error()` type guard (server-only — different from `utils/errorMessage.ts`) |

## Routes by resource

### auth (`/api/auth/`)
- `POST login` — yup validation, bcrypt + plaintext-→-bcrypt migration on first login, session.regenerate, returns `{ user }` minus password
- `POST logout` — session.clear()
- `GET me` — returns auth user minus password (requires session)

### batch (`/api/batch/`) — `[id]` param
- Standard CRUD (GET all/one, create, put, delete with ref-checks vs BulkSpirit/EquipmentLog/Vessel)
- `POST deduplicate-pipelines` — Admin-only migration: removes duplicate pipeline stages
- `POST migrate-distilling-stages` — Admin-only migration: splits old "Distilling" stage into Stripping/LowWines/SpiritRun

### bottle (`/api/bottle/`) — `[_id]` param
- Standard CRUD (delete checks Production refs)
- `GET public` — 300s SWR; computes `inStock` from latest Inventory aggregation

### bulkSpirit (`/api/bulkSpirit/`) — `[_id]`
- Standard CRUD; delete pre-check: `volume <= 0`

### cocktail (`/api/cocktail/`) — `[id]`
- Standard CRUD via factory
- `GET public` — 300s SWR; resolves `ingredient.item` IDs to names via batch Item/Bottle lookup

### contact (`/api/contact/`) — `[id]`
- Standard CRUD (delete checks PurchaseOrder + Event refs)
- `POST inquiry` (public) — honeypot field + min-3s submission delay, creates/updates Contact + Message
- `POST subscribe` (public) — find-or-create Contact, set `newsletter=true`
- `POST merge` (auth, ⚠️ no Admin RBAC) — merges duplicate contact, transfers Event/Message/PO refs

### equipmentLog (`/api/equipmentLog/`)
- `GET index` (sorted by timestamp desc, limit 50), `POST create`. No detail/update/delete routes.

### event (`/api/event/`) — `[id]`
- Standard CRUD; populates `contact`
- `GET upcoming` (public, SWR 60s) — `isPublic=true`, `status=Confirmed`, future dates only
- `GET public/[id]` (public) — same filters
- `POST request` (public) — find-or-create Contact, create Event (status Pending) + Message notification

### inventory (`/api/inventory/`) — `[_id]`
- Standard CRUD
- `GET index` — query params: `?item`, `?since`, `?days` (default 90), `?all=true`
- `GET by-item/[item]` — full history for one item
- `POST bulk` — array create, 1–100 records, sanitized per item

### item (`/api/item/`) — `[_id]`
- Standard CRUD; delete checks Recipe + PurchaseOrder + Cocktail + Production (3 fields: glassware/cap/label)

### message (`/api/message/`) — `[id]`
- Standard CRUD; sorted by createdAt desc

### production (`/api/production/`) — `[id]`
- Standard CRUD; delete checks Batch refs (`stages.bottled.productionRecord`)
- Custom create cleanup of empty bottling.glassware/cap/label fields

### purchaseOrder (`/api/purchaseOrder/`) — `[_id]`
- Standard CRUD; delete checks `Item.purchaseHistory`

### recipe (`/api/recipe/`) — `[_id]`
- Standard CRUD; delete checks Batch refs
- `POST backfill-pipelines` — Admin-only migration: assigns pipeline templates by recipe class

### settings (`/api/settings/`) — singleton
- `GET index` — ⚠️ no auth check; auto-creates empty settings doc; migrates legacy string[] categories
- `PUT index` — Admin-only

### square (`/api/square/`)
- `POST create-checkout` (public) — find-or-create Contact, build line items, return Square payment link + orderId
- `POST confirm-order` (public) — fetch Square order, update Event.bookings if COMPLETED
- `GET order-status?orderId=` (public) — Square order state lookup
- `POST webhook` — HMAC-SHA256 verified; processes `payment.completed` → updates Event.bookings

### upload (`/api/upload/`)
- `POST index` — multipart, max 10MB, JPEG/PNG/WebP/GIF/PDF, returns Cloudinary metadata
- `DELETE [id]` — ⚠️ **no auth check** (security gap); validates publicId starts with `gdc/`

### users (`/api/users/`) — `[_id]`
- `GET index` — Admin or Manager; returns users minus password
- `POST create` — Admin only; bcrypt hash before save
- `PUT [_id]` — Admin only; bcrypt hash if password provided (skip if empty)
- `DELETE [_id]` — Admin only

### vessel (`/api/vessel/`) — `[id]`
- Standard CRUD; delete pre-check: `contents.length === 0`

### transfer (`/api/transfer/`) — `[id]`
The new immutable ledger system. **All 4 routes are auth-gated by middleware but lack RBAC** — see `tech-debt.md` §6.

- `POST create` — calls `executeTransfer()` from `server/utils/transferEngine.ts`. Atomic multi-doc MongoDB transaction. Validates against `transferCreateSchema`. Returns `{ transfer, batch, updatedVessels }`.
- `GET index` — query params: `?batch`, `?vessel`, `?period`, `?type`, `?status` (committed|reversed), `?limit`. Indexed compound queries.
- `GET [id]` — populates source/destination vessels, batch, reversal links
- `POST [id]/reverse` — calls `reverseTransfer(id, notes)`. Creates inverse transfer in current period; marks original `status: 'reversed'`. Validates against `transferReverseSchema`. Returns same shape as create.

Transfers are **append-only** — no PUT, no DELETE. Corrections via reversal.

### reporting-period (`/api/reporting-period/`) — `[period]` is `'YYYY-MM'`
TTB monthly closeout. **All 3 routes lack RBAC** — close especially should require Admin.

- `POST create` — auto-create or fetch existing for given period
- `GET index` — list all periods with status (open/closed/submitted)
- `POST [period]/close` — locks the period; engine refuses mutations to closed-period transfers. Validates against `reportingPeriodCloseSchema`. Snapshots TTB form data into `ttbReportSnapshots` (currently unpopulated — Phase 8 work).

## Validation coverage

All `create.post` and `[id].put` routes validate via yup (defined in `server/utils/validation.ts`). GET and DELETE routes don't validate body (DELETEs use ref-checks instead). Public form routes have additional bot-detection where appropriate.

## Caching strategy (route rules in `nuxt.config.ts`)

- `/api/**` defaults to `private, no-store`
- `/api/bottle/public` → SWR 300s
- `/api/cocktail/public` → SWR 300s
- `/api/event/upcoming` → SWR 60s

## Known gaps (see `tech-debt.md`)

- `upload/[id].delete` — missing auth check (P0 #2)
- `contact/merge` — missing Admin RBAC (P0 #3)
- `settings/index.get` — exposes permit numbers without auth (P0 #4)
- `transfer/{create,reverse}` + `reporting-period/{create,close}` — missing RBAC (P0 #6, TTB compliance issue)
- `square/webhook` — HMAC string-equality timing attack (P0 #5)
- `square/create-checkout` — no `sanitize()`, no origin validation (P0 #8, P0 #9)
- Public POST routes (`contact/inquiry`, `contact/subscribe`, `event/request`, `square/create-checkout`) — no rate limiting (P0 #7)
- Login rate limiter in-memory (P3 #57) — useless on Netlify Functions
- Param naming drift `[id]` vs `[_id]` (P2 #32)
- Response shape inconsistency across factories vs custom routes (P2 #37)
- Only 2 yup schemas use `.noUnknown()` (P2 #38)
- Migration routes lack run-once guards (P2 #54)
- Transfer engine NOT yet called from 5 distillation components — they bypass it (P1 #14, see `transfers.md`)
