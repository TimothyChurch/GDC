/**
 * GET /api/transfer
 *
 * List transfers with optional filters:
 *   ?batch=<id>             — transfers touching this batch
 *   ?vessel=<id>            — transfers touching this vessel (source OR destination)
 *   ?period=YYYY-MM         — transfers in this reporting period
 *   ?type=<transferType>    — filter by transfer type
 *   ?status=committed|reversed
 *   ?limit=<n>              — default 100, max 1000
 *
 * Always sorted newest-first by createdAt.
 */
export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const filter: Record<string, any> = {};

	if (query.batch) {
		const id = validateObjectId(String(query.batch), 'batch');
		filter.batch = id;
	}
	if (query.vessel) {
		const id = validateObjectId(String(query.vessel), 'vessel');
		filter.$or = [{ 'sources.vessel': id }, { 'destinations.vessel': id }];
	}
	if (query.period) {
		filter.reportingPeriod = String(query.period);
	}
	if (query.type) {
		filter.type = String(query.type);
	}
	if (query.status) {
		filter.status = String(query.status);
	}

	const requestedLimit = Number(query.limit) || 100;
	const limit = Math.min(Math.max(requestedLimit, 1), 1000);

	try {
		return await Transfer.find(filter)
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();
	} catch (error) {
		console.error('Failed to list transfers:', error);
		throw createError({ status: 500, statusText: 'Failed to list transfers' });
	}
});
