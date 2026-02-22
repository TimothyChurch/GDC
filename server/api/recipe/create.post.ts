export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, recipeCreateSchema);
	try {
		return await new Recipe(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create recipe",
		});
	}
});
