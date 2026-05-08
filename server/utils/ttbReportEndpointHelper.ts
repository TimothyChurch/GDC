import type { TtbForm, FormReport } from './ttbReportMapper';
import { buildFormReport } from './ttbReportMapper';

/**
 * Shared logic for the three TTB report endpoints (production, storage, processing).
 *
 * 1. Validate the period param
 * 2. Query all transfers in that reporting period
 * 3. Run them through the report mapper
 * 4. Resolve the matching ReportingPeriod doc to surface period status (open/closed/submitted)
 * 5. Return the formatted report with metadata
 */

export interface TTBReportResponse extends FormReport {
	periodStatus: 'open' | 'closed' | 'submitted' | 'unknown';
	closedAt?: Date | string | null;
	generatedAt: string;
}

export async function generateTTBReport(form: TtbForm, period: string): Promise<TTBReportResponse> {
	if (!/^\d{4}-\d{2}$/.test(period)) {
		throw createError({ status: 400, statusText: 'Period must be in YYYY-MM format' });
	}

	// 1. Pull all transfers in this period
	const transfers = await Transfer.find({ reportingPeriod: period }).lean();

	// 2. Map + aggregate
	const report = buildFormReport(form, period, transfers as any);

	// 3. Lookup period status
	const periodDoc = await ReportingPeriod.findOne({ period }).lean();

	return {
		...report,
		periodStatus: (periodDoc?.status as any) || 'unknown',
		closedAt: periodDoc?.closedAt || null,
		generatedAt: new Date().toISOString(),
	};
}
