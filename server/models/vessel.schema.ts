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
				value: Number,
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
		},
		isUsed: {
			type: Boolean,
			default: false,
		},
		previousContents: String,
		targetAge: Number,
	},
	options: { timestamps: true },
});
