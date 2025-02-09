import { defineMongooseModel } from '#nuxt/mongoose';
import type { ObjectId } from 'mongoose';

export const Item = defineMongooseModel({
	name: 'Item',
	schema: {
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
		},
		vendor: {
			type: String,
		},
		brand: {
			type: String,
			required: false,
		},
		inventoryUnit: {
			type: String,
			required: true,
		},
		purchaseHistory: {
			type: Array,
		},
		inventoryHistory: {
			type: Array,
		},
	},
});
