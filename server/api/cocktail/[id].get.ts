import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const cocktail = await Cocktail.findById(id);
		if (!cocktail) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Cocktail not found',
			});
		}
		return cocktail;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Error fetching cocktail',
		});
	}
});
