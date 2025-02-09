import { defineMongooseModel } from '#nuxt/mongoose';

export const Cocktail = defineMongooseModel({
	name: 'Cocktail',
	schema: {
		name: {
			type: String,
			required: true,
		},
		glassware: {
			type: String,
			required: true,
		},
		ingredients: [
			{
				item: {
					type: String,
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
		cost: {
			type: Number,
			required: false,
		},
		price: {
			type: Number,
			required: true,
		},
		menu: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			required: false,
		},
		directions: {
			type: String,
			required: true,
		},
	},
});
