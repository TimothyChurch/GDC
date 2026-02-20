export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, bottleCreateSchema);
	const sanitized = sanitize(body);
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
