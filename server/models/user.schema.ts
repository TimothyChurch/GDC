import { defineMongooseModel } from '#nuxt/mongoose';

export const User = defineMongooseModel({
	name: 'User',
	schema: {
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: false,
		},
		lastName: {
			type: String,
			required: false,
		},
	},
});
