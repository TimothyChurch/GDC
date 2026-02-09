export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	try {
		const updated = await PurchaseOrder.findOneAndUpdate(
			{ _id: event.context.params?._id },
			sanitized,
			{ new: true }
		);
		if (!updated) {
			throw createError({ statusCode: 404, statusMessage: "Purchase order not found" });
		}
		return updated;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update purchase order",
		});
	}
});
