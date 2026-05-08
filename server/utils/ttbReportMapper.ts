import type { Transfer, TransferType, TtbAccount } from '../../types/interfaces/Transfer';
import { proofGallons } from '../../composables/transferDefinitions';

/**
 * TTB Report Mapper — maps a single Transfer document to one or more
 * report-line entries on Forms 5110.40 (Production), 5110.11 (Storage),
 * and 5110.28 (Processing).
 *
 * 27 CFR Part 19 anchor: §19.580 daily records, §19.598 dump/batch records.
 *
 * Coverage strategy for v1:
 *   - Computes per-line gross WG and PG from each transfer
 *   - Skips reversed transfers AND reversal transfers (net them out — matches Dx5 "Books period" behavior)
 *   - One transfer can affect multiple forms (e.g., Storage → Processing creates a "transferred to processing" line on 5110.11 AND a "received from storage" line on 5110.28)
 *   - Per-spirit-class breakdown is NOT included in v1; reports show gross totals. Phase 9 refinement adds class breakdown via Recipe lookup.
 *
 * Line codes are stable identifiers — internal to GDC, mapped to
 * actual TTB form line numbers in the report endpoint output.
 *
 * Phase 3 of PLAN-PIPELINE-REVAMP.md.
 */

export type TtbForm = '5110.40' | '5110.11' | '5110.28';

export type LineDirection = 'inflow' | 'outflow' | 'loss';

export interface ReportLineEntry {
	form: TtbForm;
	lineCode: string;        // stable internal code (e.g., 'received_from_production')
	lineLabel: string;       // human-readable label
	direction: LineDirection;
	wineGallons: number;
	proofGallons: number;
	transferId: string;      // for audit / drill-down
	occurredAt: Date | string;
}

// ─── Form metadata ────────────────────────────────────────────────────────────

const FORM_FOR_ACCOUNT: Record<TtbAccount, TtbForm | null> = {
	production: '5110.40',
	storage: '5110.11',
	processing: '5110.28',
	tib_external: null,        // external — appears on whichever form is on the OTHER side
	tax_paid: null,             // virtual — outflow only, appears on processing typically
};

// ─── Line code definitions ────────────────────────────────────────────────────

const LINE_LABELS: Record<string, string> = {
	// Inflows
	produced: 'Produced (distillation/initial entry)',
	received_from_production: 'Received from Production',
	received_from_storage: 'Received from Storage',
	received_from_processing: 'Received from Processing',
	received_tib_in: 'Received from another DSP (transferred in bond)',
	returned_from_processing: 'Returned from Processing',
	// Outflows
	transferred_to_storage: 'Transferred to Storage',
	transferred_to_processing: 'Transferred to Processing',
	transferred_to_production: 'Transferred to Production (redistillation)',
	transferred_tib_out: 'Transferred to another DSP (in bond)',
	withdrawn_tax_paid: 'Withdrawn — Tax Paid',
	withdrawn_destruction: 'Withdrawn — Voluntary Destruction',
	withdrawn_sample: 'Withdrawn — Sample',
	// Losses
	loss_evaporation: 'Loss — Evaporation / Angel\'s Share',
	loss_spillage: 'Loss — Spillage',
	loss_distillation: 'Loss — Foreshots / Heads / Tails',
	loss_redistillation: 'Loss — Redistillation Residue',
	loss_cleaning: 'Loss — Cleaning Residual',
	loss_measurement: 'Loss — Measurement Variance',
	loss_destruction: 'Loss — Destruction',
	loss_sampling: 'Loss — Sampling',
	loss_other: 'Loss — Other',
};

// ─── Loss reason → line code ──────────────────────────────────────────────────

function lossLineCode(reasonCode: string): string {
	switch (reasonCode) {
		case 'evaporation': return 'loss_evaporation';
		case 'spillage': return 'loss_spillage';
		case 'foreshots_heads_tails': return 'loss_distillation';
		case 'redistillation_residue': return 'loss_redistillation';
		case 'cleaning': return 'loss_cleaning';
		case 'measurement_variance': return 'loss_measurement';
		case 'destruction': return 'loss_destruction';
		case 'sampling': return 'loss_sampling';
		default: return 'loss_other';
	}
}

