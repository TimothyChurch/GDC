export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, recipeCreateSchema);
	const sanitized = sanitize(body);
	try {
		return await new Recipe(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create recipe",
		});
	}
});
