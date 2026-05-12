/**
 * POST /api/reporting-period/[period]/close
 *
 * Lock the reporting period. After closing, transferEngine refuses to mutate
 * any Transfer with this reportingPeriod — corrections require a `reversal`
 * transfer in the current period.
 *
 * Mirrors DISTILL x 5's "Books period" lifecycle and TTB §19.580 daily-record
 * requirements.
 *
 * Admin-only: closing a reporting period is the TTB audit boundary — once
 * closed, transfers in this period can only be corrected via reversal.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const period = event.context.params?.period;
	if (!period) {
		throw createError({ status: 400, statusText: 'Period is required' });
	}
	if (!/^\d{4}-\d{2}$/.test(period)) {
		throw createError({ status: 400, statusText: 'Period must be in YYYY-MM format' });
	}

	const body = await readBody(event).catch(() => ({}));
	const sanitized = sanitize(body || {});
	await validateBody(sanitized, reportingPeriodCloseSchema);

	const session = await getAuthSession(event);
	const closedBy: { user?: string; name?: string } = {
		user: session.data.userId,
		name: session.data.email,
	};

	try {
		const existing = await ReportingPeriod.findOne({ period });
		if (!existing) {
			// Auto-create then close if no transfers ever happened in this period.
			const doc = new ReportingPeriod({
				period,
				status: 'closed',
				closedAt: new Date(),
				closedBy,
				notes: sanitized.notes,
			});
			await doc.save();
			return doc;
		}
		const doc = existing as any;
		if (doc.status !== 'open') {
			throw createError({
				status: 409,
				statusText: `Period ${period} is already ${doc.status}`,
			});
		}
		doc.status = 'closed';
		doc.closedAt = new Date();
		doc.closedBy = closedBy;
		if (sanitized.notes) doc.notes = sanitized.notes;
		await existing.save();
		return existing;
	} catch (error: any) {
		if (error?.statusCode || error?.status) throw error;
		console.error('Failed to close reporting period:', error);
		throw createError({
			status: 500,
			statusText: 'Failed to close reporting period',
			data: { message: error?.message },
		});
	}
});
