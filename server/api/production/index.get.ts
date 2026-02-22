export default defineEventHandler(async (event) => {
	try {
		const productions = await Production.find().lean();
		return productions;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching productions.',
		});
	}
});
