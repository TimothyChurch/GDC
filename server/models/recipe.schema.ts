import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const Recipe = defineMongooseModel({
	name: 'Recipe',
	schema: {
		name: {
			type: String,
			required: true,
		},
		class: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: false,
		},
		volume: {
			type: Number,
			required: true,
		},
		volumeUnit: {
			type: String,
			required: true,
		},
		items: [
			{
				item: {
					type: Schema.Types.ObjectId,
					ref: 'Item',
					required: true,
				},
				amount: {
					type: Number,
					required: true,
				},
				unit: {
					type: String,
					required: true,
				},
			},
		],
		directions: {
			type: String,
		},
	},
});
