import { defineMongooseModel } from '#nuxt/mongoose';

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
		},
		inventoryUnit: {
			type: String,
		},
		purchaseHistory: {
			type: Array,
		},
		inventoryHistory: {
			type: Array,
		},
	},
});
