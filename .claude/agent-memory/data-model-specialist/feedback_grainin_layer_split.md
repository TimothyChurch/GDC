---
name: Grain-in correction — server derives, client optionally pre-supplies
description: For grain-in PG correction on transfers, server is authoritative (re-derives in transaction) and client passes hints when convenient; client never carries the only copy of correction state.
type: feedback
---

When wiring grain-in correction into the Transfer engine, I built BOTH a server-side derivation (`server/utils/grainInCorrection.ts`) and a client-side stamping path (`composables/useStillCharge.ts` via optional `grainIn` ctx). Both compute the same `effectiveVolume`.

**Why:** Server must be authoritative because (a) clients can be wrong/stale, (b) server-side validation in `transferEngineCore.validateInvariants` would reject mismatched effective volumes if PG fails to balance. Client supply is a UX optimization: lets `BatchStrippingRun` capture `chargeEffectiveVolume` on the run record at create time without a roundtrip, and lets `ModalDistillingCharge` show a live hint to the operator.

**How to apply:**
- Pattern for similar derived fields: server `applyXxxCorrection()` helper inside `executeTransfer` transaction (so it sees consistent state)
- Skip server derivation when client already stamped the value (`if (typeof line.effectiveVolume === 'number' && Number.isFinite(...)) return line;`) — don't overwrite a deliberate operator override
- Mirror the derivation algorithm exactly between client and server; both should consume the same `utils/grainBill.ts` helpers
- Wire into UI hints by replicating the logic in components that need real-time display (`ModalDistillingCharge.vue`, `TransferSourceCard.vue`) — same shared utils from `utils/grainBill.ts`
