/**
 * GET /api/reporting-period
 *
 * List reporting periods, newest first. Used by:
 *   - admin reports page (period selector)
 *   - period-close UI
 *   - audit views
 */
export default defineEventHandler(async () => {
	try {
		return await ReportingPeriod.find({}).sort({ period: -1 }).lean();
	} catch (error) {
		console.error('Failed to list reporting periods:', error);
		throw createError({ status: 500, statusText: 'Failed to list reporting periods' });
	}
});
