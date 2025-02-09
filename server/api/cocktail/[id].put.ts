import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const body = await readBody(event);
		const updatedCocktail = await Cocktail.findByIdAndUpdate(id, body, {
			new: true,
		});
		if (!updatedCocktail) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Cocktail not found',
			});
		}
		return updatedCocktail;
	} catch (error) {
		console.error('Error updating cocktail:', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Error updating cocktail',
		});
	}
});
