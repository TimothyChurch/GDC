export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, itemUpdateSchema);
	try {
		const updated = await Item.findOneAndUpdate(
			{ _id: event.context.params?._id },
			sanitized,
			{ new: true }
		);
		if (!updated) {
			throw createError({ statusCode: 404, statusMessage: "Item not found" });
		}
		return updated;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update item",
		});
	}
});
