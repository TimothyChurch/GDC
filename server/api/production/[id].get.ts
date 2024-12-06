export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const production = await Production.findById(id);
		if (!production) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Production not found',
			});
		}
		return production;
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching the production.',
		});
	}
});
