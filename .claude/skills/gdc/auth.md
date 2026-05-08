# GDC Auth

Custom session-based authentication. NOT next-auth or @sidebase/nuxt-auth despite their being installed (and CLAUDE.md's old claim).

## Layers

| Layer | File | Role |
|---|---|---|
| Client state | `composables/useAuth.ts` | `useState('auth-user')` SSR-safe; `login()`, `logout()`, `fetchUser()` |
| Route guard | `middleware/auth.ts` | Client-side; redirects unauth → `/login` for `/admin/**` |
| API gate | `server/middleware/auth.ts` | Server-side; rejects unauth `/api/**` requests except hard-coded public list |
| Session helper | `server/utils/session.ts` | `useSession()` wrapper — 7d, httpOnly, secure prod, sameSite=lax |
| RBAC | `server/utils/rbac.ts` | `requireRole(event, ...roles)` — Admin (4) > Manager (3) > Staff (2) > ReadOnly (1) |
| Login route | `server/api/auth/login.post.ts` | Yup validation, in-memory rate limit (5/15min/IP), bcrypt + plaintext-migration, session.regenerate() |
| Logout route | `server/api/auth/logout.post.ts` | session.clear() |
| Me route | `server/api/auth/me.get.ts` | Returns user (minus password) if session valid |

## User schema (`server/models/user.schema.ts`)

```
email      String, required, unique
password   String, required (bcrypt hash; legacy plaintext migrated on first login)
firstName  String
lastName   String
role       String — free-form (no enum). Conventionally one of: Admin, Manager, Staff, ReadOnly
```

⚠️ No pre-save bcrypt hook in the schema. Hashing is done in route handlers (`auth/login.post.ts`, `users/create.post.ts`, `users/[_id].put.ts`). Don't bypass these — direct schema writes will store plaintext.

## Login flow

1. `POST /api/auth/login { email, password }`
2. Yup validation on body (`userLoginSchema`)
3. IP rate-limit check (5 attempts / 15 minutes; in-memory map)
4. Find user by email
5. Try bcrypt compare. **Fallback**: if stored value isn't a bcrypt hash, treat as plaintext, compare directly, then bcrypt-hash and `findByIdAndUpdate` to migrate
6. `session.clear()` → `session.update({ userId, role, email })` (regeneration prevents fixation)
7. Return `{ user }` minus password

## Public route allow-list (`server/middleware/auth.ts`)

Hardcoded — anything not in this list requires a session:
- `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/contact/{create,subscribe,inquiry}`
- `POST /api/event/request`
- `GET /api/auth/me`
- `GET /api/cocktail/**` (admin reads coexist with public catalog reads)
- `GET /api/bottle/**`
- `GET /api/item/**`
- `GET /api/event/upcoming`, `GET /api/event/public/**`
- `POST/GET /api/square/**` (webhook is HMAC-verified separately)

Adding a new public route: update both this list AND any caching directives in `nuxt.config.ts` route rules.

## RBAC enforcement

```ts
import { requireRole } from '~/server/utils/rbac'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'Admin')                  // throws 401 if unauth, 403 if wrong role
  // …
})
```

Roles using RBAC (verified):
- **Admin only**: `users/create`, `users/[_id].put`, `users/[_id].delete`, `settings/index.put`, `batch/deduplicate-pipelines`, `batch/migrate-distilling-stages`, `recipe/backfill-pipelines`
- **Admin or Manager**: `users/index.get`
- **Session-only** (no role check): everything else under `/api/`

## Known gaps (see `tech-debt.md`)

| Route | Gap |
|---|---|
| `upload/[id].delete.ts` | No auth check at all |
| `contact/merge.post.ts` | Session-only; should be Admin (data destruction) |
| `settings/index.get.ts` | Public; exposes distillery info incl. permit numbers |

## Client-side guard

```ts
// pages/admin/whatever.vue
definePageMeta({ middleware: 'auth', layout: 'admin' })
```

`middleware/auth.ts` calls `useAuth().fetchUser()` once on initial admin nav, then redirects to `/login` if no user.

## Audit trail tie-ins

- `Transfer.createdBy` (NEW schema): `{ user: ObjectId→User, name }`
- `ReportingPeriod.closedBy` / `submittedBy`: same shape
- These are server-set in route handlers — never trust client-provided createdBy values
