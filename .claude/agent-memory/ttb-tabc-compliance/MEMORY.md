# TTB/TABC Compliance Agent Memory

## GDC Distillery Profile
- Galveston Distilling Co (GDC) — Galveston, Texas
- Federally registered DSP (Distilled Spirits Plant)
- Holds Texas TABC Distiller's and Rectifier's Permit
- Production: grain-to-glass; batches tracked from Mashing through Bottled
- Spirit types produced: determined by recipe.class / recipe.type fields

## Reports Implemented (Phase 9 + Extension)

### TTB Federal Reports (components/Report/)
- `ReportTTBProduction.vue` — Form 5110.11 production; proof gallons by spirit type, heads/tails, materials
- `ReportTTBStorage.vue` — Storage ops; barrel received/removed/on-hand in WG and PG
- `ReportTTBProcessing.vue` — Form 5110.28; spirits bottled by product, dumped from barrels
- `ReportTTBExciseTax.vue` — Form 5000.24; FET on removals, Period 1/Period 2 semi-monthly deposits, CBMA tier tracking

### TABC State Reports (components/Report/)
- `ReportTABCMonthly.vue` — TX monthly production + disposition; 4 sections; DTC compliance note
- `ReportTABCExciseTax.vue` — TX excise tax $2.40/WG; batch-level detail; taxable = hearts only

### Dashboard
- `ReportComplianceDeadlines.vue` — 90-day rolling deadline window; both TTB and TABC; urgency coloring

### Report Pages (pages/admin/reports/)
- `ttb-production.vue`, `ttb-storage.vue`, `ttb-processing.vue` — existing
- `ttb-excise-tax.vue` — new; includes CBMA rate selector + YTD PG input
- `tabc-monthly.vue` — new
- `tabc-excise-tax.vue` — new
- `compliance-calendar.vue` — new; TABC permit expiry input
- `index.vue` — updated; Compliance Calendar featured card + TABC section added

## Key Tax Rates (as of 2025)
- TTB FET: $13.50/PG standard; CBMA Tier 1 $2.70/PG (first 100,000 PG); Tier 2 $13.34/PG
- TABC: $2.40/wine gallon PRODUCED (not removed — unlike federal)
- Texas taxes production; federal taxes removals

## Critical Filing Deadlines
- Monthly TTB reports: due 15th of following month
- Monthly TABC reports: due 15th of following month
- FET Period 1 (1–15th): deposit due 29th of same month
- FET Period 2 (16–end): deposit due 14th of following month
- Annual physical inventory: January 15
- CBMA annual claim: January 31
- TABC permit renewal: per expiry date (configurable in compliance-calendar.vue)

## Data Model Notes
- Proof gallons: WG × (ABV / 50) — in utils/proofGallons.ts
- TABC reports wine gallons; TTB reports proof gallons (different bases)
- Heads/tails: non-taxable at state level; all distillation output must be recorded for TTB
- Production records = spirits removed from bonded status (for FET purposes)
- normalizeDistillingRuns() in utils/distillingMigration.ts handles legacy/new run formats

## Known Gaps / Future Work
- CBMA YTD tracking: currently manual input in ttb-excise-tax.vue — could auto-calculate from all production records YTD
- TABC permit expiry: hardcoded to empty string — should come from a settings store
- Tasting room individual pours: not tracked in current data model (would need separate removal records)
- COLA (label approval): no tracking; should verify each bottle has TTB COLA + TABC label registration
- Formula approvals (TTB F 5530.5): not tracked; needed for any flavored/liqueur products

## See Also
- `compliance-gaps.md` — detailed gap analysis against 27 CFR Part 19 requirements
