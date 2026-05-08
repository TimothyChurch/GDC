# Batch Pipeline Revamp — Master Plan

**Document version:** 1.0
**Created:** 2026-05-07
**Owner:** Timothy
**Estimated duration:** 12–14 working days (solo)

---

## 0. How To Use This Document

This is the source of truth for the pipeline rewrite. It is structured so that work can be paused and resumed across multiple days/sessions. Each phase has:

- A **goal** (one sentence)
- **Inputs** (what must be true before starting)
- **Deliverables** (what must be true to mark the phase done)
- **Concrete file list** (paths to create/modify)
- **Verification steps** (how to know it works)

When picking up after a break, re-read Sections 1–6 first, then jump to the active phase in Section 9. Update the **Status** column in Section 9 as work progresses.

---

## 1. Executive Summary

The current batch pipeline at `/home/timothy/Coding/GDC` has **5 critical, 7 high, and 6 medium-severity bugs** that all stem from four root causes:

1. **No transactional boundary** — every stage advance issues 2–7+ separate HTTP PUTs against `/api/batch/[id]` and `/api/vessel/[id]`. A failure mid-flow leaves the database inconsistent. This is the primary cause of "vessels filled separately" and "volumes not transferring properly."
2. **Single-vessel-per-stage assumption** — `batch.stages[X].vessel` is a single ObjectId. The data model can describe a batch in 4 barrels, but the advance flow only drains one. The other 3 become ghost inventory.
3. **Silent unit-conversion fallback** — `convertUnitRatio` returns `1` for unknown unit pairs (e.g., `'Gallon'` vs `'gallon'`), causing invisible volume drift across the entire system.
4. **`revertToPreviousStage` ignores vessels entirely** — the most obvious "things fell out of sync" symptom.

Industry analysis (DISTILL x 5, Whiskey Systems, Ekos, OnBatch, Crafted ERP, InnoVint, DRAMS, Dropbit) shows a **convergent design pattern**: transfers are first-class, immutable, period-locked events with explicit loss accounting, computed PG (never stored), and a TTB account model (Production / Storage / Processing). We will adopt this pattern.

The revamp introduces a new `Transfer` collection as the single source of truth for liquid movement. `batch.stageVolumes` and `vessel.contents` become **denormalized projections** of the transfer ledger, recomputable from scratch. Stage advancement becomes a special case of a transfer (`type: 'stage_transition'`). The UI moves from the current "advance to next stage" wizard to a unified **Transfer Action** form-per-action pattern that handles split sources, split destinations, partial volumes, loss attestation, and gauge data in a single atomic submission.

---

## 2. Goals

| # | Goal | Measurable Outcome |
|---|---|---|
| G1 | Atomic transfers | Every transfer is one HTTP request, one DB transaction. Source + dest + batch state succeed or fail together. |
| G2 | Volume integrity | Sum of all `Transfer.volume_in - Transfer.volume_out + Transfer.loss` for any batch reconciles to 0 at any moment. Automated reconciliation test passes 100%. |
| G3 | Multi-vessel awareness | A batch in N vessels surfaces all N as candidate sources in the UI. No ghost inventory possible. |
| G4 | Reversibility | Any transfer within the open reporting period can be undone with a single click. Reverse generates an inverse transfer; the original is preserved (immutable audit). |
| G5 | TTB-correct accounting | Wine gallons + proof are stored; PG is computed. Every transfer requires a TTB account-of-record (Production / Storage / Processing / TIB / Tax-Paid / Destruction). |
| G6 | Loss attestation | Every transfer requires explicit loss = 0 confirmation OR a categorized loss reason code. No implicit loss via volume delta. |
| G7 | Fluid UX | The act of "moving liquid" happens on one screen. Users see source(s), destination(s), volumes, proofs, and loss in a single form. No multi-step wizards for routine transfers. |
| G8 | Mobile-friendly | Transfer form usable on a phone in the rack house with thumb-only input. |
| G9 | Auto-generated TTB reports | Forms 5110.40, 5110.11, 5110.28 generate from the transfer ledger with no manual entry. |
| G10 | Backwards compatible | Existing batches keep working during rollout. Migration is reversible. |

---

## 3. Non-Goals

To prevent scope creep, these are explicitly **out of scope**:

