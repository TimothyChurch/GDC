export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, productionUpdateSchema);
	try {
		const updatedProduction = await Production.findByIdAndUpdate(id, sanitized, {
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
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while updating the production.',
		});
	}
});
