/**
 * Shared definitions for the Transfer engine.
 *
 * Used by:
 *   - Mongoose schemas (server/models/transfer.schema.ts)
 *   - Yup validators (server/utils/validation.ts)
 *   - UI forms (components/Transfer/*)
 *   - Pinia stores (stores/useTransferStore.ts)
 *
 * Touch this file with care — changing an enum value breaks DB documents.
 * To add a new value, append (don't reorder); to remove, run a migration first.
 */

// ─── Transfer types ───────────────────────────────────────────────────────────

export const TRANSFER_TYPES = [
	'stage_transition',      // batch advances stages (e.g. Fermenting → Distilling)
	'vessel_move',           // same stage, different vessel
	'split',                 // one source → many dests (no stage change)
	'merge',                 // many sources → one dest (no stage change)
	'tib_in',                // transfer-in-bond received from another DSP
	'tib_out',               // transfer-in-bond shipped to another DSP
	'tax_paid_withdrawal',   // taxable removal (typically bottling)
	'destruction',           // dump to drain / voluntary destruction
	'sample',                // sample taken (TTB §19.434)
	'redistillation',        // re-charged into still
	'reversal',              // inverse of another transfer
] as const;

export type TransferType = (typeof TRANSFER_TYPES)[number];

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
	stage_transition: 'Stage Transition',
	vessel_move: 'Vessel Move',
	split: 'Split',
	merge: 'Merge',
	tib_in: 'Transfer In Bond (Received)',
	tib_out: 'Transfer In Bond (Shipped)',
	tax_paid_withdrawal: 'Tax-Paid Withdrawal',
	destruction: 'Destruction',
	sample: 'Sample',
	redistillation: 'Redistillation',
	reversal: 'Reversal',
};

// Single accent color per type — feeds Nuxt UI's color prop
export const TRANSFER_TYPE_COLORS: Record<TransferType, string> = {
	stage_transition: 'primary',
	vessel_move: 'cyan',
	split: 'purple',
	merge: 'purple',
	tib_in: 'amber',
	tib_out: 'amber',
	tax_paid_withdrawal: 'success',
	destruction: 'error',
	sample: 'info',
	redistillation: 'orange',
	reversal: 'neutral',
};

// ─── Loss reason codes ────────────────────────────────────────────────────────

export const LOSS_REASON_CODES = [
	'no_loss',                  // mandatory zero-loss attestation
	'evaporation',              // angel's share, ambient evap
	'spillage',                 // accidental
	'sampling',                 // <1 oz, lab/QC sampling
	'redistillation_residue',   // pot bottoms / still residue
	'foreshots_heads_tails',    // distillation cuts removed
	'cleaning',                 // residual after vessel cleaning
	'measurement_variance',     // gauge difference between source and dest
	'destruction',              // intentional destruction
	'other',                    // requires notes
] as const;

export type LossReasonCode = (typeof LOSS_REASON_CODES)[number];

export const LOSS_REASON_LABELS: Record<LossReasonCode, string> = {
	no_loss: 'No Loss (Confirmed)',
	evaporation: 'Evaporation / Angel\'s Share',
	spillage: 'Spillage',
	sampling: 'Sampling',
	redistillation_residue: 'Redistillation Residue',
	foreshots_heads_tails: 'Foreshots / Heads / Tails',
	cleaning: 'Vessel Cleaning Residual',
	measurement_variance: 'Measurement Variance',
	destruction: 'Intentional Destruction',
	other: 'Other (See Notes)',
};

// ─── TTB accounts ─────────────────────────────────────────────────────────────
// 27 CFR Part 19. Determines which TTB report line a transaction lands on.

export const TTB_ACCOUNTS = [
	'production',     // Form 5110.40
	'storage',        // Form 5110.11
	'processing',     // Form 5110.28
	'tib_external',   // received from / shipped to another DSP
	'tax_paid',       // virtual destination once excise tax determined
] as const;

