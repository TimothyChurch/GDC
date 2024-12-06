export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const body = await readBody(event);
		const updatedProduction = await Production.findByIdAndUpdate(id, body, {
			new: true,
		});
		if (!updatedProduction) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Production not found',
			});
		}
		return updatedProduction;
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while updating the production.',
		});
	}
});
