export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, inventoryCreateSchema);
	const sanitized = sanitize(body);
	if (!sanitized.location) delete sanitized.location;
	try {
		return await new Inventory(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create inventory record",
		});
	}
});
