export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, bottleCreateSchema);
	if (!sanitized.recipe) delete sanitized.recipe;
	try {
		return await new Bottle(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create bottle",
		});
	}
});