export type TtbAccount = (typeof TTB_ACCOUNTS)[number];

export const TTB_ACCOUNT_LABELS: Record<TtbAccount, string> = {
	production: 'Production',
	storage: 'Storage',
	processing: 'Processing',
	tib_external: 'Transfer In Bond (External DSP)',
	tax_paid: 'Tax-Paid Inventory',
};

// Map a stage name to its default TTB account. Used to auto-assign on stage transitions.
// The stage names match composables/batchPipeline.ts ALL_STAGES.
//
// Rationale: TTB doesn't dictate exact mapping below the account level; the
// distillery picks. This default mirrors the typical small-craft DSP layout.
//
// NOTE (open question): confirm with Timothy that this mapping reflects GDC's
// actual recordkeeping practice. Easy to change later — just one map.
export const STAGE_TO_TTB_ACCOUNT: Record<string, TtbAccount> = {
	// Upcoming intentionally absent: batch is planned but not yet in any TTB
	// account. Initial entry (Upcoming → first stage) is treated as new production
	// activity in the report mapper.
	Mashing: 'production',
	Fermenting: 'production',
	'Stripping Run': 'production',
	'Low Wines': 'production',
	'Spirit Run': 'production',
	Distilling: 'production',
	Maceration: 'processing',
	Filtering: 'processing',
	'Barrel Aging': 'storage',
	Storage: 'storage',
	Blending: 'processing',
	Proofing: 'processing',
	Bottled: 'tax_paid',
};

// ─── Gauging methods ──────────────────────────────────────────────────────────
// 27 CFR §19.281–19.284

export const GAUGING_METHODS = ['volumetric', 'weight'] as const;
export type GaugingMethod = (typeof GAUGING_METHODS)[number];

// ─── Reporting period ─────────────────────────────────────────────────────────

export const REPORTING_PERIOD_STATUS = ['open', 'closed', 'submitted'] as const;
export type ReportingPeriodStatus = (typeof REPORTING_PERIOD_STATUS)[number];

/**
 * Format a Date as a YYYY-MM reporting period string.
 * TTB BROP cadence is monthly (Form 5110.40/.11/.28).
 */
export function getReportingPeriodForDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const year = d.getUTCFullYear();
	const month = String(d.getUTCMonth() + 1).padStart(2, '0');
	return `${year}-${month}`;
}

export function getCurrentReportingPeriod(): string {
	return getReportingPeriodForDate(new Date());
}

// ─── Proof gallon math ────────────────────────────────────────────────────────
// PG = wine_gallons × (proof / 100). Always derive; never store.
// Proof = 2 × ABV%. ABV% expressed as percentage (e.g., 80 for 80% ABV).

export function proofGallons(volumeWG: number, proof: number): number {
	if (!Number.isFinite(volumeWG) || !Number.isFinite(proof)) return 0;
	return (volumeWG * proof) / 100;
}

export function abvToProof(abv: number): number {
	// Accepts ABV as 0–100 (e.g., 40 = 40%). If passed 0–1, scales up.
	const a = abv > 1 ? abv : abv * 100;
	return a * 2;
}

export function proofToAbv(proof: number): number {
	return proof / 2;
}

// ─── Volume reconciliation ────────────────────────────────────────────────────

/**
 * Reconciliation tolerance for floating-point math.
 * 0.001 wine gallons ≈ 0.13 fluid ounces — tighter than any physical gauge.
 */
export const RECONCILIATION_EPSILON = 0.001;

export function isVolumeBalanced(
	sourceTotal: number,
	destTotal: number,
	lossTotal: number,
): boolean {
	return Math.abs(sourceTotal - (destTotal + lossTotal)) <= RECONCILIATION_EPSILON;
}

export function isPGBalanced(
	sourcePG: number,
	destPG: number,
	lossPG: number,
): boolean {
	return Math.abs(sourcePG - (destPG + lossPG)) <= RECONCILIATION_EPSILON;
}
