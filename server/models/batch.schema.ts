import { defineMongooseModel } from '#nuxt/mongoose';

export const Batch = defineMongooseModel({
	name: 'Batch',
	schema: {
		recipe: {
			type: String,
			required: true,
		},
		cost: {
			type: Number,
			required: true,
		},
		batchSize: {
			type: Number,
			required: false,
		},
		batchSizeUnit: {
			type: String,
			required: false,
		},
		brewDate: {
			type: Date,
			required: false,
		},
		fermenter: {
			type: String,
			required: false,
		},
		distillDate: {
			type: Date,
			required: false,
		},
		prevTails: {
			volume: Number,
			volumeUnit: String,
			abv: Number,
		},
		collected: {
			heads: {
				volume: Number,
				volumeUnit: String,
				abv: Number,
			},
			hearts: {
				volume: Number,
				volumeUnit: String,
				abv: Number,
			},
			tails: {
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
	},
});
