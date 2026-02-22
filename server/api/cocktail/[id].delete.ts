import { Cocktail } from '~/server/models/cocktail.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const deletedCocktail = await Cocktail.findByIdAndDelete(id);
		if (!deletedCocktail) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Cocktail not found',
			});
		}
		return { message: 'Cocktail deleted successfully' };
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: 'Error deleting cocktail',
		});
	}
});
