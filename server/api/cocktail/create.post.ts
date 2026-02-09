import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, cocktailCreateSchema);
	const sanitized = sanitize(body);
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