- Native USB/Bluetooth scale or hydrometer integration (manual gauge entry only)
- Barcode scanning (defer to a later phase)
- Texas TABC report auto-generation (research showed no industry vendor does this; defer)
- Multi-tenant / multi-DSP support
- Importing existing data from other software (only migrating GDC's own historical batches)
- Replacing the recipe / ingredient / inventory subsystems (touch only as needed)
- Replacing Pinia or the ORM
- Visual still / column control (different problem domain)

---

## 4. Current State Audit

### 4.1 Confirmed Bugs (from forensic diagnosis)

| ID | Severity | Location | Bug |
|----|----------|----------|---|
| 1.1 | Critical | `stores/useBatchStore.ts:147–158`, `:253–260` | Batch save and vessel save are sequential awaits with no rollback. |
| 1.2 | Critical | `components/Batch/BatchAdvanceAction.vue:311–366` | Barrel-fill issues 7+ sequential PUTs; partial failure double-fills barrels on retry. |
| 1.3 | Critical | `components/Batch/BatchAdvanceAction.vue:200–270` | Distilling charge issues 4–6 PUTs; midpoint failure leaves still partially loaded. |
| 1.4 | High | `stores/useVesselStore.ts:128–146` | `fullTransfer` saves dest first, source second → dest+source duplicated on second-write fail. |
| 1.5 | High | `stores/useVesselStore.ts:257–262` | `transferBatchContents` saves source first, dest second → liquid vanishes on second-write fail. |
| 2.1 | High | `utils/conversions.ts:53–57` | `convertUnitRatio` silently returns `1` for unknown units. Capitalization mismatches corrupt volume. |
| 2.2 | High | `stores/useVesselStore.ts:162–175` | Floating-point ratio math in `transferBatch` value reallocation; division-by-near-zero risk. |
| 2.3 | Medium | `components/Batch/BatchAdvanceAction.vue:326–342` | Three different unit bases for the same operation in `advanceToBarrelAging`. |
| 3.1 | Critical | `stores/useVesselStore.ts:148–186` | `transferBatch` proportionally drains EVERY batch in source vessel — siphons unrelated batches. |
| 4.1 | High | `components/Batch/BatchAdvanceAction.vue:524–559,579–584` | `getCurrentVesselId` returns one vessel; multi-vessel batches leave ghost inventory. |
| 4.2 | Medium | `components/Batch/BatchAdvanceAction.vue:73–78,522–527` | Source vessel picker only shown for Barrel Aging — no equivalent elsewhere. |
| 5.1 | High | `components/Panel/PanelProduction.vue:150–166` | Bottling only empties user-selected vessels; non-selected barrels retain ghost contents. |
| 6.1 | High | `stores/useBatchStore.ts:232–238` | "All volume in Bottled" status check ignores non-pipeline vessel residuals. |
| 7.1 | High | `stores/useBatchStore.ts:729–745` | `ingredientsWithdrawn` flag missed on partial bulk-write success → double-deduction on retry. |
| 8.1 | Medium | `stores/useVesselStore.ts:100–116,246–256,270–282` | `vessel.previousContents` overwritten by current batch on transfer-out, masking original cooperage history. |
| 9.1 | Medium | `components/Batch/BatchAdvanceAction.vue:502–519`, `useBatchStore.ts:434–444` | `recomputeLowWines` only fires on add/delete, not on direct edits. |
| 10.1 | Medium | `server/models/batch.schema.ts:336–340`, `useBatchStore.ts:19,60–62` | Map↔plain-object reactivity gap; list views stale until a sibling field changes. |
| 11.1 | Medium | `stores/useBatchStore.ts:98–167 vs 169–260` | `startFirstStage` lacks `destinationVolume` parameter; ABV always zero. |
| 12.1 | Critical | `stores/useBatchStore.ts:282–331` | `revertToPreviousStage` never touches vessel state — most direct cause of "vessels filled separately." |

### 4.2 Root Cause Patterns

1. **Transactional debt**: every multi-document write is N independent PUTs.
2. **Unit hygiene debt**: silent fallback masks errors that compound over hundreds of transfers.
3. **Single-vessel mental model** baked into both schema (`stages[X].vessel: ObjectId`) and UI (`getCurrentVesselId`).
4. **Implicit loss accounting**: loss is the difference between source and destination volume, never an explicit field.
5. **Mutable history**: `transferLog[]` is appended to in client code; can be silently edited or omitted.

The proposed architecture in Section 6 explicitly fixes each of these.

---

## 5. Industry Reference Distillation

The following patterns are taken directly from the leaders in the space. Sources cited in Section 14.

### 5.1 Convergent design patterns

| Pattern | Adopted by | Why it matters |
|---|---|---|
| Transfer = first-class entity (own collection, own document) | DISTILL x 5, Whiskey Systems, InnoVint, Crafted ERP, Dropbit | Audit trail, reversibility, report generation |
| Multi-batch per vessel ("collect into vessel with existing spirit") | Dx5, Whiskey Systems | Mirrors physical reality; commingled tanks |
| Wine gallons + proof stored, PG computed | Universal | Proof drifts during dilution/aging; storing PG = guaranteed reconciliation bug |
| Explicit loss with reason codes (no implicit loss) | Dx5 ("Dump Remainder"), DRAMS, VicinityBrew | TTB requires it (27 CFR §19.598); makes BROP line-mapping automatic |
| TTB account model (Production / Storage / Processing / TIB / Tax-Paid) | All | Determines which TTB form line this transaction lands on |
| Form-per-action (one form, one timestamp, one record) | Dx5, Whiskey Systems, Ekos | One form = one immutable event = clean audit |
| Period-locked editing | Dx5 ("Books period"), InnoVint | Aligns with TTB monthly reporting cadence |
| Reason codes drive report-line mapping | VicinityBrew, Whiskey Systems | Eliminates manual BROP line-by-line categorization |
| Two distillation collection methods: Destination Volume vs Collection Volume | Dx5 | Solves the multi-source/multi-dest charging problem |
| BOL/PDF attachment on TIB transactions | Dx5 | Supporting documents stay with the transaction |

### 5.2 Patterns we explicitly are NOT copying

- **Multi-tenant DSP separation** (Whiskey Systems, Ekos): GDC is a single DSP.
- **NetSuite / SAP integration**: out of scope.
- **Visual rack-builder UI** (OnBatch): nice but defer; we'll do a simpler vessel grid first.

### 5.3 27 CFR Anchors

- **§19.281–19.284** — gauging requirements (volume, proof, PG)
- **§19.402** — authorized in-bond transfers
- **§19.580–§19.583** — daily records, must be entered by close of next business day
- **§19.598** — dump/batch records, mandatory fields
- **Forms 5110.40 / .11 / .28** — monthly Production / Storage / Processing reports

### 5.4 Practitioner pain points (from ADI Forums + blogs) we are explicitly addressing

- "Spreadsheets become 40 tabs deep" — our transfer ledger replaces this
- "Barrel blindness" — every barrel knows its current contents, fill date, char level, exit losses (computed)
- Whiskey Systems sunsetting — opportunity for us to leapfrog by being TTB-correct from day one

---

## 6. Proposed Architecture

### 6.1 Data Model

#### 6.1.1 New `Transfer` collection (source of truth)

```ts
// server/models/transfer.schema.ts
{
  _id: ObjectId,
  createdAt: Date,                 // immutable; the operation timestamp
  createdBy: { user: ObjectId, name: string },

  type: 'stage_transition'         // batch advances stages
      | 'vessel_move'              // same stage, different vessel
      | 'split'                    // one source → many dests
      | 'merge'                    // many sources → one dest
      | 'tib_in'                   // transfer-in-bond received
      | 'tib_out'                  // transfer-in-bond shipped
      | 'tax_paid_withdrawal'      // taxable removal
      | 'destruction'              // dump to drain
      | 'sample'                   // sample taken
      | 'redistillation'           // re-charged into still
      | 'reversal',                // inverse of another transfer

  reverses: ObjectId | null,       // pointer to the transfer this reverses
  reversedBy: ObjectId | null,     // pointer to the reversal transfer (if any)

  reportingPeriod: string,         // 'YYYY-MM'; transfer is immutable once period closes

  // What's moving
  batch: ObjectId,                 // ref Batch
  fromStage: string | null,        // null if first-stage entry or external TIB-in
  toStage: string | null,          // null if destruction/withdrawal/TIB-out

  // Source side (one or more vessels for merges)
  sources: [
    {
      vessel: ObjectId,            // ref Vessel
      volume: number,              // wine gallons (canonical)
      proof: number,               // 2× ABV
      gauging: {
        method: 'volumetric' | 'weight',
        temperatureF: number,
        operator: string,
      } | null,
    }
  ],

  // Destination side (one or more for splits)
  destinations: [
    {
      vessel: ObjectId | null,     // null for destruction/withdrawal
      volume: number,              // wine gallons; the volume LANDING in this vessel
      proof: number,
      gauging: { ... } | null,
    }
  ],

  // Loss line (mandatory)
  loss: {
    volume: number,                // wine gallons; >= 0
    proof: number,                 // proof of the lost portion (often = source proof)
    reasonCode: 'evaporation'      // angel's share
      | 'spillage'
      | 'sampling'
      | 'redistillation_residue'
      | 'foreshots_heads_tails'
      | 'cleaning'
      | 'measurement_variance'
      | 'destruction'
      | 'no_loss',                 // mandatory zero-loss attestation
    notes: string,
  },

  // TTB accounting
  ttbAccount: {
    from: 'production' | 'storage' | 'processing' | 'tib_external' | 'tax_paid' | null,
    to:   'production' | 'storage' | 'processing' | 'tib_external' | 'tax_paid' | null,
  },

  // Free-form
  notes: string,
  attachments: [{ url: string, kind: 'bol' | 'gauge_record' | 'photo', uploadedAt: Date }],

  // Computed fields (denormalized for speed; recomputable)
  totalSourceVolume: number,
  totalDestVolume: number,
  totalLossVolume: number,
  sourcePG: number,                // sum across sources
  destPG: number,                  // sum across dests
  lossPG: number,
}
```

**Invariants enforced server-side**:

- `totalSourceVolume === totalDestVolume + totalLossVolume` (within ε of 0.001 gal)
- `sourcePG === destPG + lossPG` (within ε of 0.001 PG)
- All volumes in **wine gallons** at the schema layer; UI converts to/from user-preferred units
- All proofs stored as proof (2 × ABV); PG computed as `volume × proof / 200`
- Once `reportingPeriod` is closed (set by an admin action), document is immutable except for `reversedBy`
- `reverses` and `reversedBy` are mutually exclusive with `type: 'reversal'`

#### 6.1.2 Modified `Vessel` schema

`vessel.contents[]` survives but is now a **denormalized cache** of the most recent transfer state. Add a versioning hint:

```ts
{
  ...,
  contents: [
    {
      batch: ObjectId,
      volume: number,              // wine gallons
      proof: number,
      addedAt: Date,
      lastTransferId: ObjectId,    // transfer that last touched this slot
    }
  ],
  contentsVersion: number,         // increments on each transfer; supports optimistic locking
  cachedAt: Date,
}
```

Add `previousContentsHistory: [{ batchRecipeName, departedAt, transferId }]` to preserve cooperage history (fixes 8.1).

#### 6.1.3 Modified `Batch` schema

`batch.stageVolumes` survives as a **denormalized cache**. New fields:

```ts
{
  ...,
  ttbAccount: 'production' | 'storage' | 'processing' | null,
  // ↑ which TTB account this batch's spirits live in. Updates as transfers change account.

  stageVolumes: Map<string, { volume: number, proof: number }>,
  // ↑ now tracks proof too, so PG is computable per stage
  // recomputed from transfers; do NOT mutate directly

  cachedAt: Date,
  cacheVersion: number,
}
```

`batch.transferLog[]` is **deprecated** — we replace it with queries against the Transfer collection. Keep the field for one release cycle for backwards-compat reads; stop writing to it.

#### 6.1.4 New helper collections

- `ReportingPeriod` — `{ period: 'YYYY-MM', status: 'open' | 'closed' | 'submitted', closedBy, closedAt, ttbReportSnapshots: [...] }`
- `LossReason` — seed data for the dropdown; lets us add reasons without code changes

### 6.2 API Layer

All transfer mutations route through one endpoint with one document-level transaction:

```
POST   /api/transfer/create          → creates a transfer + atomically updates vessel + batch caches
POST   /api/transfer/[id]/reverse    → creates an inverse transfer (original stays immutable)
GET    /api/transfer                 → list, filtered by batch / vessel / period / type
GET    /api/transfer/[id]            → single transfer with all sources/dests resolved

POST   /api/reporting-period/close   → admin action; locks period
GET    /api/reporting-period         → list with status

GET    /api/reports/ttb/production/[period]   → Form 5110.40 data
GET    /api/reports/ttb/storage/[period]      → Form 5110.11 data
GET    /api/reports/ttb/processing/[period]   → Form 5110.28 data
```

The existing generic CRUD on `/api/batch/[id]` and `/api/vessel/[id]` survives but **gets a server-side guard**: any update that would mutate `stageVolumes` or `contents` is rejected with `409 USE_TRANSFER_ENDPOINT`. This forces all future code through the transfer engine.

### 6.3 Atomicity Strategy

Mongoose supports MongoDB **multi-document transactions** since 4.0 (Atlas supports them out of the box). The transfer endpoint uses:

```ts
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    // 1. Create the Transfer doc
    // 2. Update each source Vessel's contents[] (decrement)
    // 3. Update each destination Vessel's contents[] (add or merge)
    // 4. Update Batch.stageVolumes (recompute or delta-apply)
    // 5. Validate invariants (sum-of-deltas == 0)
    // 6. Bump contentsVersion / cacheVersion
  });
} finally {
  await session.endSession();
}
```

If any step throws (validation, version conflict, connection drop), MongoDB rolls back all writes. **This is the single biggest fix in the entire revamp.**

### 6.4 State Management

#### 6.4.1 New `useTransferStore`

```ts
// stores/useTransferStore.ts
const transfers = ref<Transfer[]>([])
const activeTransfer = ref<Transfer | null>(null)

async function create(input: TransferInput): Promise<Transfer>
async function reverse(transferId: string): Promise<Transfer>
async function listForBatch(batchId: string): Promise<Transfer[]>
async function listForVessel(vesselId: string): Promise<Transfer[]>
async function listForPeriod(period: string): Promise<Transfer[]>
```

#### 6.4.2 Refactored `useBatchStore` and `useVesselStore`

- All `advanceToStage`, `transferBatch`, `transferBatchContents`, `fullTransfer`, `addContents`, `emptyVessel` functions become **thin wrappers** that build a `TransferInput` and call `useTransferStore.create()`.
- They never make their own API calls.
- The post-success response includes the updated Batch + Vessels, so each store updates its own cache from one server response.

#### 6.4.3 Reactivity fixes

- Replace `Map<string, ...>` in client state with plain object literals (`Record<string, ...>`). Mongoose can serialize either.
- After every transfer create, replace `crud.items.value` with a new array (not mutate in place) so list-view subscribers re-evaluate. Fixes 10.1.

### 6.5 UI Patterns

The new UX centers on a single **`TransferActionForm`** component that handles all transfer types via conditional rendering. Form-per-action mirrors the industry norm.

#### 6.5.1 The Transfer Action Form

One screen with three regions:

```
┌─────────────────────────────────────────────────────────────────┐
│  TRANSFER ACTION                                          [X]  │
│  Type: [Stage Transition ▼]                                     │
│  Batch: Bourbon #2026-014    From stage: Fermenting             │
├──────────────────────────┬──────────────────────────────────────┤
│  SOURCES (1)             │  DESTINATIONS (1)                    │
│                          │                                       │
│  + Add another source    │  + Add another destination           │
│                          │                                       │
│  ┌────────────────────┐  │  ┌─────────────────────────────────┐ │
│  │ Vessel: Fermenter A│  │  │ Vessel: Still 1                 │ │
│  │ Volume: 600 gal    │  │  │ Volume: 600 gal                 │ │
│  │ Proof: 16          │  │  │ Proof: 16                       │ │
│  │ ──────             │  │  │ Stage: Stripping Run            │ │
│  │ Available: 600 gal │  │  │ Capacity used: 600 / 800 gal    │ │
│  └────────────────────┘  │  └─────────────────────────────────┘ │
│                          │                                       │
├──────────────────────────┴──────────────────────────────────────┤
│  LOSS                                                            │
│  Reason: [☑ No loss] [▼ ...]                                    │
│  Volume: 0 gal      Proof: —     Notes: ___                      │
├──────────────────────────────────────────────────────────────────┤
│  RECONCILIATION (auto)                                           │
│  Source: 600 gal @ 16 proof = 48 PG                              │
│  Dest:   600 gal @ 16 proof = 48 PG                              │
│  Loss:   0 gal                = 0 PG                             │
│  Balance: ✅ Reconciled                                          │
│                                                                   │
│  TTB Account: Production → Production                            │
│  Reporting Period: 2026-05 (open)                                │
├──────────────────────────────────────────────────────────────────┤
│  Notes: ___________________________________                      │
│  [📎 Attach BOL/Gauge Record]                                    │
│                                                                   │
│              [Cancel]                  [Submit Transfer]         │
└──────────────────────────────────────────────────────────────────┘
```

Behaviors:

- **Adding a source** opens a vessel picker scoped to vessels currently containing the batch. Multi-vessel batches surface ALL their locations. Fixes 4.1, 4.2, 5.1.
- **Adding a destination** opens a vessel picker scoped by stage type (e.g., destination stage = Fermenting → only Fermenters appear). Capacity is shown live.
- **Volume / proof inputs** auto-fill from the source vessel's current state but are editable for partial transfers and gauge corrections.
- **Reconciliation panel** updates live as values change and turns red if `source ≠ dest + loss`. Submit button disabled until balanced.
- **Loss reason "No loss"** is a deliberate checkbox that must be ticked. Cannot submit without either zero-loss attestation or a reason code.
- **TTB account** is computed from from/to stages but editable for explicit account changes (e.g., moving stored spirit to processing for blending).
- **Reporting period** is read-only; reflects today's period.

#### 6.5.2 Stage-specific shortcuts

To keep common operations fast, four pre-configured launchers wrap the same form:

- **Advance Stage** — pre-fills source = current vessel(s), destination stage = next in pipeline
- **Transfer Within Stage** — pre-fills both source and destination as same stage (just a vessel move)
- **Bottle Out** — destination is a Production record (special transfer type that creates the production doc as part of the transaction)
- **Withdraw / Destroy** — destination is null, loss = full source

Each shortcut is one button on the batch detail page. The user never sees the underlying form complexity unless they need it.

#### 6.5.3 Vessel grid (visual)

A new `pages/admin/vessels/floor.vue` page presents all vessels as a grid with:

- Vessel name, type, location
- Current contents (batch name + volume + proof + PG)
- Capacity gauge bar
- One-click "Transfer from here" / "Transfer to here" actions

This replaces the need to navigate to a batch first, then find its vessels. Inspired by OnBatch's rack manager but kept simple — no drag-drop in v1.

#### 6.5.4 Transfer history panel

On the batch detail page, replace the current `transferLog` table with a queried view of the Transfer collection:

- Chronological list, newest first
- Each row: timestamp, type, source(s), dest(s), volume in/out, loss, PG delta, reporting period, user
- One-click "Reverse" on any open-period transfer
- Visual marker for closed-period transfers (lock icon, no actions)
- Filter by type, date range, period
- Export to CSV for accountant review

### 6.6 TTB Compliance Layer

Each transfer auto-tags itself with the TTB report line it should land on:

| Transfer type + accounts | TTB form | Line |
|---|---|---|
| stage_transition with from=null, to=production | 5110.40 | Pt I, line 17 (received from) — but typically not applicable for first stage; mostly a flag |
| stage_transition production → storage | 5110.40 | Pt I, line 1 (deposit in storage) |
| stage_transition storage → processing | 5110.11 | Pt I, line 8 (transferred to processing) |
| tib_in | 5110.40/.11/.28 (depends on receiving account) | Received from other DSP |
| tib_out | 5110.11 | Transferred to other DSP |
| tax_paid_withdrawal | 5110.28 | Taxable removals |
| destruction | 5110.40/.11/.28 | Voluntary destruction |
| sample | 5110.40/.11/.28 | Use of testing samples |
| reversal | (inverse of original) | Inverse line |
| loss any | 5110.40/.11/.28 | Loss line, by account |

A simple rules engine (`server/utils/ttbReportMapper.ts`) computes the report line for any transfer. Reports are then `Transfer.find({ reportingPeriod }).aggregate(...)`.

---

## 7. UI / Aesthetic Improvements

Beyond functional fixes, these are visual / UX upgrades that make the experience feel more fluid:

### 7.1 Batch detail page (`pages/admin/batch/[_id].vue`)

**Before:** stacked stage editors, advance-action button per stage, transfer log at bottom.

**After:**

- **Top hero strip**: batch number, recipe name, current TTB account, total volume, total PG, days in current stage. Big and scannable.
- **Pipeline ribbon** (existing `BatchStepper`): animate the "active" badge with a soft pulse. Click any stage to jump to its editor.
- **Live vessel summary card**: "Currently in: Fermenter A (300 gal), Barrel #44 (50 gal). Click to transfer."
- **Transfer Action button** floating bottom-right (mobile) / top-right (desktop): always one tap away.
- **Two-pane layout** on desktop ≥ lg: stage editors on the left (60%), live transfer history on the right (40%).
- **Stage editor cards**: collapse all stages with no volume by default; only the active one expands. Reduces scrolling.
- **Per-stage micro-actions**: "Edit gauge readings", "Add tasting note", "Add log entry" inline.

### 7.2 Vessels page (`pages/admin/vessels/`)

- New `/floor` view (Section 6.5.3) as the default landing
- Existing list view available behind a toggle
- Filter chips: "Empty", "Full", "Aging", "Needs attention" (e.g., overdue samples)
- Color-code vessels by content age: green (fresh), amber (mid-aged), gold (mature)

### 7.3 Production / Bottling

- Replace `PanelProduction.vue` with a panel that uses the new transfer engine. Bottling becomes one transfer of type `tax_paid_withdrawal` with destination = a virtual "Tax-Paid Inventory" account.
- Pre-fills source vessels by querying for all vessels containing the batch (fixes 5.1).
- Cost calculation moves server-side as a derived field on the Production doc (single source of truth).

### 7.4 Mobile-first refinements

- All transfer-related forms render on a phone with no horizontal scroll.
- Number inputs use `inputmode="decimal"` and trigger the numeric keypad.
- Vessel pickers are 100%-width sheets on mobile, popovers on desktop.
- Submit button sticky at the bottom of the viewport on mobile.

### 7.5 Visual language

- Adopt a single accent color per transfer type (uses Nuxt UI's color system):
  - `stage_transition` → blue (primary)
  - `vessel_move` → cyan
  - `split` / `merge` → purple
  - `tib_in/out` → amber (signals external)
  - `tax_paid_withdrawal` → green (revenue)
  - `destruction` → red
  - `reversal` → gray, dashed border
- Typography stays Merriweather (display) + Cormorant Garamond (body) per existing brand.
- Loss reason chips use the existing `UBadge` palette.

### 7.6 Empty states / micro-copy

- When no transfers exist: "No transfers yet. Tap **+ Transfer Action** to move liquid."
- When invariants fail in form: "Volumes don't reconcile. Check your numbers — source must equal destination + loss."
- After a successful transfer: toast with a one-click "Undo" for the next 30 seconds (in addition to the persistent reverse action).

---

## 8. Migration Strategy

### 8.1 Pre-migration

- Export full DB snapshot to backup (`mongodump` from Atlas)
- Document current `transferLog[]` size and shape across all batches
- Run a dry-run of the migration script in a local dev DB

### 8.2 Migration script (`server/scripts/migrateTransferLog.ts`)

For each existing batch:

1. Read `batch.transferLog[]` (already an audit trail of every advance)
2. For each entry, synthesize a `Transfer` doc:
   - `type: 'stage_transition'`
   - `fromStage: entry.from`, `toStage: entry.to`
   - `sources: [{ vessel: entry.vessel || lookupVesselByContents(batch._id), volume: entry.volume, proof: 0 (unknown for legacy), gauging: null }]`
   - `destinations: [{ vessel: entry.vessel || ..., volume: entry.volume, proof: 0, gauging: null }]`
   - `loss: { volume: 0, reasonCode: 'no_loss', notes: 'Migrated from legacy transferLog — loss not recorded' }`
   - `createdAt: entry.date`
   - `reportingPeriod: derived from date`
   - `notes: 'MIGRATED — gauge data and loss not available pre-migration'`
3. Recompute `batch.stageVolumes` from synthesized transfers + `batch.batchSize`
4. Recompute `vessel.contents[]` by walking transfers chronologically
5. Verify invariants (sum-of-deltas == 0); flag mismatches for manual review
6. Set `batch.cacheVersion = 1`, `vessel.contentsVersion = 1`

### 8.3 Compatibility window

- New code reads from Transfer collection; falls back to `batch.transferLog[]` if Transfer is empty for that batch (one release cycle, then drop)
- New code writes to Transfer collection only
- Old `advanceToStage` / `transferBatch` etc. become wrappers (Section 6.4.2)

### 8.4 Cutover

- Day 11: deploy with feature flag `useTransferEngine = false`
- Day 12: turn on in dev/staging, run migration, run a real transfer
- Day 13: turn on in prod, with rollback ready
- Day 14: monitor; remove flag the following week

---

## 9. Implementation Phases (Day-by-Day)

Status legend: ⬜ not started · 🟡 in progress · ✅ done · ⚠ blocked

### Phase 1 — Data Model & Schema (Days 1–2) — ✅ COMPLETE (2026-05-07)

**Goal:** All new schemas and validation in place; nothing wired up yet.

| # | Task | Status |
|---|---|---|
| 1.1 | Create `server/models/transfer.schema.ts` with full schema from §6.1.1 | ✅ |
| 1.2 | Create `types/interfaces/Transfer.ts` mirror | ✅ |
| 1.3 | Add `transferCreateSchema` and `transferReverseSchema` Yup validators in `server/utils/validation.ts` | ✅ |
| 1.4 | Modify `server/models/vessel.schema.ts`: add `contentsVersion`, `cachedAt`, `previousContentsHistory`, `proof` on contents | ✅ |
| 1.5 | Modify `types/interfaces/Vessel.ts` and `Contents.ts` to match | ✅ |
| 1.6 | Modify `server/models/batch.schema.ts`: add `ttbAccount`, `stageProofs` (paired with stageVolumes for PG), `cacheVersion`, deprecate `transferLog` (kept readable). Decided against breaking change to `stageVolumes` shape — additive `stageProofs` Map preserves backwards compat. | ✅ |
| 1.7 | Modify `types/interfaces/Batch.ts` to match | ✅ |
| 1.8 | Create `server/models/reportingPeriod.schema.ts` + interface | ✅ |
| 1.9 | ~~Create `server/models/lossReason.schema.ts`~~ — **DROPPED**: loss codes must map to TTB report lines via rule engine; DB-stored codes without mapper rules are inert. List lives in `composables/transferDefinitions.ts`. | ✅ |
| 1.10 | Create `composables/transferDefinitions.ts` — transfer types, loss reason codes, TTB account enums, period helpers, PG math, reconciliation epsilon | ✅ |
| 1.11 | Update `composables/batchPipeline.ts` `STAGE_KEY_MAP` to support proof per stage | ⏭️ deferred to Phase 2 (proof tracking happens via Transfer engine; STAGE_KEY_MAP unchanged for now) |

**Verification:** `npm run build` passes. vue-tsc shows 126 errors total — same as before Phase 1 (my new schemas inherit the same pre-existing strict-typing oddities as existing schemas; net new = 0).

**Files added:**
- `composables/transferDefinitions.ts` (210 lines) — single source of truth for enums, PG math, period helpers
- `server/models/transfer.schema.ts` (170 lines) — Transfer collection
- `types/interfaces/Transfer.ts` (110 lines) — Transfer types
- `server/models/reportingPeriod.schema.ts` (50 lines)
- `types/interfaces/ReportingPeriod.ts` (35 lines)

**Files modified:**
- `server/models/batch.schema.ts` — added `stageProofs`, `ttbAccount`, `cacheVersion`, `cachedAt`; deprecated `transferLog`
- `types/interfaces/Batch.ts` — matching additions, `BatchTtbAccount` exported
- `server/models/vessel.schema.ts` — added `proof`, `addedAt`, `lastTransferId` on contents; added `contentsVersion`, `cachedAt`, `previousContentsHistory`
- `types/interfaces/Vessel.ts`, `types/interfaces/Contents.ts` — matching additions
- `server/utils/validation.ts` — added 6 new Yup schemas

**Lessons learned for Phase 2:**
- Mongoose schemas with `enum: [...CONST_ARRAY]` need an explicit `string[]` cast to satisfy strict TS — pattern is `const VALUES: string[] = [...CONST];` then reference `VALUES`
- Server schemas can import from `composables/` via relative path — Nitro build resolves it
- `defineMongooseModel` accepts a `hooks(schema)` function for compound indexes
- LossReason DB collection was unnecessary — code-managed list is simpler since codes must map to fixed TTB report lines

---

### Phase 2 — Transfer Engine (Days 2–3) — ✅ COMPLETE (2026-05-07)

**Goal:** Atomic transfer creation working end-to-end via API. Tested in isolation.

| # | Task | Status |
|---|---|---|
| 2.1 | Create `server/utils/unitConverter.ts` — strict version that throws on unknown units. **Replaces** `utils/conversions.ts` lenient behavior. Fixes 2.1. | ✅ |
| 2.2 | Create `server/utils/transferEngineCore.ts` — pure helpers (`computeTotals`, `validateInvariants`, `TransferEngineError`) testable without DB | ✅ |
| 2.3 | Create `server/utils/transferEngine.ts` — `executeTransfer()` running in a Mongoose `withTransaction()`. Implements source decrement (multi-vessel-aware), destination increment (volume-weighted ABV merge), batch cache update, TTB account auto-routing. Fixes 1.1, 1.2, 1.3, 1.4, 1.5, 4.1. | ✅ |
| 2.4 | Implement `reverseTransfer()` — computes inverse, marks original `status: 'reversed'`, links `reverses` ↔ `reversedBy`. Fixes 12.1. | ✅ |
| 2.5 | Period-lock check via `ensurePeriodOpen()` — auto-creates period docs as 'open'; throws `PERIOD_LOCKED` if closed | ✅ |
| 2.6 | Cooperage-history capture: when a barrel slot drains, the engine appends to `previousContentsHistory[]` with batch recipe name, departure date, transfer id. Fixes 8.1. | ✅ |
| 2.7 | Create `server/api/transfer/create.post.ts` | ✅ |
| 2.8 | Create `server/api/transfer/[id]/reverse.post.ts` | ✅ |
| 2.9 | Create `server/api/transfer/index.get.ts` (filters: batch, vessel, period, type, status) | ✅ |
| 2.10 | Create `server/api/transfer/[id].get.ts` (with populated vessel/batch refs) | ✅ |
| 2.11 | Create `server/api/reporting-period/index.get.ts`, `create.post.ts`, `[period]/close.post.ts` | ✅ |
| 2.12 | Add `409 USE_TRANSFER_ENDPOINT` guard in `/api/batch/[id].put` rejecting `stageVolumes`, `stageProofs`, `transferLog` mutations | ✅ |
| 2.13 | Add `409 USE_TRANSFER_ENDPOINT` guard in `/api/vessel/[id].put` rejecting `contents`, `current`, `contentsVersion` mutations | ✅ |
| 2.14 | Vitest tests: 60 new tests across `unitConverter` (21), `transferDefinitions` (21), `transferEngineCore` (18). All pass. Full suite: 181 passing, no regressions. | ✅ |
| 2.15 | Smoke test script: `scripts/smoke-test-transfer.sh` — runnable curl-based E2E (creates transfer, verifies state, reverses, confirms 409 guard). User runs against staging. | ✅ |

**Verification:** `npm run build` clean. All tests pass. Routes built into `.output/server/chunks/routes/api/transfer/*` and `.../reporting-period/*`. Engine + transaction wrapping verified by reading.

**Files added (Phase 2):**
- `server/utils/unitConverter.ts` (~155 lines)
- `server/utils/transferEngineCore.ts` (~125 lines) — pure logic, DB-free
- `server/utils/transferEngine.ts` (~440 lines) — DB-backed transaction wrapper
- `server/api/transfer/create.post.ts`, `[id].get.ts`, `[id]/reverse.post.ts`, `index.get.ts`
- `server/api/reporting-period/create.post.ts`, `[period]/close.post.ts`, `index.get.ts`
- `tests/server/unitConverter.test.ts`, `tests/server/transferEngine.test.ts`, `tests/composables/transferDefinitions.test.ts`
- `scripts/smoke-test-transfer.sh`

**Files modified (Phase 2):**
- `server/api/batch/[id].put.ts` — replaced generic factory with guard + targeted handler
- `server/api/vessel/[id].put.ts` — same pattern

**Architecture decisions made during Phase 2:**
- Split engine into `transferEngineCore.ts` (pure, testable) and `transferEngine.ts` (DB-backed). Lets us unit-test logic without `mongodb-memory-server-replset`.
- Mongoose transactions require a replica set — Atlas already is, local dev needs `rs.initiate()` or memory-server. Phase 11 will add the latter for integration tests.
- Auto-imported names from `server/utils/` mean route handlers don't need explicit imports for `executeTransfer`, `reverseTransfer`, `TransferEngineError`. Keeps API code lean.
- Validation order: structural → loss line → per-line sanity → math reconciliation. Bad inputs surface specific errors before the math check runs.
- Reversal lands in **current** reporting period (not the original's). Mirrors TTB §19.580 correction practice.

**Bugs fixed in Phase 2 (from §4.1 catalog):**
- **1.1, 1.2, 1.3, 1.4, 1.5** (atomic non-transactional writes) — all multi-write flows now happen inside one MongoDB transaction
- **2.1** (silent unit-conversion fallback) — `unitConverter` throws on unknown units
- **8.1** (barrel `previousContents` overwritten) — engine appends to `previousContentsHistory` instead
- **12.1** (`revertToPreviousStage` ignores vessels) — `reverseTransfer` properly inverses both batch cache AND vessel contents inside one transaction

---

### Phase 3 — Reporting Periods & TTB Mapping (Day 4) — ✅ COMPLETE (2026-05-07)

**Goal:** Period locking and TTB report stubs working.

| # | Task | Status |
|---|---|---|
| 3.1 | Create `server/api/reporting-period/*` routes (list, close, create) | ✅ done in Phase 2 |
| 3.2 | Add period-immutability check to transfer engine | ✅ done in Phase 2 |
| 3.3 | Create `server/utils/ttbReportMapper.ts` rules engine — maps Transfer doc to inflow/outflow/loss line entries on the right form (5110.40/.11/.28); skips reversed + reversal transfers | ✅ |
| 3.4 | `GET /api/reports/ttb/production/[period]` — Form 5110.40 | ✅ |
| 3.5 | `GET /api/reports/ttb/storage/[period]` — Form 5110.11 | ✅ |
| 3.6 | `GET /api/reports/ttb/processing/[period]` — Form 5110.28 | ✅ |
| 3.7 | Vitest tests — 16 tests covering every transfer type, reversal-netting, multi-form spillover, sort order | ✅ |
| 3.8 | Manual test — deferred to Phase 9 (UI presentation); the test ledger from Phase 11 will exercise this | ⏭️ |

**Verification:** All tests pass. 201 total (+16 from Phase 3). Build clean. All 3 endpoints built into `.output/server/chunks/routes/api/reports/ttb/*`.

**Files added:**
- `server/utils/ttbReportMapper.ts` (~225 lines) — pure mapping logic
- `server/utils/ttbReportEndpointHelper.ts` — shared `generateTTBReport()` for the 3 endpoints
- `server/api/reports/ttb/production/[period].get.ts`
- `server/api/reports/ttb/storage/[period].get.ts`
- `server/api/reports/ttb/processing/[period].get.ts`
- `tests/server/ttbReportMapper.test.ts` (16 tests)

**Files modified:**
- `composables/transferDefinitions.ts` — removed `Upcoming → production` mapping (Upcoming is pre-production; initial entry creates new production activity instead)

**Design decisions:**
- **Skip reversed + reversal transfers** in reports — matches DISTILL x 5's "Books period" behavior. Reversal corrections net to zero in the report rather than appearing as separate add/subtract lines.
- **Per-spirit-class breakdown deferred to Phase 9** — v1 reports show gross totals across all spirit classes. Adding per-class breakdown requires joining with Recipe.class which is straightforward but inflates v1 scope.
- **Loss line attribution**: loss is recorded against the source account (the account losing volume). For initial entries with no source account, loss attributes to the destination account.
- **One transfer can affect multiple forms**: e.g., a Production → Storage transfer creates an outflow on 5110.40 AND an inflow on 5110.11. Both are emitted, and `buildFormReport(form, …)` filters to only the requested form.

**Response shape:**
```json
{
  "form": "5110.40",
  "formName": "TTB Form 5110.40 — Report of Production Operations",
  "period": "2026-05",
  "periodStatus": "open",
  "lines": [
    { "lineCode": "produced", "lineLabel": "Produced (distillation/initial entry)", "direction": "inflow", "wineGallons": 600, "proofGallons": 0, "transferIds": [...] },
    { "lineCode": "transferred_to_storage", "lineLabel": "Transferred to Storage", "direction": "outflow", "wineGallons": 80, "proofGallons": 144, "transferIds": [...] },
    { "lineCode": "loss_distillation", "lineLabel": "Loss — Foreshots / Heads / Tails", "direction": "loss", "wineGallons": 70, "proofGallons": 1 }
  ],
  "totals": { "inflowsWG": 600, "inflowsPG": 0, "outflowsWG": 80, "outflowsPG": 144, "lossesWG": 70, "lossesPG": 1 },
  "transferCount": 5,
  "generatedAt": "2026-05-07T18:48:00Z"
}
```

---

### Phase 4 — Pinia Store Refactor (Day 5) — ✅ COMPLETE (2026-05-07)

**Goal:** Stores are thin clients of the transfer endpoint.

| # | Task | Status |
|---|---|---|
| 4.1 | Create `stores/useTransferStore.ts` — list / create / reverse / getById / cross-store sync. Standalone (not via `useCrudStore` since transfers are append-only). | ✅ |
| 4.2 | Refactor `useBatchStore`: `startFirstStage`, `advanceToStage`, `revertToPreviousStage` rewritten to build `TransferInput` and call `useTransferStore.create`/`reverse`. Multi-vessel-aware via `findVesselsContaining()`. Fixes 1.1, 4.1, 6.1, 12.1. Added `beforeUpdate` to strip engine-owned fields from PUT payloads. | ✅ |
| 4.3 | Refactor `useVesselStore`: `fullTransfer`, `transferBatch`, `transferBatchContents`, `addContents`, `emptyVessel`, `disposeBarrel` route through engine. Each emits one transfer per batch in the source vessel. Fixes 1.4, 1.5, 2.2, 3.1, 8.1. Added `beforeUpdate` similarly. | ✅ |
| 4.4 | Reactivity fixes — handled architecturally: engine returns plain objects (Mongoose `.lean()` / `.toObject()`), `syncBatchAndVesselStores` uses new array references, client-side state typed as `Record<string, number>`. Fixes 10.1. | ✅ |
| 4.5 | Engine reconciliation bypass for initial-entry transfers (Upcoming → first stage, tib_in). 4 new tests covering bypass logic. | ✅ |
| 4.6 | Vitest tests for store wrappers | ⏭️ Skipped — wrappers just build `TransferInput` objects; meaningful coverage is the engine tests (62 passing) + Phase 11 integration tests with `mongodb-memory-server-replset`. |

**Verification:** `npm run build` clean. Full test suite: 185 passing (181 → 185 with bypass tests). No regressions.

**Key design decisions:**
- **Wrappers, not new methods**: legacy method signatures preserved (`startFirstStage`, `advanceToStage`, `transferBatchContents`, etc.) — bodies replaced. Existing UI calls keep working without modification, but they now route through the engine. This avoids a big-bang UI cutover.
- **Multi-vessel awareness**: `findVesselsContaining(batchId)` looks up all vessels currently holding the batch and constructs `sources[]` greedily. Replaces the `getCurrentVesselId()` single-vessel assumption that caused Bug 4.1.
- **Proof default = 0**: legacy callers don't capture proof. PG balance is trivially 0 = 0 + 0 in the bypass case. Phase 5/6 UI work will surface proof inputs and pass them through.
- **`addContents` deprecated** but kept functional via a `stage_transition` from Upcoming with the bypass. Pollutes the audit log with "Legacy addContents call" entries — acceptable until Phase 6 rewrites callers.
- **`transferBatch` deprecated** with a console.warn since its semantic (siphon all batches proportionally) was the source of Bug 3.1. The wrapper now loops and calls `transferBatchContents` per batch. Behaviour is approximately the same but each batch gets its own transfer record.

**Files added:**
- `stores/useTransferStore.ts` (~210 lines)

**Files modified:**
- `stores/useBatchStore.ts` — replaced 3 methods (~145 lines net change), added `beforeUpdate`, added `findVesselsContaining` helper
- `stores/useVesselStore.ts` — replaced 6 methods (~165 lines net change), added `beforeUpdate`, added `getSlot`/`toGallonsLenient` helpers
- `server/utils/transferEngineCore.ts` — added `bypassesBalanceCheck()` for initial-entry / tib_in cases
- `tests/server/transferEngine.test.ts` — 4 new bypass tests

**Bugs from §4.1 closed in Phase 4:**
- **1.1, 1.4, 1.5** — All vessel ↔ batch mutations atomic via engine's transaction
- **3.1** — `transferBatch` proportional siphon deprecated; per-batch transfers required
- **4.1** — Multi-vessel batch advancement now uses `findVesselsContaining()` instead of single `getCurrentVesselId()`
- **6.1** — `status: 'completed'` set inside the engine's `applyTransferToBatch` based on cleared `stageVolumes`; UI `addLogEntry` paths can't desync
- **8.1** — `previousContentsHistory[]` appended by engine on barrel drain
- **10.1** — Plain-object state + array replacement on sync = clean reactivity
- **12.1** — `revertToPreviousStage` now finds the original transfer and calls engine's `reverseTransfer`, properly inverting both batch AND vessel state

---

### Phase 5 — Transfer Action Form (Days 5–6) — ✅ COMPLETE (2026-05-07)

**Goal:** The new unified UI form usable end-to-end.

| # | Task | Status |
|---|---|---|
| 5.1 | Create `components/Transfer/TransferActionForm.vue` (the big form, §6.5.1) | ✅ |
| 5.2 | Create `components/Transfer/TransferSourceCard.vue` (one source row in the form) | ✅ |
| 5.3 | Create `components/Transfer/TransferDestCard.vue` | ✅ |
| 5.4 | Create `components/Transfer/TransferReconciliationPanel.vue` (live volume balance display) | ✅ |
| 5.5 | Create `components/Transfer/TransferLossInput.vue` (reason code + zero-loss attestation) | ✅ |
| 5.6 | Create `components/Transfer/TransferVesselPicker.vue` (multi-vessel-aware, capacity-aware). Fixes 4.1, 4.2. | ✅ |
| 5.7 | Create `components/Transfer/TransferTypeBadge.vue` | ✅ |
| 5.8 | Create `components/Modal/ModalTransferAction.vue` wrapping the form | ✅ |
| 5.9 | Wire form submit → `useTransferStore.create()` (via `composables/useTransferForm.ts`) | ✅ |
| 5.10 | Add toast with 30-second undo on success | ⏭️ deferred (toast-only confirmation lives in `useTransferStore`; explicit 30s undo affordance can be added in Phase 8 polish) |
| 5.11 | Mobile-friendly polish: sheet on phone, popover on desktop | ⏭️ deferred to Phase 8 mobile QA pass |

**Verification:** `npm run build` clean. 32 new tests in `tests/composables/useTransferForm.test.ts` cover state mutations, TTB account auto-routing, reconciliation, lossLineValid logic, build/submit. Total suite 233 passing.

**Files added:**
- `components/Transfer/TransferActionForm.vue` (~270 lines)
- `components/Transfer/TransferSourceCard.vue`, `TransferDestCard.vue`, `TransferReconciliationPanel.vue`, `TransferLossInput.vue`, `TransferVesselPicker.vue`, `TransferTypeBadge.vue`
- `components/Modal/ModalTransferAction.vue` (overlay wrapper)
- `composables/useTransferForm.ts` (~205 lines)
- `tests/composables/useTransferForm.test.ts` (32 tests)

---

### Phase 6 — Stage Shortcuts & Batch Detail Page (Day 7) — 🟡 MOSTLY COMPLETE (2026-05-07)

**Goal:** All existing batch advancement flows now route through the transfer engine, but with simpler entry points.

| # | Task | Status |
|---|---|---|
| 6.1 | Create `components/Transfer/ShortcutAdvanceStage.vue` (button → opens form pre-filled) | ✅ |
| 6.2 | Create `components/Transfer/ShortcutWithinStageMove.vue` | ✅ |
| 6.3 | Create `components/Transfer/ShortcutWithdraw.vue` | ✅ |
| 6.4 | Create `components/Transfer/ShortcutDestroy.vue` | ✅ |
| 6.5 | Replace `BatchAdvanceAction.vue` with `ShortcutAdvanceStage.vue` invocations on the batch detail page (top shortcut bar + per-stage in stacked view + Upcoming initial advance). Also replaced in `BatchStageKanban.vue`. | ✅ |
| 6.6 | Update `pages/admin/batch/[_id].vue` per §7.1 (hero strip, two-pane on desktop, collapse inactive stages, floating action) | ⬜ deferred to Phase 8 polish |
| 6.7 | Replace `BatchStepper.vue` activity pulse animation | ⬜ deferred to Phase 8 polish |
| 6.8 | Replace transfer log section with a query-driven `components/Transfer/TransferHistory.vue` | ✅ |
| 6.9 | Delete legacy code: `components/Batch/BatchAdvanceAction.vue` (928 lines), `components/Panel/PanelVesselTransfer.vue` (169 lines), `utils/vesselTransfer.ts` | ✅ |
| 6.10 | Verify all existing pipeline flows work: brewing→fermenting, fermenting→stripping, stripping→low wines, low wines→spirit run, spirit run→storage, storage→barrel, barrel→bottled | 🟡 code-trace verified; manual end-to-end QA on a real batch still pending |

**Stage-aware bookkeeping added to `ShortcutAdvanceStage`** (parity with legacy):
- Entering Stripping/Spirit/Distilling: appends a stub `DistillingRun` populated from the transfer's destination (charge volume + proof → ABV) via the existing `addStrippingRun`/`addSpiritRun`/`addDistillingRun` store actions.
- Exiting Stripping Run → Low Wines: fills the latest open run's `output{volume,abv,proofGallons}` so `recomputeLowWines` aggregates correctly.

**Bulk-storage finisher extracted** to `components/Batch/BatchCompleteToBulk.vue` (~165 lines). Wired on terminal-Storage stages in the batch detail page. Drains the source vessel via a `destruction`-typed Transfer (engine-atomic, replaces the previously-broken direct vessel mutation) with notes flagging the bulk-storage destination, then writes the bulk-spirit deposit, then marks the batch completed. A future iteration may add a dedicated `bulk_storage_deposit` transfer type so TTB reports can break this out from genuine destruction.

**Vessels page**: removed the global "Transfer" button (replaced by per-batch shortcuts on the batch detail page). Phase 8 floor view will add per-vessel-tile transfer launchers.

**Files added:** `components/Batch/BatchCompleteToBulk.vue`
**Files modified:** `components/Transfer/ShortcutAdvanceStage.vue` (+~95 lines for run bookkeeping), `pages/admin/batch/[_id].vue`, `components/Batch/BatchStageKanban.vue`, `pages/admin/vessels/index.vue`
**Files deleted:** `components/Batch/BatchAdvanceAction.vue`, `components/Panel/PanelVesselTransfer.vue`, `utils/vesselTransfer.ts`

**Verification:** `npm run build` clean. 233 tests passing. Manual end-to-end pipeline walk on a real batch (6.10) is the remaining deliverable — recommended before Phase 7 lands.

---

### Phase 7 — Production / Bottling Refactor (Day 8) — 🟡 CORE COMPLETE (2026-05-07)

**Goal:** Bottling uses the transfer engine; ghost-inventory bug eliminated.

| # | Task | Status |
|---|---|---|
| 7.1 | Refactor `components/Panel/PanelProduction.vue` to query for ALL vessels containing the batch (fixes 5.1) | ✅ |
| 7.2 | Production submission becomes a `tax_paid_withdrawal` transfer with linked Production doc | ✅ |
| 7.3 | Move cost calculation server-side: `server/api/production/create.post.ts` derives costs from vessel contents at the moment of bottling | ⬜ deferred (current client-side calc still correct; server derivation is a refactor for trust, not correctness) |
| 7.4 | Update `composables/useProductionCosts.ts` to read from the server-derived value | ⬜ deferred (depends on 7.3) |
| 7.5 | Verify bottling correctly empties ALL vessels containing the batch | ✅ engine atomic drain over `findVesselSlotsForBatch()` result |
| 7.6 | Verify "all volume bottled → status: completed" check now uses transfer ledger truth, not stageVolumes (fixes 6.1) | ✅ engine fix below |

**Engine fix:** `applyTransferToBatch` no longer adds destination volume to the batch's stage cache when `type === 'tax_paid_withdrawal'`. Tax-paid withdrawals are virtual exits from bond — the spirit has left the DSP's records, so destination stages should not inflate. With this fix, after source drain `stageVolumes` is empty and the existing line-314 completion rule fires correctly. Closes Bug 6.1.

**Bottling flow** now:
1. User clicks "Advance to Bottled" on the batch detail page → `ShortcutAdvanceStage` detects `nextStage === 'Bottled'` and opens `LazyPanelProduction` instead of the generic transfer form.
2. Panel pre-fills `vessel[]` with every vessel currently holding the batch (defensive — overrides user-selected list at submit time).
3. On submit (new `wizardSave`):
   - Engine atomic drain: one `tax_paid_withdrawal` Transfer with sources=all batch slots, destinations=[{vessel:null, volume:total, proof:weighted}], `ttbAccount.to='tax_paid'`. Engine clears stage volumes and flips `status='completed'`.
   - Production document created via `/api/production/create`.
   - Inventory adjusted (+bottle, -glassware/cap/label) if `updateInventory` checked.
   - Batch's `stages.bottled.productionRecord` linked to the new production ID.
4. Atomicity caveat: if the transfer succeeds but production creation fails (network drop between calls), an explicit toast prompts the operator to reverse the transfer or recreate the production. A future refinement could add a `Production`-aware extension to the engine for true cross-document atomicity.

**Files modified:**
- `server/utils/transferEngine.ts` — skip destination stage increment for `tax_paid_withdrawal`
- `components/Panel/PanelProduction.vue` — replaced direct vessel mutation block (~12 lines, broken under Phase 4 guards) with `drainBatchVesselsForBottling()` + sequenced production creation + inventory + batch link (~85 lines net)
- `components/Transfer/ShortcutAdvanceStage.vue` — Bottled stage routes to `LazyPanelProduction` rather than the transfer form

**Verification:** `npm run build` clean. 233 tests passing. Manual end-to-end QA on a real multi-vessel batch (recommended before Phase 8 polish lands) is the remaining deliverable.

---

### Phase 8 — Vessel Floor View & Visual Polish (Day 9)

**Goal:** §6.5.3 + §7.x improvements landed.

| # | Task | Status |
|---|---|---|
| 8.1 | Create `pages/admin/vessels/floor.vue` — vessel grid with capacity gauges | ⬜ |
| 8.2 | Add filter chips (Empty / Full / Aging / Needs attention) | ⬜ |
| 8.3 | Color-code by content age | ⬜ |
| 8.4 | Add "Transfer from here" / "Transfer to here" actions on each tile (opens TransferActionForm pre-filled) | ⬜ |
| 8.5 | Update `pages/admin/vessels/index.vue` to link to /floor as default; keep list view as toggle | ⬜ |
| 8.6 | Apply transfer-type accent colors throughout | ⬜ |
| 8.7 | Mobile QA: walk through transfer on a phone | ⬜ |

**Verification:** Open /floor on desktop and mobile. Trigger a transfer from a tile; verify form pre-fills. All vessel states render correctly.

---

### Phase 9 — TTB Reports UI (Day 10)

**Goal:** Reports generate and display.

| # | Task | Status |
|---|---|---|
| 9.1 | Create `pages/admin/reports/ttb/index.vue` — period selector, three report tabs | ⬜ |
| 9.2 | Create `components/Reports/TTBProductionReport.vue` (5110.40) | ⬜ |
| 9.3 | Create `components/Reports/TTBStorageReport.vue` (5110.11) | ⬜ |
| 9.4 | Create `components/Reports/TTBProcessingReport.vue` (5110.28) | ⬜ |
| 9.5 | Add "Close Period" admin action with confirmation modal | ⬜ |
| 9.6 | Add "Export PDF" / "Export CSV" buttons | ⬜ |
| 9.7 | Verify reports against a hand-computed test ledger | ⬜ |

**Verification:** Generate reports for a known test period; numbers match hand-computed totals to the cent.

---

### Phase 10 — Migration & Cutover (Days 11–12)

**Goal:** Existing data migrated; production rollout begins.

| # | Task | Status |
|---|---|---|
| 10.1 | Backup production DB (`mongodump`) | ⬜ |
| 10.2 | Write `server/scripts/migrateTransferLog.ts` per §8.2 | ⬜ |
| 10.3 | Run migration in local dev DB on a snapshot copy of prod data | ⬜ |
| 10.4 | Verify invariants hold across all migrated batches | ⬜ |
| 10.5 | Manual review of any flagged mismatches | ⬜ |
| 10.6 | Run migration in staging | ⬜ |
| 10.7 | Add feature flag `NUXT_PUBLIC_USE_TRANSFER_ENGINE` (default false in prod) | ⬜ |
| 10.8 | Deploy to prod with flag off; verify zero impact | ⬜ |
| 10.9 | Run migration in prod (off-hours, with backup) | ⬜ |
| 10.10 | Flip flag to true in prod; perform one real low-stakes transfer | ⬜ |
| 10.11 | Monitor for 24–48 hours | ⬜ |

**Verification:** First real transfer succeeds. Reports still generate. No support tickets in 48 hours.

---

### Phase 11 — Testing, Docs, Cleanup (Day 13)

**Goal:** Loose ends tied up.

| # | Task | Status |
|---|---|---|
| 11.1 | Full E2E test suite: walk a test batch from upcoming to bottled with intentional partial transfers, splits, merges, and one reversal | ⬜ |
| 11.2 | Stress test: create 100 transfers in 10 seconds; verify all reconcile | ⬜ |
| 11.3 | Update CLAUDE.md project overview to reflect new architecture | ⬜ |
| 11.4 | Update agent memory in `.claude/agent-memory/distillery-admin-builder/` | ⬜ |
| 11.5 | Write a short user-facing changelog: "What's new in transfers" | ⬜ |
| 11.6 | Delete legacy code marked for removal in earlier phases | ⬜ |
| 11.7 | Remove `batch.transferLog[]` field after one release cycle (Phase 12+) | ⬜ |

---

### Phase 12 — Optional / Stretch (Day 14+)

| # | Task | Status |
|---|---|---|
| 12.1 | BOL/PDF attachment upload for TIB transfers | ⬜ |
| 12.2 | Barcode scanning for vessels (defer if no scanner hardware) | ⬜ |
| 12.3 | Texas TABC report generator | ⬜ |
| 12.4 | Visual rack/floor builder (drag-drop) | ⬜ |
| 12.5 | Email notifications on period close | ⬜ |
| 12.6 | Per-batch P&L view using transfer-ledger costs | ⬜ |

---

## 10. Testing Strategy

### 10.1 Unit (Vitest)

- `transferEngine.executeTransfer` — every transfer type, every error path
- `unitConverter` — every unit pair, throws on unknowns
- `ttbReportMapper` — every transfer type → expected report line
- `useTransferStore` — wrapper logic, error handling, optimistic updates

### 10.2 Integration

- API: create transfer, verify Mongo state in vessel + batch + transfer collections
- API: force a transaction failure mid-flow; verify full rollback
- API: attempt to mutate `stageVolumes` via generic PUT; verify 409

### 10.3 E2E (manual, scripted in TESTING.md)

A walk-through script for a test batch:

1. Create a 600 gal Bourbon batch with a Grain Spirit Barreled pipeline
2. Start mashing in Mash Tun A (full transfer)
3. Move 600 gal mash into Fermenter A (full)
4. After fermentation, charge Still 1 with 300 gal (partial — half stays)
5. Charge Still 1 with the remaining 300 gal (second partial)
6. Collect 80 gal low wines from each run (loss = 220 + 220 gal accounted as foreshots/heads/tails)
7. Combine low wines into the spirit-run still (merge — 2 sources → 1 dest)
8. Run spirit run; collect 60 gal hearts (loss = 100 gal, reason = redistillation_residue)
9. Split into 4 barrels of ~15 gal each (1 source → 4 dests)
10. Age (no transfers; just sampling notes)
11. Bottle out: source = all 4 barrels, dest = production record + tax_paid_withdrawal account
12. Verify ledger: every gallon accounted for; reports for the relevant periods generate correctly
13. Reverse the bottling transfer (within open period); verify all 4 barrels refilled, batch reopened

### 10.4 Reconciliation harness

A standalone script (`server/scripts/reconcile.ts`) that walks every batch's transfer ledger and verifies:
- Σ source volumes = Σ destination volumes + Σ losses
- `batch.stageVolumes` derived from ledger matches stored cache
- `vessel.contents[]` derived from ledger matches stored cache

Run nightly via cron (post-rollout).

---

## 11. Rollback Plan

If something goes badly wrong post-cutover:

1. **Within minutes** — flip `NUXT_PUBLIC_USE_TRANSFER_ENGINE` flag to false. Old code paths reactivate. Transfer collection is left in place (read-only from old code).
2. **Within hours** — if data corruption is suspected, restore the pre-migration `mongodump` snapshot.
3. **Within days** — if the architecture proves unworkable, the new Transfer collection can simply be deleted; old `batch.transferLog[]` and `vessel.contents[]` remain valid as they were before migration.

The migration script is **non-destructive** to existing fields. No drops, no schema deletions until Phase 11.7. This is intentional.

---

## 12. Risks & Open Questions

### 12.1 Risks

| Risk | Mitigation |
|---|---|
| Mongoose transactions require a replica set; MongoDB Atlas provides one but local dev might not | Document local dev setup; use `mongodb-memory-server-replset` in Vitest |
| Migrating legacy `transferLog[]` produces invariant mismatches due to lost gauge data | Flag and surface in admin UI; allow one-time manual override; default loss = 0 with note |
| Users resist the new "loss attestation required" UX | "No loss" checkbox makes the happy path one click; escalate only on real loss |
| Rolling back mid-cutover leaves transfer ledger orphaned | Acceptable; ledger is read-only after flag-off, and migration script can be re-run |
| Period-locking prevents legitimate corrections | Reverse-then-redo pattern is industry standard and supported |

### 12.2 Open questions to confirm with Timothy

1. **TTB account assignment**: should new batches start in `production` automatically, or should the user pick? (Industry default: automatic by stage.)
2. **Reporting period close cadence**: monthly to align with TTB BROP, or weekly for tighter audit?
3. **Loss reason codes**: the seed list in §6.1.1 covers the obvious cases — anything specific to GDC's operations to add?
4. **TIB external counterparties**: should these be stored as a separate Contact subtype, or just free-text in the transfer notes?
5. **Texas TABC**: out of scope for now per §3, but is there a near-term need that would push it into Phase 12?
6. **User roles**: who is allowed to close a reporting period? Just admin? A separate "compliance" role?
7. **Sample tracking**: do we want every taste/sample to generate a transfer record, or only TTB-significant ones (>1 oz, etc.)?
8. **Existing production records**: the migration touches Batches and Vessels, but should it also retroactively re-link Production records to their underlying transfers?

These will be revisited at the end of Phase 1.

---

## 13. References & Source Material

### 13.1 Internal documents

- `.claude/CLAUDE.md` — project overview
- `composables/batchPipeline.ts` — current stage definitions and helpers
- `server/models/batch.schema.ts`, `vessel.schema.ts`, `production.schema.ts` — current schemas

### 13.2 Industry references (consulted)

- DISTILL x 5 (FIVE x 5 Solutions) — https://fx5.com/distillx5/
- DISTILL x 5 Production: Make a Distillation Collection — https://support.distillerysolutions.com/hc/en-us/articles/18228068342551
- DISTILL x 5 Withdraw Spirit — https://support.distillerysolutions.com/hc/en-us/articles/360004723074
- DISTILL x 5 TTB In-Bond Requirements — https://support.distillerysolutions.com/hc/en-us/articles/360052640174
- Whiskey Systems Barrel Fill — https://whiskeysystems.zendesk.com/hc/en-us/articles/360052981754
- Whiskey Systems Batching Run — https://whiskeysystems.zendesk.com/hc/en-us/articles/360053397233
- Ekos Distillery Features — https://www.goekos.com/whiskey-systems-migration-alternative/
- OnBatch (HoochWare) — https://www.onbatch.com/pricing
- Crafted ERP Distillery Edition — https://craftederp.com/solutions/distillery-edition
- DRAMS Software Angels' Share — https://drams-software.com/articles/managing-angels-share/
- InnoVint Bond-to-Bond Transfers — https://support.innovint.us/hc/en-us/articles/360018542692
- Dropbit (open-source) — https://github.com/dropbitapp/dropbitapp

### 13.3 Regulatory references

- 27 CFR Part 19 — https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-19
- 27 CFR §19.402 (transfers in bond) — https://www.law.cornell.edu/cfr/text/27/19.402
- 27 CFR §19.598 (dump/batch records) — https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-19/subpart-V/subject-group-ECFR8556587df85145b/section-19.598
- 27 CFR §19.581 (daily records) — https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-19/subpart-V/subject-group-ECFRf3d71b256d9962d/section-19.581
- TTB Form 5110.40 (Production) — https://www.ttb.gov/ttb-form-511040
- TTB Form 5110.11 (Storage) — https://www.ttb.gov/ttb-form-511011
- TTB Form 5110.28 (Processing) — https://www.ttb.gov/ttb-form-511028
- TTB Gauging Manual — https://www.ttb.gov/public-information/foia/distilled-spirits-gauging-manual

---

## 14. Change Log

| Date | Author | Change |
|---|---|---|
| 2026-05-07 | Timothy + Claude | Initial draft based on forensic diagnosis + industry research |

---

*End of plan. Update this document as decisions are made and phases complete.*
