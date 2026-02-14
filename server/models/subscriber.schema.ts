import { defineMongooseModel } from '#nuxt/mongoose';

export const Subscriber = defineMongooseModel({
	name: 'Subscriber',
	schema: {
		email: {
			type: String,
			required: true,
			unique: true,
		},
	},
	options: { timestamps: true },
});
