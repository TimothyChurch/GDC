export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const newProduction = new Production(body);
		await newProduction.save();
		return newProduction;
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while creating a new production.',
		});
	}
});
