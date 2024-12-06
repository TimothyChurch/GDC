import { defineMongooseModel } from '#nuxt/mongoose';

export const Production = defineMongooseModel({
	name: 'Production',
	schema: {
		date: {
			type: Date,
			required: true,
		},
		vessel: {
			type: Array,
			required: true,
			items: {
				type: String,
				ref: 'Vessel',
			},
		},
		bottle: {
			type: String,
			required: true,
		},
		bottling: {
			type: Object,
			required: true,
			schema: {
				glassware: {
					type: String,
					required: true,
				},
				cap: {
					type: String,
					required: true,
				},
				label: {
					type: String,
					required: true,
				},
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
});
