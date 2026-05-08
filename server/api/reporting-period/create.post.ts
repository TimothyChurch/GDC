/**
 * POST /api/reporting-period
 *
 * Manually create a reporting period. Most periods are auto-created on the
 * first transfer of the month (see transferEngine.ensurePeriodOpen). This
 * endpoint is useful for back-filling historical periods or pre-creating
 * future ones.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, reportingPeriodCreateSchema);

	try {
		// Idempotent: return existing if it already exists
		const existing = await ReportingPeriod.findOne({ period: sanitized.period }).lean();
		if (existing) return existing;

		const doc = new ReportingPeriod(sanitized);
		await doc.save();
		return doc;
	} catch (error: any) {
		console.error('Failed to create reporting period:', error);
		throw createError({
			status: 500,
			statusText: 'Failed to create reporting period',
			data: { message: error?.message },
		});
	}
});
