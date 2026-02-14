import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const Production = defineMongooseModel({
	name: 'Production',
	schema: {
		date: {
			type: Date,
			required: true,
			index: true,
		},
		vessel: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Vessel',
			},
		],
		bottle: {
			type: Schema.Types.ObjectId,
			ref: 'Bottle',
			required: true,
			index: true,
		},
		bottling: {
			glassware: {
				type: Schema.Types.ObjectId,
				ref: 'Item',
				required: true,
			},
			cap: {
				type: Schema.Types.ObjectId,
				ref: 'Item',
				required: true,
			},
			label: {
				type: Schema.Types.ObjectId,
				ref: 'Item',
				required: true,
			},
		},
		quantity: {
			type: Number,
			required: true,
		},
		productionCost: {
			type: Number,
			required: true,
		},
		bottleCost: {
			type: Number,
			required: true,
		},
	},
	options: { timestamps: true },
});
