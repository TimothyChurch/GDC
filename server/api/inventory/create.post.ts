export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, inventoryCreateSchema);
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
