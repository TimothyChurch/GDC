export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, productionCreateSchema);
	const sanitized = sanitize(body);
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
