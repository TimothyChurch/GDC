export default defineEventHandler(async (event) => {
	try {
		const productions = await Production.find();
		return productions;
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching productions.',
		});
	}
});