// ─── Source/dest account inference ────────────────────────────────────────────
// When ttbAccount.from / .to are unset, we can infer from fromStage / toStage
// via the same STAGE_TO_TTB_ACCOUNT map used by the engine.

import { STAGE_TO_TTB_ACCOUNT } from '../../composables/transferDefinitions';

function inferFromAccount(t: Transfer): TtbAccount | null {
	if (t.ttbAccount?.from) return t.ttbAccount.from;
	if (t.fromStage && STAGE_TO_TTB_ACCOUNT[t.fromStage]) return STAGE_TO_TTB_ACCOUNT[t.fromStage];
	return null;
}

function inferToAccount(t: Transfer): TtbAccount | null {
	if (t.ttbAccount?.to) return t.ttbAccount.to;
	if (t.toStage && STAGE_TO_TTB_ACCOUNT[t.toStage]) return STAGE_TO_TTB_ACCOUNT[t.toStage];
	return null;
}

// ─── Public mapper ────────────────────────────────────────────────────────────

export function mapTransferToReportLines(t: Transfer): ReportLineEntry[] {
	// Skip reversed/reversal transfers — they net to zero in the report
	if (t.status === 'reversed') return [];
	if (t.type === 'reversal') return [];

	const entries: ReportLineEntry[] = [];
	const fromAccount = inferFromAccount(t);
	const toAccount = inferToAccount(t);
	const occurredAt = t.createdAt || new Date().toISOString();

	// ─── Inflow side ──────────────────────────────────────────────────────
	// The transfer's destination side records the volume entering the `to` account.
	if (toAccount && t.totalDestVolume > 0) {
		const form = FORM_FOR_ACCOUNT[toAccount];
		if (form) {
			entries.push({
				form,
				lineCode: inflowLineCode(t.type, fromAccount, toAccount),
				lineLabel: LINE_LABELS[inflowLineCode(t.type, fromAccount, toAccount)] || 'Unknown inflow',
				direction: 'inflow',
				wineGallons: t.totalDestVolume,
				proofGallons: t.destPG,
				transferId: t._id,
				occurredAt,
			});
		}
	}

	// ─── Outflow side ─────────────────────────────────────────────────────
	if (fromAccount && t.totalSourceVolume > 0) {
		const form = FORM_FOR_ACCOUNT[fromAccount];
		if (form) {
			entries.push({
				form,
				lineCode: outflowLineCode(t.type, fromAccount, toAccount),
				lineLabel: LINE_LABELS[outflowLineCode(t.type, fromAccount, toAccount)] || 'Unknown outflow',
				direction: 'outflow',
				wineGallons: t.totalSourceVolume,
				proofGallons: t.sourcePG,
				transferId: t._id,
				occurredAt,
			});
		}
	}

	// ─── Loss line ────────────────────────────────────────────────────────
	// Loss is recorded against the SOURCE account (the account losing volume).
	// If no source account (initial entry), record against destination account.
	if (t.totalLossVolume > 0) {
		const lossAccount = fromAccount || toAccount;
		if (lossAccount) {
			const form = FORM_FOR_ACCOUNT[lossAccount];
			if (form) {
				const code = lossLineCode(t.loss?.reasonCode || 'other');
				entries.push({
					form,
					lineCode: code,
					lineLabel: LINE_LABELS[code] || 'Unknown loss',
					direction: 'loss',
					wineGallons: t.totalLossVolume,
					proofGallons: t.lossPG,
					transferId: t._id,
					occurredAt,
				});
			}
		}
	}

	return entries;
}

// ─── Line code rules ──────────────────────────────────────────────────────────

function inflowLineCode(type: TransferType, from: TtbAccount | null, to: TtbAccount | null): string {
	if (type === 'tib_in') return 'received_tib_in';
	if (from === null && to !== null) return 'produced';

	switch (from) {
		case 'production': return 'received_from_production';
		case 'storage': return 'received_from_storage';
		case 'processing': return 'received_from_processing';
		default: return 'produced';
	}
}

