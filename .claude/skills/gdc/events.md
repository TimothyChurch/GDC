# GDC Events

Tasting room events: cocktail classes, private events, tastings. Public booking flow integrates with Square for payment.

## Schema (`server/models/event.schema.ts`)

```
date              Date (required, indexed)
groupSize         Number (default 0)
contact           ObjectId → Contact (indexed)
type              enum 'Cocktail Class' | 'Private Class' | 'Private Event' | 'Tasting' (required, indexed)
status            enum 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' (default 'Pending', indexed)
notes             String
capacity          Number
isPublic          Boolean (default false, indexed)
price             Number (min 0)
addOns            [{ name (required), price (required, min 0), description }]
bookings          [{ contact: ObjectId→Contact (required), name, email,
                    quantity, amount, orderId, bookedAt }]
processedOrders   String[]  — Square order IDs already processed (idempotency)
```

`bookings[]` stores per-attendee details denormalized (name + email at booking time, in case Contact is later edited).

## Files

| File | Role |
|---|---|
| `server/models/event.schema.ts` | Schema |
| `types/interfaces/Event.ts` | Interface (+ `EventBooking` sub-type) |
| `server/api/event/{index,[id],create}.{get,post,put,delete}.ts` | Admin CRUD; populates `contact` |
| `server/api/event/upcoming.get.ts` | Public, SWR 60s; filter `isPublic: true`, `status: 'Confirmed'`, future dates |
| `server/api/event/public/[id].get.ts` | Public single event (same filters) |
| `server/api/event/request.post.ts` | Public booking request — find/create Contact, create Event (status Pending) + Message |
| `server/api/square/create-checkout.post.ts` | Build Square payment link for an event + addOns |
| `server/api/square/confirm-order.post.ts` | After payment, update Event.bookings[] |
| `server/api/square/order-status.get.ts` | Query Square order state |
| `server/api/square/webhook.post.ts` | HMAC-verified; processes `payment.completed` → updates Event |
| `stores/useEventStore.ts` (52 LOC) | `getByStatus()`, `getEventsByContact()`, `pendingEvents` |
| `composables/useComplianceDeadlines.ts` | Includes event-related deadlines |
| `components/Panel/PanelEvent.vue` | Edit form |
| `components/Modal/ModalLinkEvent.vue` | Link customer to event |
| `components/Table/TableEvents.vue` | List view |
| `components/Site/SiteVisitCTA.vue` | Public CTA section |
| `components/Site/SiteDatePicker.vue` | Date picker for booking forms |
| `pages/admin/events/{index,[_id]}.vue` | Admin |
| `pages/events.vue`, `events/{index,classes/[id],cocktailClass}.vue` | Public |

## Public booking flow

```
1. User browses /events/index.vue (public list)
2. User opens /events/classes/[id].vue (public detail)
3. User submits booking form (name, email, quantity, addOns)
   → POST /api/square/create-checkout
   → Server: find/create Contact, build Square line items, return { url, orderId }
4. Browser redirects to Square hosted checkout
5. User pays
6. Square fires webhook → POST /api/square/webhook
   → HMAC verify, parse payment.completed, update Event.bookings[] + processedOrders[]
7. User redirected to /return.vue
   → Page calls GET /api/square/order-status?orderId=... to confirm
8. Optional fallback: POST /api/square/confirm-order if webhook hasn't arrived yet
```

`processedOrders[]` provides idempotency — webhook can fire multiple times (Square retries) without double-booking.

## Status lifecycle

```
Pending  → admin reviews public booking requests
Confirmed → public visibility (if isPublic + future)
Completed → after the event date
Cancelled → can be uncancelled but bookings need manual handling
```

## Public visibility

An event appears at `/api/event/upcoming` AND `/events/index.vue` only if:
- `isPublic === true`
- `status === 'Confirmed'`
- `date >= now`

Pending requests created via `POST /api/event/request` start with `isPublic: false` until admin confirms and toggles visibility.

## Compliance ties

`useComplianceDeadlines` doesn't directly track events but considers TABC permit renewals (events held under permit). See `compliance.md`.

## Common operations

### Creating a public event

1. POST `/api/event/create` with type, date, capacity, price, isPublic: false
2. Admin reviews details
3. PUT `/api/event/[id]` with `status: 'Confirmed'`, `isPublic: true`
4. Event appears in public listings within 60s (SWR cache window)

### Manual booking (no Square)

PUT `/api/event/[id]` with bookings[] appended manually. Skips payment flow.

### Tracking attendance

`event.groupSize` is updated from `bookings.reduce((sum, b) => sum + b.quantity, 0)` after Square webhook.

## Tech-debt notes (see `tech-debt.md`)

- Webhook handler is the only place where `processedOrders` dedup happens — if you add a second mutation path, replicate the check
- Square sandbox vs production toggled by `NUXT_SQUARE_ENVIRONMENT` env var
- No retry queue if Square API is down during checkout creation; user sees an error and retries manually
