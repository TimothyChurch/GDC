export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	if (!Array.isArray(body)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Request body must be an array of inventory records",
		});
	}

	if (body.length === 0) {
		return [];
	}

	if (body.length > 100) {
		throw createError({
			statusCode: 400,
			statusMessage: "Cannot create more than 100 inventory records at once",
		});
	}

	const records = [];
	for (const entry of body) {
		const sanitized = sanitize(entry);
		await validateBody(sanitized, inventoryCreateSchema);
		if (!sanitized.location) delete sanitized.location;
		records.push(sanitized);
	}

	try {
		return await Inventory.insertMany(records);
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create bulk inventory records",
		});
	}
});
