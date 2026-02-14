export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const deletedProduction = await Production.findByIdAndDelete(id);
		if (!deletedProduction) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Production not found',
			});
		}
		return { message: 'Production deleted successfully' };
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while deleting the production.',
		});
	}
});
