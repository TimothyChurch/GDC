import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Reusable sub-schemas
const vesselRef = { type: Schema.Types.ObjectId, ref: 'Vessel' };
const volumeFields = { volume: Number, volumeUnit: String, abv: Number };
const volumeFieldsWithPG = { ...volumeFields, proofGallons: Number };

const stageBase = {
	startedAt: Date,
	completedAt: Date,
	vessel: vesselRef,
	notes: String,
};

const cutSchema = {
	vessel: String,
	volume: Number,
	volumeUnit: String,
	abv: Number,
	disposed: Boolean,
};

export const Batch = defineMongooseModel({
	name: 'Batch',
	schema: {
		recipe: {
			type: Schema.Types.ObjectId,
			ref: 'Recipe',
			required: true,
			index: true,
		},
		batchNumber: String,
		pipeline: {
			type: [String],
			required: true,
		},
		currentStage: {
			type: String,
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ['active', 'completed', 'cancelled'],
			default: 'active',
			index: true,
		},
		batchSize: {
			type: Number,
			required: true,
		},
		batchSizeUnit: {
			type: String,
			required: true,
		},
		recipeCost: {
			type: Number,
			required: true,
		},
		batchCost: Number,
		barrelCost: Number,
		notes: String,

		// --- Stage data ---
		stages: {
			mashing: {
				...stageBase,
				strikeWaterVolume: Number,
				strikeWaterVolumeUnit: String,
				strikeWaterTemp: Number,
				strikeWaterTempUnit: String,
				mashTemp: Number,
				mashTempUnit: String,
				mashDuration: Number,
				pH: Number,
				preBoilGravity: Number,
				postBoilGravity: Number,
			},
			fermenting: {
				...stageBase,
				yeastStrain: String,
				pitchTemp: Number,
				pitchTempUnit: String,
				readings: [{
					date: Date,
					temperature: Number,
					temperatureUnit: String,
					gravity: Number,
					pH: Number,
					notes: String,
				}],
				originalGravity: Number,
				finalGravity: Number,
				estimatedAbv: Number,
				washVolume: Number,
				washVolumeUnit: String,
			},
			distilling: {
				...stageBase,
				runs: [{
					runNumber: Number,
					runType: { type: String, enum: ['stripping', 'spirit'] },
					date: Date,
					chargeVolume: Number,
					chargeVolumeUnit: String,
					chargeAbv: Number,
					chargeSourceVessel: String,
					additions: [{
						label: String,
						sourceVessel: String,
						volume: Number,
						volumeUnit: String,
						abv: Number,
					}],
					output: {
						vessel: String,
						volume: Number,
						volumeUnit: String,
						abv: Number,
						proofGallons: Number,
					},
					collected: {
						foreshots: cutSchema,
						heads: cutSchema,
						lateHeads: cutSchema,
						hearts: cutSchema,
						tails: cutSchema,
					},
					total: volumeFieldsWithPG,
					notes: String,
				}],
				// Legacy fields preserved for existing documents
				runType: { type: String, enum: ['stripping', 'spirit', 'single'] },
				runNumber: Number,
				chargeVolume: Number,
				chargeVolumeUnit: String,
				chargeAbv: Number,
				additions: {
					tails: volumeFields,
					feints: volumeFields,
				},
				collected: {
					foreshots: cutSchema,
					heads: cutSchema,
					lateHeads: cutSchema,
					hearts: cutSchema,
					tails: cutSchema,
					total: volumeFieldsWithPG,
				},
			},
			maceration: {
				...stageBase,
				baseSpirit: {
					source: String,
					...volumeFields,
				},
				botanicals: [{
					item: { type: Schema.Types.ObjectId, ref: 'Item' },
					name: String,
					weight: Number,
					weightUnit: String,
				}],
				method: { type: String, enum: ['direct', 'vapor basket', 'both'] },
				startDate: Date,
				endDate: Date,
				temperature: Number,
				temperatureUnit: String,
				duration: Number,
			},
			filtering: {
				...stageBase,
				method: String,
				preVolume: Number,
				preVolumeUnit: String,
				preAbv: Number,
				postVolume: Number,
				postVolumeUnit: String,
				postAbv: Number,
				filterMedia: String,
				passes: Number,
			},
			barrelAging: {
				...stageBase,
				barrelType: String,
				barrelSize: String,
				charLevel: String,
				previousUse: String,
				warehouseLocation: String,
				entry: {
					date: Date,
					...volumeFieldsWithPG,
				},
				exit: {
					date: Date,
					...volumeFieldsWithPG,
				},
				samplings: [{
					date: Date,
					abv: Number,
					volume: Number,
					volumeUnit: String,
					notes: String,
				}],
				targetAge: Number,
			},
			storage: {
				...stageBase,
				...volumeFieldsWithPG,
			},
			blending: {
				...stageBase,
				components: [{
					source: String,
					...volumeFields,
				}],
				resultVolume: Number,
				resultVolumeUnit: String,
				resultAbv: Number,
			},
			proofing: {
				...stageBase,
				startAbv: Number,
				targetAbv: Number,
				startVolume: Number,
				startVolumeUnit: String,
				waterAdded: Number,
				waterAddedUnit: String,
				finalVolume: Number,
				finalVolumeUnit: String,
				finalAbv: Number,
				finalProofGallons: Number,
				waterSource: String,
			},
			bottled: {
				...stageBase,
				productionRecord: {
					type: Schema.Types.ObjectId,
					ref: 'Production',
				},
				bottleCount: Number,
				bottleSize: String,
				lotNumber: String,
				labeledAbv: Number,
			},
		},

		// --- Tasting notes ---
		tastingNotes: [{
			date: { type: Date, default: Date.now },
			abv: Number,
			notes: String,
			addedBy: String,
		}],

		// --- Volume tracking across stages ---
		stageVolumes: {
			type: Map,
			of: Number,
			default: {},
		},

		// --- Transfer log ---
		transferLog: [{
			from: String,
			to: String,
			volume: Number,
			volumeUnit: String,
			date: { type: Date, default: Date.now },
			vessel: String,
			user: String,
		}],

		// --- Activity log ---
		log: [{
			date: { type: Date, default: Date.now },
			action: String,
			user: String,
			details: String,
		}],
	},
	options: { timestamps: true },
});
