import type {
	TransferType,
	LossReasonCode,
	TtbAccount,
	GaugingMethod,
} from '../../composables/transferDefinitions';

export type { TransferType, LossReasonCode, TtbAccount, GaugingMethod };

// ─── Sub-interfaces ───────────────────────────────────────────────────────────

export interface TransferGauging {
	method?: GaugingMethod;
	temperatureF?: number;
	operator?: string;
}

export interface TransferSource {
	vessel: string;          // ObjectId of the source Vessel
	volume: number;          // wine gallons — bulk volume reported by operator
	proof: number;           // 2 × ABV%
	/** Post grain-in correction volume (WG). When set, PG = effectiveVolume ×
	 * proof / 100. Undefined means "effective === volume" (the grain-out case
	 * or downstream-of-still where the bulk volume is already pure liquid). */
	effectiveVolume?: number;
	gauging?: TransferGauging;
}

export interface TransferDestination {
	vessel: string | null;   // null for destruction / withdrawal
	stage?: string | null;   // stage this dest puts the batch into
	volume: number;
	proof: number;
	/** See TransferSource.effectiveVolume. */
	effectiveVolume?: number;
	gauging?: TransferGauging;
}

export interface TransferLoss {
	volume: number;          // wine gallons; ≥ 0
	proof?: number;          // proof of the lost portion
	/** See TransferSource.effectiveVolume. */
	effectiveVolume?: number;
	reasonCode: LossReasonCode;
	notes?: string;
}

export interface TransferTtbAccount {
	from?: TtbAccount | null;
	to?: TtbAccount | null;
}

export interface TransferAttachment {
	url: string;
	kind: 'bol' | 'gauge_record' | 'photo' | 'other';
	uploadedAt: Date | string;
	filename?: string;
}

export interface TransferCreatedBy {
	user?: string;
	name?: string;
}

// ─── Main interface ───────────────────────────────────────────────────────────

export interface Transfer {
	_id: string;
	type: TransferType;
	status: 'committed' | 'reversed';

	reverses: string | null;       // pointer to original transfer (if this is a reversal)
	reversedBy: string | null;     // pointer to reversal transfer (if this was reversed)

	reportingPeriod: string;       // 'YYYY-MM'

	batch: string;                 // ObjectId of Batch
	fromStage: string | null;
	toStage: string | null;

	sources: TransferSource[];
	destinations: TransferDestination[];
	loss: TransferLoss;

	ttbAccount?: TransferTtbAccount;

	notes?: string;
	attachments?: TransferAttachment[];

	createdBy?: TransferCreatedBy;

	// Denormalized totals (computed by transferEngine)
	totalSourceVolume: number;
	totalDestVolume: number;
	totalLossVolume: number;
	sourcePG: number;
	destPG: number;
	lossPG: number;

	createdAt?: string;
	updatedAt?: string;
}

// ─── Input type for the create endpoint ───────────────────────────────────────
// Distinguished from the persisted Transfer because the client-supplied payload
// is missing _id, totals, status, reversedBy, etc. — those are server-set.

export interface TransferInput {
	type: TransferType;
	batch: string;

	fromStage?: string | null;
	toStage?: string | null;

	sources: TransferSource[];
	destinations: TransferDestination[];
	loss: TransferLoss;

	ttbAccount?: TransferTtbAccount;

	notes?: string;
	attachments?: TransferAttachment[];
}
