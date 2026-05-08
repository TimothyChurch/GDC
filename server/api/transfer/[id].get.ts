/**
 * GET /api/transfer/[id]
 *
 * Fetch a single Transfer with source/destination vessel names populated for UI rendering.
 */
export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	if (!id) {
		throw createError({ status: 400, statusText: 'Transfer ID is required' });
	}
	validateObjectId(id, 'transfer');

	try {
		const doc = await Transfer.findById(id)
			.populate('sources.vessel', 'name type')
			.populate('destinations.vessel', 'name type')
			.populate('batch', 'batchNumber recipe currentStage')
			.populate('reverses', 'type createdAt')
			.populate('reversedBy', 'type createdAt')
			.lean();

		if (!doc) {
			throw createError({ status: 404, statusText: 'Transfer not found' });
		}
		return doc;
	} catch (error: any) {
		if (error?.statusCode || error?.status) throw error;
		console.error('Failed to fetch transfer:', error);
		throw createError({ status: 500, statusText: 'Failed to fetch transfer' });
	}
});
