export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, productionCreateSchema);
	try {
		const newProduction = new Production(sanitized);
		await newProduction.save();
		return newProduction;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while creating a new production.',
		});
	}
});
