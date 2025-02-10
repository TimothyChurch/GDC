import { defineMongooseConnection } from '#nuxt/mongoose';

export const mongodb_connection = defineMongooseConnection({
	uri: 'mongodb+srv://TChurch:EricAvis1989@galvestondistillingco.pjkvjym.mongodb.net/',
	options: {
		user: 'TChurch',
		pass: 'EricAvis1989',
		dbName: 'GalvestonDistillingCo',
	},
});
