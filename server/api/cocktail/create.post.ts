import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, cocktailCreateSchema);
	try {
		const newCocktail = new Cocktail(sanitized);
		await newCocktail.save();
		return newCocktail;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Error creating cocktail',
		});
	}
});
