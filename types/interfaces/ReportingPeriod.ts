import type { ReportingPeriodStatus } from '../../composables/transferDefinitions';

export type { ReportingPeriodStatus };

export interface TTBReportSnapshot {
	[key: string]: unknown;
}

export interface ReportingPeriodActor {
	user?: string;
	name?: string;
}

export interface ReportingPeriod {
	_id: string;
	period: string;                  // 'YYYY-MM'
	status: ReportingPeriodStatus;   // 'open' | 'closed' | 'submitted'
	closedAt?: Date | string;
	closedBy?: ReportingPeriodActor;
	submittedAt?: Date | string;
	submittedBy?: ReportingPeriodActor;
	ttbReportSnapshots?: {
		production?: TTBReportSnapshot | null;
		storage?: TTBReportSnapshot | null;
		processing?: TTBReportSnapshot | null;
	};
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
}
