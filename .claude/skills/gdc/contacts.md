# GDC Contacts (CRM)

Single Contact resource serves as the CRM for both **vendors** (people/companies you buy from) and **customers** (people who book events, subscribe to newsletter, send inquiries). The `type` field discriminates.

## Schema (`server/models/contact.schema.ts`)

```
firstName     String
lastName      String
businessName  String
type          String (indexed)         — typical values: 'Vendor', 'Customer', 'Wholesale', 'Friend'
website       String
address       String
email         String (unique, sparse)  — sparse allows multiple null vendor entries
phone         String
notes         String
newsletter    Boolean (default false, indexed)
city, state, zip   String
```

`email: { unique: true, sparse: true }` — null/undefined emails don't trip the unique constraint (essential for vendors without email contacts).

## Related: Message schema (`server/models/message.schema.ts`)

```
contact     ObjectId → Contact (indexed)         — optional link
firstName   String (required, trimmed)
lastName    String (required, trimmed)
email       String (required, trimmed, indexed)
phone       String
topic       String (required, indexed)            — 'Inquiry', 'Event Request', 'Other'
message     String (required)
read        Boolean (default false, indexed)
```

Inbox entries — submitted via public forms, optionally linked to a Contact. Names + email denormalized in case Contact is later deleted.

## Files

| File | Role |
|---|---|
| `server/models/contact.schema.ts` | Schema |
| `server/models/message.schema.ts` | Schema |
| `types/interfaces/Contact.ts`, `Message.ts` | Interfaces |
| `server/api/contact/{index,[id],create}.{get,post,put,delete}.ts` | Standard CRUD; delete checks PurchaseOrder + Event refs |
| `server/api/contact/inquiry.post.ts` | Public; honeypot field + 3s min delay anti-bot. Creates/updates Contact + Message |
| `server/api/contact/subscribe.post.ts` | Public; find-or-create Contact, set `newsletter: true` |
| `server/api/contact/merge.post.ts` | ⚠️ Auth-only (no Admin RBAC) — merges duplicates, transfers Event/Message/PurchaseOrder refs |
| `server/api/message/{index,[id],create}.{get,post,put,delete}.ts` | CRUD |
| `stores/useContactStore.ts` (87 LOC) | `getVendors()`, `getCustomers()`, `getNewsletterSubscribers()`, `search()`, `mergeCustomers()` |
| `stores/useMessageStore.ts` (91 LOC) | `unreadCount`, `markAsRead/Unread()`, `getMessagesByTopic()`, `getMessagesByContact()` |
| `components/Panel/PanelContact.vue` | Edit form (used for both vendor + customer flows) |
| `components/Modal/ModalMergeCustomers.vue` | Duplicate merge UI |
| `components/Modal/ModalLinkEvent.vue` | Link customer to event booking |
| `components/Table/TableContacts.vue`, `TableCustomers.vue` | List views (Customers filters `type !== 'Vendor'`) |
| `components/Site/SiteNewsletter.vue` | Public subscribe form (calls /api/contact/subscribe) |
| `pages/admin/contacts/{index,[_id]}.vue` | All contacts |
| `pages/admin/customers/{index,[_id]}.vue` | Customer-only filtered view |
| `pages/admin/inbox/{index,[_id]}.vue` | Message inbox |

## Public contact flow

Three public POST endpoints all funnel into Contact + Message:

| Endpoint | Behavior |
|---|---|
| `contact/inquiry` | "Contact Us" form: bot-checks (honeypot, 3s delay), find/create Contact, write Message with `topic: 'Inquiry'` |
| `contact/subscribe` | Newsletter: find/create Contact (no Message), set `newsletter: true` |
| `event/request` | "Request an event" form: find/create Contact, create Pending Event, write Message notifying admin |

All three find-or-create by email — repeated submissions update the same Contact rather than creating duplicates.

## Merge logic (`POST /api/contact/merge`)

Body: `{ keep: ObjectId, merge: ObjectId[] }`
- For each Event with `contact` in `merge`, set to `keep`
- For each Message with `contact` in `merge`, set to `keep`
- For each PurchaseOrder with `vendor` in `merge`, set to `keep`
- Delete the merged contact records

⚠️ Should require Admin role (data destruction); currently only requires session. See `tech-debt.md`.

## Newsletter subscribers

`useContactStore.getNewsletterSubscribers()` returns contacts with `newsletter: true`. Used for export → email service. Currently no auto-sync — admin exports CSV manually.

## Common operations

### Tagging a vendor

`type: 'Vendor'` distinguishes vendors. Filter via `useContactStore.getVendors()`. Vendors appear in PurchaseOrder vendor dropdown.

### Linking a Square checkout to a Contact

`POST /api/square/create-checkout` finds-or-creates Contact by email before generating Square payment link. The orderId is later associated with the Contact via Event.bookings[].

### Inbox actions

- `useMessageStore.markAsRead(messageId)` / `markAsUnread`
- `unreadCount` is reactive — feeds `Admin/AdminSidebar.vue` badge via `useSidebarBadges`
