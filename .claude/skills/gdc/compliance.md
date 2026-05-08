# GDC Compliance (TTB + TABC)

Federal (TTB) and state (Texas TABC) regulatory reporting. The reason much of the data model exists.

## Regulators & forms

| Regulator | Form | Frequency | Purpose |
|---|---|---|---|
| TTB (federal) | **5110.40** | Monthly | Distilled spirits production account |
| TTB (federal) | **5110.11** | Monthly | Storage account (aging) |
| TTB (federal) | **5110.28** | Monthly | Processing account (bottling/blending/disposition) |
| TTB (federal) | FET (Form 5000.24) | Semi-monthly | Federal excise tax deposits |
| TTB (federal) | CBMA Tier 1 | Annual | $2.70/PG (first 100,000 PG) |
| TABC (Texas) | Monthly Operations Report | Monthly | State production summary |
| TABC (Texas) | Monthly Excise Tax | Monthly | $2.40/wine gallon |
| TTB | Annual Inventory | Yearly (Jan 15) | Year-end physical inventory |

## Data sources (today)

Reports are computed on-demand from existing collections:
- **Production records** (`Production` collection) — bottling runs with cost/tax breakdown
- **Batch stage timestamps** — when each stage started/completed
- **Inventory records** — raw materials consumed
- **BulkSpirit deposits/withdrawals** — bulk accounting

⚠️ This computation will move to the new `Transfer` ledger once the revamp completes (see `transfers.md`). For now, reports use the current schema.

## Compliance composables

### `composables/useTABCCalculations.ts` (293 LOC)

Generates Texas TABC monthly report. Input: `month` Ref (`'YYYY-MM'`).

Returns 4 sections:
1. **Production** — Distilled batches by spirit type, wine gallons, proof gallons, heads/tails
2. **Materials** — Items consumed during the month (from inventory deltas + recipe lookups)
3. **Disposition** — Bottles produced (aggregated by SKU)
4. **Storage** — Barrel aging entries + on-hand barrel inventory

Plus: TABC tax due ($2.40 × wine gallons disposed).

Used by `Report/ReportTABCMonthly.vue` → `pages/admin/reports/tabc-monthly.vue`.

### `composables/useComplianceDeadlines.ts` (260 LOC)

Generates compliance calendar (next 60-90 days):
- TTB monthly reports — due 15th of following month
- TABC monthly + excise — same date
- FET deposits — Period 1 (~29th of month), Period 2 (~14th of next month)
- Annual inventory (Jan 15)
- Annual CBMA claim (Jan 31)
- TABC permit renewal (90-day warning + expiry)

Returns urgency levels: `overdue`, `critical` (≤3 days), `warning` (≤7), `upcoming` (≤21), `ok`.

Used by `Report/ReportComplianceDeadlines.vue` AND a sidebar badge in `Admin/AdminSidebar.vue` (via `useSidebarBadges`).

### `composables/transferDefinitions.ts` (205 LOC)

TTB-specific enums and math:
- `TTB_ACCOUNTS`: production, storage, processing, tib_external, tax_paid
- `STAGE_TO_TTB_ACCOUNT`: which form each stage feeds (Mashing→production, Aging→storage, Bottling→processing)
- `getReportingPeriodForDate(date)` → 'YYYY-MM'
- `proofGallons(volume, proof)`, `abvToProof(abv)`

## Report components

All in `components/Report/`:

| Component | Page | Source |
|---|---|---|
| `ReportTTBProduction.vue` | `/admin/reports/ttb-production.vue` | Form 5110.40 — production-account batches |
| `ReportTTBStorage.vue` | `/admin/reports/ttb-storage.vue` | Form 5110.11 — aging inventory |
| `ReportTTBProcessing.vue` | `/admin/reports/ttb-processing.vue` | Form 5110.28 — Production records |
| `ReportTTBExciseTax.vue` | `/admin/reports/ttb-excise-tax.vue` | FET tax owed |
| `ReportTABCMonthly.vue` | `/admin/reports/tabc-monthly.vue` | useTABCCalculations |
| `ReportTABCExciseTax.vue` | `/admin/reports/tabc-excise-tax.vue` | TABC tax owed |
| `ReportComplianceDeadlines.vue` | `/admin/reports/compliance-calendar.vue` | useComplianceDeadlines + child quick-links + reference |
| `ReportComplianceQuickLinks.vue` | (embedded) | Static links to TTB/TABC portals |
| `ReportComplianceReference.vue` | (embedded) | Regulatory reference text |
| `ReportBarrelAging.vue` | `/admin/reports/barrels.vue` | barrelAging stage data + targetAge |
| `ReportInventoryTable.vue` | `/admin/reports/inventory.vue` | Item + Inventory levels |
| `ReportProductionChart.vue` | `/admin/reports/production.vue` | Production trends |
| `ReportCostBreakdown.vue` | `/admin/reports/costs.vue` | Production.costs analytics |

## Production cost → tax math

`composables/useProductionCosts.ts`:
```
proofGallons   = wineGallons × (abv / 50)
ttbTax         = proofGallons × $2.70  (CBMA Tier 1 rate)
tabcTax        = wineGallons × $2.40
```

These are stored in `Production.costs.ttbTax` and `costs.tabcTax` at create time, then aggregated into monthly reports.

## TTB account tracking on Batch

`Batch.ttbAccount` (enum: production / storage / processing / tib_external / tax_paid) — the bucket the batch currently belongs to. Auto-updated as batches advance through stages (`STAGE_TO_TTB_ACCOUNT` mapping).

## Reporting period (planned)

`server/models/reportingPeriod.schema.ts` defines a YYYY-MM record with `status` (open/closed/submitted), `closedBy`, `submittedBy`, `ttbReportSnapshots`. ⚠️ **Schema only** — no API yet. Once the Transfer revamp lands, periods can be closed, freezing data and creating immutable form snapshots.

## Settings → permit numbers

`Settings.distillery.permitNumbers.ttb` and `.tabc` — distillery's federal & state permit IDs. Displayed on report headers.

## Common operations

### Generating a TTB monthly report

1. Navigate to `/admin/reports/ttb-production` (or processing/storage)
2. Component reads from `useBatchStore`, `useProductionStore`, `useVesselStore`
3. Filters by `getReportingPeriodForDate(date) === 'YYYY-MM'`
4. Renders form-format table — copy/paste or PDF export to TTB

### Verifying compliance deadlines

`useComplianceDeadlines` is reactive — change `month` ref and all deadlines re-compute. Badge in admin sidebar shows count of `critical` + `overdue` items.

### Adding a new compliance form

1. Create `Report/ReportNewForm.vue` (read-only display)
2. Create `pages/admin/reports/new-form.vue` (page wrapper)
3. Add to `useComplianceDeadlines` if it's a recurring deadline
4. Update `Settings.distillery` if new permit IDs are needed
