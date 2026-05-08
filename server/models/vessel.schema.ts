import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const Vessel = defineMongooseModel({
	name: 'Vessel',
	schema: {
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
			index: true,
		},
		stats: {
			weight: {
				type: Number,
				required: false,
			},
			weightUnit: {
				type: String,
				required: false,
			},
			volume: {
				type: Number,
				required: false,
			},
			volumeUnit: {
				type: String,
				required: false,
			},
		},
		barrel: {
			size: {
				type: String,
				required: false,
			},
			char: {
				type: String,
				required: false,
			},
			cost: {
				type: Number,
				required: false,
			},
		},
		contents: [
			{
				batch: {
					type: Schema.Types.ObjectId,
					ref: 'Batch',
				},
				volume: Number,
				volumeUnit: String,
				abv: Number,
				/** 2 × ABV%. Canonical proof field added with Transfer engine.
				 *  When absent (legacy), readers should fall back to abv × 2. */
				proof: Number,
				value: Number,
				addedAt: Date,
				/** Pointer to the most recent Transfer that touched this slot. */
				lastTransferId: { type: Schema.Types.ObjectId, ref: 'Transfer' },
			},
		],
		current: {
			volume: {
				type: Number,
				required: false,
			},
			volumeUnit: {
				type: String,
				required: false,
			},
			abv: {
				type: Number,
				required: false,
			},
			value: {
				type: Number,
				required: false,
			},
		},
		cost: {
			type: Number,
			required: false,
		},
		location: {
			type: String,
			required: false,
		},
		status: {
			type: String,
			required: false,
			index: true,
		},
		isUsed: {
			type: Boolean,
			default: false,
		},
		previousContents: String,
		targetAge: Number,

		// --- Optimistic locking & audit (added by Transfer engine) ---
		/** Bumped on every Transfer that touches this vessel. Used as an
		 *  optimistic-lock guard inside transferEngine to detect concurrent edits. */
		contentsVersion: { type: Number, default: 0 },
		cachedAt: Date,

		/** Append-only history of what's been in this vessel.
		 *  Replaces the lossy `previousContents: String` field for cooperage tracking. */
		previousContentsHistory: [{
			batchRecipeName: String,
			batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
			departedAt: Date,
			transferId: { type: Schema.Types.ObjectId, ref: 'Transfer' },
		}],
	},
	options: { timestamps: true },
});
