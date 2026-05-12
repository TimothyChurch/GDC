import mongoose from 'mongoose';

/**
 * POST /api/inventory/bulk
 *
 * Atomic bulk insert of inventory records. Wrapped in a MongoDB transaction so
 * that either ALL records commit or NONE — fixes the partial-write window in
 * `useBatchStore.withdrawMashIngredients` and `useProductionStore.adjustInventoryForProduction`
 * where a failure mid-list could leave the batch's inventory state drifted
 * (tech-debt #45).
 *
 * Requires a MongoDB replica set (already required by the Transfer Engine).
 */
export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	if (!Array.isArray(body)) {
		throw createError({
			status: 400,
			statusText: 'Request body must be an array of inventory records',
		});
	}

	if (body.length === 0) {
		return [];
	}

	if (body.length > 100) {
		throw createError({
			status: 400,
			statusText: 'Cannot create more than 100 inventory records at once',
		});
	}

	const records: Record<string, unknown>[] = [];
	for (const entry of body) {
		const sanitized = sanitize(entry);
		await validateBody(sanitized, inventoryCreateSchema);
		if (!sanitized.location) delete sanitized.location;
		records.push(sanitized);
	}

	const session = await mongoose.startSession();
	try {
		let inserted: unknown[] = [];
		await session.withTransaction(async () => {
			inserted = await Inventory.insertMany(records, { session, ordered: true });
		});
		return inserted;
	} catch (error) {
		console.error('[inventory/bulk]', error);
		throw createError({
			status: 500,
			statusText: 'Failed to create bulk inventory records',
		});
	} finally {
		await session.endSession();
	}
});
