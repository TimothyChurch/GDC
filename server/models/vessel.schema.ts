import { defineMongooseModel } from '#nuxt/mongoose';

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
		contents: {
			type: Array,
			required: false,
		},
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
	},
});
