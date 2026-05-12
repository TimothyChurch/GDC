import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';
import {
	TRANSFER_TYPES,
	LOSS_REASON_CODES,
	TTB_ACCOUNTS,
	GAUGING_METHODS,
} from '../../composables/transferDefinitions';

const { Schema } = mongoose;

/**
 * Transfer is the source of truth for liquid movement.
 * Every stage advance, vessel move, split, merge, withdrawal, sample,
 * destruction, or TIB is one Transfer document.
 *
 * Documents are immutable once `reportingPeriod` is closed; corrections
 * happen by creating an inverse `reversal` transfer (preserves audit trail).
 *
 * Volumes stored in WINE GALLONS (canonical). Proof = 2 × ABV%.
 * PG is always computed (never stored on the source side; stored only as
 * denormalized totals for query-speed).
 *
 * 27 CFR Part 19 anchors:
 *   §19.281–19.284  gauging
 *   §19.402         transfers in bond
 *   §19.580–§19.583 daily records
 *   §19.598         dump/batch records
 */

// Cast readonly tuples to string[] for Mongoose's enum field — TS narrows
// const-asserted arrays to literal-union arrays which Mongoose's typing rejects.
const TRANSFER_TYPE_VALUES: string[] = [...TRANSFER_TYPES];
const LOSS_REASON_VALUES: string[] = [...LOSS_REASON_CODES];
const TTB_ACCOUNT_VALUES: string[] = [...TTB_ACCOUNTS];
const GAUGING_METHOD_VALUES: string[] = [...GAUGING_METHODS];

const gaugingSubSchema = {
	method: { type: String, enum: GAUGING_METHOD_VALUES },
	temperatureF: Number,
	operator: String,
};

const sourceSubSchema = {
	vessel: { type: Schema.Types.ObjectId, ref: 'Vessel', required: true },
	volume: { type: Number, required: true },   // wine gallons — bulk volume reported by operator
	proof: { type: Number, required: true },    // 2 × ABV%
	/**
	 * Post grain-in correction volume (WG). When set, PG is computed from this
	 * instead of `volume`. Undefined for non-grain-in transfers — interpret as
	 * "effective === volume". See utils/grainBill.ts getEffectiveLiquidVolume().
	 */
	effectiveVolume: { type: Number, default: undefined },
	gauging: gaugingSubSchema,
};

const destinationSubSchema = {
	vessel: { type: Schema.Types.ObjectId, ref: 'Vessel', default: null },
	stage: { type: String, default: null },     // stage this dest puts the batch into
	volume: { type: Number, required: true },
	proof: { type: Number, required: true },
	/** See sourceSubSchema.effectiveVolume. Set only when destination stage is
	 * pre-distillation AND batch is grain-in (e.g. mash → fermenter transfer). */
	effectiveVolume: { type: Number, default: undefined },
	gauging: gaugingSubSchema,
};

const lossSubSchema = {
	volume: { type: Number, required: true, default: 0 },
	proof: { type: Number, default: 0 },
	/** See sourceSubSchema.effectiveVolume. Set when the lost portion came from
	 * a grain-in pre-distillation slot. */
	effectiveVolume: { type: Number, default: undefined },
	reasonCode: { type: String, enum: LOSS_REASON_VALUES, required: true },
	notes: String,
};

const ttbAccountSubSchema = {
	from: { type: String, enum: TTB_ACCOUNT_VALUES, default: null },
	to: { type: String, enum: TTB_ACCOUNT_VALUES, default: null },
};

const attachmentSubSchema = {
	url: { type: String, required: true },
	kind: { type: String, enum: ['bol', 'gauge_record', 'photo', 'other'], required: true },
	uploadedAt: { type: Date, default: Date.now },
	filename: String,
};

const createdBySubSchema = {
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	name: String,
};

export const Transfer = defineMongooseModel({
	name: 'Transfer',
	schema: {
		// ─── Type & lifecycle ─────────────────────────────────────────────
		type: {
			type: String,
			enum: TRANSFER_TYPE_VALUES,
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ['committed', 'reversed'],
			default: 'committed',
			index: true,
		},
		reverses: {
			type: Schema.Types.ObjectId,
			ref: 'Transfer',
			default: null,
			index: true,
		},
		reversedBy: {
			type: Schema.Types.ObjectId,
			ref: 'Transfer',
			default: null,
		},

		// ─── Reporting period ─────────────────────────────────────────────
		reportingPeriod: {
			type: String,           // 'YYYY-MM'
			required: true,
			index: true,
		},

		// ─── What's moving ─────────────────────────────────────────────────
		batch: {
			type: Schema.Types.ObjectId,
			ref: 'Batch',
			required: true,
			index: true,
		},
		fromStage: { type: String, default: null },
		toStage: { type: String, default: null },

		// ─── Source side (one or more vessels for merges) ─────────────────
		sources: {
			type: [sourceSubSchema],
			default: [],
		},

		// ─── Destination side (one or more for splits) ────────────────────
		destinations: {
			type: [destinationSubSchema],
			default: [],
		},

		// ─── Loss line (mandatory) ────────────────────────────────────────
		loss: {
			type: lossSubSchema,
			required: true,
		},

		// ─── TTB accounting ───────────────────────────────────────────────
		ttbAccount: ttbAccountSubSchema,

		// ─── Free-form ────────────────────────────────────────────────────
		notes: String,
		attachments: { type: [attachmentSubSchema], default: [] },

		// ─── Audit ────────────────────────────────────────────────────────
		createdBy: createdBySubSchema,

		// ─── Computed denormalized totals (set by transferEngine) ─────────
		// These mirror the sums of sources/destinations/loss for fast query
		// against monthly TTB reports without aggregation pipelines.
		totalSourceVolume: { type: Number, default: 0 },
		totalDestVolume: { type: Number, default: 0 },
		totalLossVolume: { type: Number, default: 0 },
		sourcePG: { type: Number, default: 0 },
		destPG: { type: Number, default: 0 },
		lossPG: { type: Number, default: 0 },
	},
	options: { timestamps: true, autoIndex: true },
	hooks(schema) {
		// Compound indexes for the common query patterns:
		schema.index({ batch: 1, createdAt: -1 });                       // batch history
		schema.index({ reportingPeriod: 1, type: 1, createdAt: -1 });    // monthly TTB reports
		schema.index({ 'sources.vessel': 1, createdAt: -1 });            // vessel history (source)
		schema.index({ 'destinations.vessel': 1, createdAt: -1 });       // vessel history (dest)
	},
});