function outflowLineCode(type: TransferType, from: TtbAccount | null, to: TtbAccount | null): string {
	if (type === 'tib_out') return 'transferred_tib_out';
	if (type === 'tax_paid_withdrawal') return 'withdrawn_tax_paid';
	if (type === 'destruction') return 'withdrawn_destruction';
	if (type === 'sample') return 'withdrawn_sample';
	if (type === 'redistillation') return 'transferred_to_production';

	switch (to) {
		case 'storage': return 'transferred_to_storage';
		case 'processing': return 'transferred_to_processing';
		case 'production': return 'transferred_to_production';
		case 'tib_external': return 'transferred_tib_out';
		case 'tax_paid': return 'withdrawn_tax_paid';
		default: return 'withdrawn_destruction';
	}
}

// ─── Aggregation: turn a list of transfers into a per-form, per-line summary ──

export interface FormReport {
	form: TtbForm;
	formName: string;
	period: string;
	lines: ReportLineSummary[];
	totals: {
		inflowsWG: number;
		inflowsPG: number;
		outflowsWG: number;
		outflowsPG: number;
		lossesWG: number;
		lossesPG: number;
	};
	transferCount: number;
}

export interface ReportLineSummary {
	lineCode: string;
	lineLabel: string;
	direction: LineDirection;
	wineGallons: number;
	proofGallons: number;
	transferIds: string[];
}

const FORM_NAMES: Record<TtbForm, string> = {
	'5110.40': 'TTB Form 5110.40 — Report of Production Operations',
	'5110.11': 'TTB Form 5110.11 — Report of Storage Operations',
	'5110.28': 'TTB Form 5110.28 — Report of Processing Operations',
};

export function buildFormReport(form: TtbForm, period: string, transfers: Transfer[]): FormReport {
	const allEntries: ReportLineEntry[] = [];
	for (const t of transfers) {
		for (const entry of mapTransferToReportLines(t)) {
			if (entry.form === form) allEntries.push(entry);
		}
	}

	// Group by lineCode + direction
	const lineMap = new Map<string, ReportLineSummary>();
	for (const e of allEntries) {
		const key = `${e.lineCode}::${e.direction}`;
		const existing = lineMap.get(key);
		if (existing) {
			existing.wineGallons += e.wineGallons;
			existing.proofGallons += e.proofGallons;
			existing.transferIds.push(e.transferId);
		} else {
			lineMap.set(key, {
				lineCode: e.lineCode,
				lineLabel: e.lineLabel,
				direction: e.direction,
				wineGallons: e.wineGallons,
				proofGallons: e.proofGallons,
				transferIds: [e.transferId],
			});
		}
	}

	const lines = Array.from(lineMap.values()).sort((a, b) => {
		// Sort: inflows → outflows → losses, then by label
		const order: Record<LineDirection, number> = { inflow: 0, outflow: 1, loss: 2 };
		if (order[a.direction] !== order[b.direction]) return order[a.direction] - order[b.direction];
		return a.lineLabel.localeCompare(b.lineLabel);
	});

	const totals = {
		inflowsWG: round(sumWhere(lines, l => l.direction === 'inflow', 'wineGallons')),
		inflowsPG: round(sumWhere(lines, l => l.direction === 'inflow', 'proofGallons')),
		outflowsWG: round(sumWhere(lines, l => l.direction === 'outflow', 'wineGallons')),
		outflowsPG: round(sumWhere(lines, l => l.direction === 'outflow', 'proofGallons')),
		lossesWG: round(sumWhere(lines, l => l.direction === 'loss', 'wineGallons')),
		lossesPG: round(sumWhere(lines, l => l.direction === 'loss', 'proofGallons')),
	};

	// Round line totals too
	for (const line of lines) {
		line.wineGallons = round(line.wineGallons);
		line.proofGallons = round(line.proofGallons);
	}

	return {
		form,
		formName: FORM_NAMES[form],
		period,
		lines,
		totals,
		transferCount: transfers.filter(t => t.status === 'committed' && t.type !== 'reversal').length,
	};
}

function sumWhere(arr: ReportLineSummary[], pred: (l: ReportLineSummary) => boolean, key: 'wineGallons' | 'proofGallons'): number {
	return arr.filter(pred).reduce((sum, l) => sum + l[key], 0);
}

function round(n: number): number {
	return Math.round(n * 100) / 100;  // 2 decimals for report display
}
