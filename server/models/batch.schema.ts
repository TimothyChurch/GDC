import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const Batch = defineMongooseModel({
	name: 'Batch',
	schema: {
		recipe: {
			type: Schema.Types.ObjectId,
			ref: 'Recipe',
			required: true,
		},
		recipeCost: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: false,
		},
		batchSize: {
			type: Number,
			required: true,
		},
		batchSizeUnit: {
			type: String,
			required: true,
		},
		batchCost: {
			type: Number,
		},
		brewing: {
			vessel: {
				type: Schema.Types.ObjectId,
				ref: 'Vessel',
			},
			date: Date,
			notes: String,
		},
		fermenting: {
			vessel: {
				type: Schema.Types.ObjectId,
				ref: 'Vessel',
			},
			readings: [
				{
					date: Date,
					temperature: Number,
					temperatureUnit: String,
					gravity: Number,
				},
			],
			notes: String,
		},
		distilling: {
			vessel: {
				type: Schema.Types.ObjectId,
				ref: 'Vessel',
			},
			date: Date,
			additions: {
				tails: {
					volume: Number,
					volumeUnit: String,
					abv: Number,
				},
			},
			collected: {
				heads: {
					vessel: {
						type: Schema.Types.ObjectId,
						ref: 'Vessel',
					},
					volume: Number,
					volumeUnit: String,
					abv: Number,
				},
				hearts: {
					vessel: {
						type: Schema.Types.ObjectId,
						ref: 'Vessel',
					},
					volume: Number,
					volumeUnit: String,
					abv: Number,
				},
				tails: {
					vessel: {
						type: Schema.Types.ObjectId,
						ref: 'Vessel',
					},
					volume: Number,
					volumeUnit: String,
					abv: Number,
				},
				total: {
					volume: Number,
					volumeUnit: String,
					abv: Number,
				},
			},
			notes: String,
		},
		barreled: {
			vessel: {
				type: Schema.Types.ObjectId,
				ref: 'Vessel',
			},
			entry: {
				date: Date,
				volume: Number,
				volumeUnit: String,
				abv: Number,
			},
			exit: {
				date: Date,
				volume: Number,
				volumeUnit: String,
				abv: Number,
			},
		},
		bottled: {
			productionRecord: {
				type: Schema.Types.ObjectId,
				ref: 'Production',
			},
		},
	},
});
