import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	try {
		const cocktails = await Cocktail.find();
		return cocktails;
	} catch (error) {
		console.error('Error fetching cocktails:', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Error fetching cocktails',
		});
	}
});
