export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, purchaseOrderCreateSchema);
	try {
		return await new PurchaseOrder(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create purchase order",
		});
	}
});
