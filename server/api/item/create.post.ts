export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, itemCreateSchema);
	const sanitized = sanitize(body);
	try {
		return await new Item(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create item",
		});
	}
});
