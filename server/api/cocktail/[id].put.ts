import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, cocktailUpdateSchema);
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
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: 'Error updating cocktail',
		});
	}
});
