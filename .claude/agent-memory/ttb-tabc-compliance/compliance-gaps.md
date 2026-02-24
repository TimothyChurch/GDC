# GDC Compliance Gap Analysis

## Against 27 CFR Part 19 (TTB) and Texas TABC Requirements

Last updated: 2026-02-24

---

## COVERED — Data captured and reports generated

### TTB
- Production proof gallons by spirit type (hearts cut per run)
- Heads/tails/foreshots volumes and ABV per distillation run
- Materials/grain bill from recipe ingredients
- Storage account: received, removed, on-hand, angel's share losses
- Barrel inventory detail: barrel name, entry date, WG, PG, ABV, loss
- Processing: bottled by product with WG and PG; dumped from barrels
- FET calculation: proof gallons removed × rate; Period 1 / Period 2 splits
- CBMA tier tracking with YTD monitoring

### TABC
- Monthly production by spirit type (wine gallons — correct TX basis)
- Non-beverage fraction documentation (heads/tails)
- Monthly materials report
- Disposition: products bottled with wine gallons
- Texas excise tax $2.40/WG on hearts (beverage spirits)
- Batch-level tax detail with clickable links to batch records

---

## GAPS — Not yet addressed in application

### HIGH PRIORITY (audit risk)

1. **Gauge Records (27 CFR 19.586)**
   Currently missing: contemporaneous gauge record at time of production. The batch record
   captures distillation outputs but there is no formal "gauge record" with serial number,
   date/time, temperature, instrument used (hydrometer vs. digital), and TTB table reference.
   REMEDIATION: Add a gauge record sub-form to batch distillation stage.

2. **Packaging Gauge (27 CFR 19.589)**
   Bottling records do not capture the gauge taken at time of filling — proof, temperature,
   volume verified at packaging. Production record only captures quantity and bottle spec.
   REMEDIATION: Add proof/temp fields to production record.

3. **Tasting Room Removal Records**
   Spirits served in tasting room are removals from bonded premises and subject to FET.
   Currently only bottling production records are surfaced as "removals" in the FET report.
   On-premise pours must be tracked separately.
   REMEDIATION: Add a "tasting room removal" record type (date, spirit, volume, ABV, PG).

4. **COLA Tracking**
   No record of TTB Certificate of Label Approval numbers per product.
   Each bottle SKU must have a COLA on file before sale.
   REMEDIATION: Add cola_number field to Bottle interface/schema.

5. **Formula Approval (TTB F 5530.5)**
   Liqueurs, flavored spirits, and any product using non-standard processes require a TTB
   formula approval. No formula tracking in current system.
   REMEDIATION: Add formula_number / formula_approved fields to Recipe or Bottle.

### MEDIUM PRIORITY

6. **Serial Number / Lot Number on Production Records**
   27 CFR 19.591 requires bottling records include lot/serial numbers.
   The Bottled stage has lotNumber but Production record does not link to it.

7. **Water Quality Records for Proofing**
   Water used for proofing down must meet TTB purity standards; records of water source
   and quality testing may be requested during audits.
   The ProofingStage has waterSource but no quality/test fields.

8. **Inventory Reconciliation (Annual Physical Inventory)**
   Report structure for annual physical inventory (27 CFR 19.618) does not exist.
   This must compare book inventory vs. physical count and document any shortages.

9. **TABC Label Registration**
   TABC requires label registration separate from federal COLA.
   No TABC label registration tracking in current system.

10. **DSP Registration Number**
    TTB reports must include the DSP registration number on each filed report.
    This is not captured anywhere in the application; should be in a settings/profile store.

### LOW PRIORITY / BEST PRACTICE

11. **Record of Spirits Destroyed**
    Heads/tails are tracked volumetrically but there is no "destruction record" documenting
    how non-potable fractions are disposed of (e.g., returned to still, destroyed).

12. **CBMA Credit Assignment Records**
    The TTB FET report supports CBMA rate selection but does not generate the annual
    CBMA Assignment form (TTB F 5000.24 Schedule B) needed to assign credits to importers/
    wholesalers who then take the reduced rate.

13. **State Inspection Readiness Checklist**
    No in-app checklist to verify all required records are present for a TABC or TTB inspection.

---

## REGULATORY CITATIONS

- 27 CFR 19.585 — Distilled spirits production records
- 27 CFR 19.586 — Gauge records
- 27 CFR 19.588 — Production record content requirements
- 27 CFR 19.589 — Packaging gauge record
- 27 CFR 19.591 — Bottling and packaging records
- 27 CFR 19.618 — Annual physical inventory
- 27 CFR 5.22 — Standards of identity (for COLA classification)
- Texas Tax Code § 201.43 — Distiller's excise tax $2.40/gallon
- Texas Alcoholic Beverage Code § 14.01+ — Distiller's and Rectifier's Permit
- Texas SB 1232 — Direct-to-consumer sales provisions
