export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, purchaseOrderCreateSchema);
	const sanitized = sanitize(body);
	try {
		return await new PurchaseOrder(sanitized).save();
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create purchase order",
		});
	}
});
