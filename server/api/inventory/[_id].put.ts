export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, inventoryUpdateSchema);
	if (!sanitized.location) sanitized.location = null;
	try {
		const updated = await Inventory.findOneAndUpdate(
			{ _id: event.context.params?._id },
			sanitized,
			{ new: true }
		);
		if (!updated) {
			throw createError({ statusCode: 404, statusMessage: "Inventory record not found" });
		}
		return updated;
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update inventory record",
		});
	}
});
