import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';
import { REPORTING_PERIOD_STATUS } from '../../composables/transferDefinitions';

const { Schema } = mongoose;

const PERIOD_STATUS_VALUES: string[] = [...REPORTING_PERIOD_STATUS];

/**
 * One document per monthly reporting period (TTB BROP cadence).
 * Lifecycle:  open → closed → submitted
 *
 * Once a period is `closed`, the transfer engine refuses to mutate any
 * Transfer with that reportingPeriod. Corrections require a `reversal`
 * transfer in the open period.
 *
 * `submitted` indicates the corresponding TTB form (5110.40/.11/.28) has
 * been filed. Snapshots of submitted reports are stored here for audit.
 */
export const ReportingPeriod = defineMongooseModel({
	name: 'ReportingPeriod',
	schema: {
		period: {
			type: String,                  // 'YYYY-MM'
			required: true,
			unique: true,
			index: true,
		},
		status: {
			type: String,
			enum: PERIOD_STATUS_VALUES,
			default: 'open',
			index: true,
		},
		closedAt: Date,
		closedBy: {
			user: { type: Schema.Types.ObjectId, ref: 'User' },
			name: String,
		},
		submittedAt: Date,
		submittedBy: {
			user: { type: Schema.Types.ObjectId, ref: 'User' },
			name: String,
		},

		// Frozen snapshot of the three TTB reports at close time.
		// Lets us verify what was filed even if underlying data is later changed.
		ttbReportSnapshots: {
			production: { type: Schema.Types.Mixed, default: null },
			storage: { type: Schema.Types.Mixed, default: null },
			processing: { type: Schema.Types.Mixed, default: null },
		},

		notes: String,
	},
	options: { timestamps: true, autoIndex: true },
});
