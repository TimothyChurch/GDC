import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	try {
		const updatedCocktail = await Cocktail.findByIdAndUpdate(id, sanitized, {
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
		throw createError({
			statusCode: 500,
			statusMessage: 'Error updating cocktail',
		});
	}
});
