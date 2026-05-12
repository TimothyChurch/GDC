---
name: Transfer effectiveVolume field (grain-in correction)
description: Optional non-negative field on Transfer source/destination/loss lines that holds the post-grain-in-correction liquid volume in WG; engine computes PG from effectiveVolume when set, otherwise falls back to bulk volume.
type: project
---

Added 2026-05-12 to close the grain-in PG correction gap on the transfer/still-charge path. Companion server-only file: `server/utils/grainInCorrection.ts`.

**Why:** Before the fix, fermenter bulk volume × proof overstated TTB production PG by ~10–20% on every grain-in batch (whiskey/bourbon/rye). The `utils/grainBill.ts` helpers `calcGrainDisplacement` and `getEffectiveLiquidVolume` already existed but weren't wired into the Transfer engine.

**How to apply:**
- When adding fields to Transfer source/dest/loss lines, mirror across: `server/models/transfer.schema.ts`, `types/interfaces/Transfer.ts`, `server/utils/validation.ts` (3 yup sub-schemas)
- For PG-bearing calculations, always use `pgVolume()` helper in `transferEngineCore.ts`: it returns `effectiveVolume` when set (finite, ≥ 0), otherwise `volume`
- Server applies correction in `applyGrainInCorrection()` (called inside `executeTransfer` transaction). Client `useStillCharge.buildChargeTransferInput` can pre-supply `grainIn` ctx to save a Mongo round-trip and keep the modal hint in sync
- Don't apply correction when source vessel type is `Still` (output through condenser is pure liquid)
- Don't apply correction when stage is downstream of Stripping Run (`Spirit Run`, `Low Wines`, `Distilling`, `Storage`, etc.) — grain stays in still pot
- Pre-distillation grain-present stages: `Mashing`, `Fermenting`, `Stripping Run`
- Destination correction is stage-driven (not vessel-typed) so a "charge into still" briefly-grain-holding still gets corrected to keep PG balanced with source
- Validator rejects `effectiveVolume > volume` or `< 0`
