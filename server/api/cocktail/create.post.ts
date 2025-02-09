import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const newCocktail = new Cocktail(body);
		await newCocktail.save();
		return newCocktail;
	} catch (error) {
		console.error('Error creating cocktail:', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Error creating cocktail',
		});
	}
});
