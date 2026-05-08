import { describe, it, expect } from 'vitest';
import {
	mapTransferToReportLines,
	buildFormReport,
} from '~/server/utils/ttbReportMapper';
import type { Transfer } from '~/types/interfaces/Transfer';

/**
 * Tests for the TTB report mapper rules engine.
 * Phase 3 of PLAN-PIPELINE-REVAMP.md.
 */

function makeTransfer(overrides: Partial<Transfer>): Transfer {
	return {
		_id: overrides._id || 'transfer-1',
		type: 'stage_transition',
		status: 'committed',
		reverses: null,
		reversedBy: null,
		reportingPeriod: '2026-05',
		batch: 'batch-1',
		fromStage: null,
		toStage: null,
		sources: [],
		destinations: [],
		loss: { volume: 0, proof: 0, reasonCode: 'no_loss' },
		ttbAccount: { from: null, to: null },
		totalSourceVolume: 0,
		totalDestVolume: 0,
		totalLossVolume: 0,
		sourcePG: 0,
		destPG: 0,
		lossPG: 0,
		createdAt: '2026-05-07T12:00:00Z',
		...overrides,
	} as Transfer;
}

describe('mapTransferToReportLines — basics', () => {
	it('returns empty for reversed transfers', () => {
		const t = makeTransfer({ status: 'reversed' });
		expect(mapTransferToReportLines(t)).toEqual([]);
	});

	it('returns empty for reversal-type transfers', () => {
		const t = makeTransfer({ type: 'reversal' });
		expect(mapTransferToReportLines(t)).toEqual([]);
	});

	it('returns empty for committed but zero-volume transfer', () => {
		const t = makeTransfer({});
		expect(mapTransferToReportLines(t)).toEqual([]);
	});
});

describe('mapTransferToReportLines — production stage transitions', () => {
	it('Upcoming → Mashing produces an inflow on 5110.40', () => {
		const t = makeTransfer({
			fromStage: 'Upcoming',
			toStage: 'Mashing',
			ttbAccount: { from: null, to: 'production' },
			totalDestVolume: 600,
			destPG: 0,
		});
		const entries = mapTransferToReportLines(t);
		const inflows = entries.filter(e => e.direction === 'inflow');
		expect(inflows).toHaveLength(1);
		expect(inflows[0].form).toBe('5110.40');
		expect(inflows[0].lineCode).toBe('produced');
		expect(inflows[0].wineGallons).toBe(600);
	});

	it('Storage → Barrel Aging keeps everything in 5110.11', () => {
		const t = makeTransfer({
			fromStage: 'Storage',
			toStage: 'Barrel Aging',
			ttbAccount: { from: 'storage', to: 'storage' },
			totalSourceVolume: 50,
			totalDestVolume: 50,
			sourcePG: 40,
			destPG: 40,
			sources: [{ vessel: 'tank-1', volume: 50, proof: 80 }],
			destinations: [{ vessel: 'barrel-1', volume: 50, proof: 80 }],
		});
		const entries = mapTransferToReportLines(t);
		// Both inflow and outflow on 5110.11 (it's intra-account)
		const storageEntries = entries.filter(e => e.form === '5110.11');
		expect(storageEntries.some(e => e.direction === 'inflow')).toBe(true);
		expect(storageEntries.some(e => e.direction === 'outflow')).toBe(true);
	});

	it('Production → Storage creates outflow on 5110.40 AND inflow on 5110.11', () => {
		const t = makeTransfer({
			fromStage: 'Spirit Run',
			toStage: 'Barrel Aging',
			ttbAccount: { from: 'production', to: 'storage' },
			totalSourceVolume: 80,
			totalDestVolume: 80,
			sourcePG: 144,
			destPG: 144,
			sources: [{ vessel: 'still', volume: 80, proof: 180 }],
			destinations: [{ vessel: 'barrel', volume: 80, proof: 180 }],
		});
		const entries = mapTransferToReportLines(t);

		const outflow = entries.find(e => e.form === '5110.40' && e.direction === 'outflow');
		expect(outflow).toBeDefined();
		expect(outflow!.lineCode).toBe('transferred_to_storage');
		expect(outflow!.wineGallons).toBe(80);
		expect(outflow!.proofGallons).toBe(144);

		const inflow = entries.find(e => e.form === '5110.11' && e.direction === 'inflow');
		expect(inflow).toBeDefined();
		expect(inflow!.lineCode).toBe('received_from_production');
		expect(inflow!.wineGallons).toBe(80);
	});
});

describe('mapTransferToReportLines — withdrawals', () => {
	it('tax-paid withdrawal lands on 5110.28 outflow', () => {
		const t = makeTransfer({
			type: 'tax_paid_withdrawal',
			fromStage: 'Bottled',
			toStage: null,
			ttbAccount: { from: 'processing', to: 'tax_paid' },
			totalSourceVolume: 5,
			sourcePG: 8,
			sources: [{ vessel: 'bottling-tank', volume: 5, proof: 160 }],
		});
		const entries = mapTransferToReportLines(t);
		const outflow = entries.find(e => e.direction === 'outflow');
		expect(outflow).toBeDefined();
		expect(outflow!.form).toBe('5110.28');
		expect(outflow!.lineCode).toBe('withdrawn_tax_paid');
	});

	it('destruction lands on the source-account form as outflow', () => {
		const t = makeTransfer({
			type: 'destruction',
			ttbAccount: { from: 'storage', to: null },
			totalSourceVolume: 10,
			totalLossVolume: 10,
			sourcePG: 16,
			lossPG: 16,
			loss: { volume: 10, proof: 160, reasonCode: 'destruction' },
			sources: [{ vessel: 'tank-1', volume: 10, proof: 160 }],
		});
		const entries = mapTransferToReportLines(t);
		const outflow = entries.find(e => e.direction === 'outflow');
		expect(outflow!.form).toBe('5110.11');
		expect(outflow!.lineCode).toBe('withdrawn_destruction');
	});

	it('TIB-out lands on source-account outflow with tib_out line', () => {
		const t = makeTransfer({
			type: 'tib_out',
			ttbAccount: { from: 'storage', to: 'tib_external' },
			totalSourceVolume: 100,
			totalDestVolume: 100,
			sourcePG: 80,
			destPG: 80,
			sources: [{ vessel: 'tank', volume: 100, proof: 80 }],
		});
		const entries = mapTransferToReportLines(t);
		const outflow = entries.find(e => e.direction === 'outflow');
		expect(outflow!.lineCode).toBe('transferred_tib_out');
		expect(outflow!.form).toBe('5110.11');
	});
});

describe('mapTransferToReportLines — loss', () => {
	it('foreshots/heads/tails records as distillation loss on production form', () => {
		const t = makeTransfer({
			fromStage: 'Fermenting',
			toStage: 'Low Wines',
			ttbAccount: { from: 'production', to: 'production' },
			totalSourceVolume: 100,
			totalDestVolume: 30,
			totalLossVolume: 70,
			sourcePG: 16,
			destPG: 15,
			lossPG: 1,
			loss: { volume: 70, proof: 1.43, reasonCode: 'foreshots_heads_tails' },
			sources: [{ vessel: 'still', volume: 100, proof: 16 }],
			destinations: [{ vessel: 'low_wines', volume: 30, proof: 50 }],
		});
		const entries = mapTransferToReportLines(t);
		const loss = entries.find(e => e.direction === 'loss');
		expect(loss!.form).toBe('5110.40');
		expect(loss!.lineCode).toBe('loss_distillation');
		expect(loss!.wineGallons).toBe(70);
	});

	it('evaporation in barrel aging records as evaporation loss on storage form', () => {
		const t = makeTransfer({
			type: 'destruction',
			fromStage: 'Barrel Aging',
			ttbAccount: { from: 'storage', to: null },
			totalSourceVolume: 0,  // no actual transfer
			totalLossVolume: 2,    // 2 gal angel's share
			lossPG: 1.6,
			loss: { volume: 2, proof: 80, reasonCode: 'evaporation' },
		});
		const entries = mapTransferToReportLines(t);
		const loss = entries.find(e => e.direction === 'loss');
		expect(loss!.form).toBe('5110.11');
		expect(loss!.lineCode).toBe('loss_evaporation');
	});
});

describe('buildFormReport — aggregation', () => {
	it('sums multiple transfers into per-line totals', () => {
		const transfers = [
			makeTransfer({
				_id: 't1',
				ttbAccount: { from: null, to: 'production' },
				totalDestVolume: 600,
				destPG: 0,
			}),
			makeTransfer({
				_id: 't2',
				ttbAccount: { from: null, to: 'production' },
				totalDestVolume: 400,
				destPG: 0,
			}),
			makeTransfer({
				_id: 't3',
				ttbAccount: { from: 'production', to: 'storage' },
				totalSourceVolume: 100,
				totalDestVolume: 100,
				sourcePG: 80,
				destPG: 80,
				sources: [{ vessel: 'a', volume: 100, proof: 80 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 80 }],
			}),
		];
		const report = buildFormReport('5110.40', '2026-05', transfers);

		const produced = report.lines.find(l => l.lineCode === 'produced');
		expect(produced!.wineGallons).toBe(1000);  // 600 + 400
		expect(produced!.transferIds).toEqual(['t1', 't2']);

		const transferred = report.lines.find(l => l.lineCode === 'transferred_to_storage');
		expect(transferred!.wineGallons).toBe(100);
		expect(transferred!.proofGallons).toBe(80);

		expect(report.totals.inflowsWG).toBe(1000);
		expect(report.totals.outflowsWG).toBe(100);
		expect(report.transferCount).toBe(3);
	});

	it('excludes reversed and reversal transfers from totals', () => {
		const transfers = [
			makeTransfer({
				_id: 't1',
				status: 'committed',
				ttbAccount: { from: null, to: 'production' },
				totalDestVolume: 600,
			}),
			makeTransfer({
				_id: 't2',
				status: 'reversed',  // ← excluded
				ttbAccount: { from: null, to: 'production' },
				totalDestVolume: 100,
			}),
			makeTransfer({
				_id: 't3',
				type: 'reversal',  // ← excluded
				reverses: 't2',
				ttbAccount: { from: 'production', to: null },
				totalSourceVolume: 100,
			}),
		];
		const report = buildFormReport('5110.40', '2026-05', transfers);
		const produced = report.lines.find(l => l.lineCode === 'produced');
		expect(produced!.wineGallons).toBe(600);
		expect(produced!.transferIds).toEqual(['t1']);
	});

	it('returns empty report when no transfers in period', () => {
		const report = buildFormReport('5110.40', '2026-05', []);
		expect(report.lines).toEqual([]);
		expect(report.totals.inflowsWG).toBe(0);
		expect(report.totals.outflowsWG).toBe(0);
		expect(report.totals.lossesWG).toBe(0);
		expect(report.transferCount).toBe(0);
	});

	it('only includes lines for the requested form', () => {
		const transfers = [
			makeTransfer({
				_id: 't1',
				ttbAccount: { from: 'production', to: 'storage' },
				totalSourceVolume: 100,
				totalDestVolume: 100,
				sourcePG: 80,
				destPG: 80,
				sources: [{ vessel: 'a', volume: 100, proof: 80 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 80 }],
			}),
		];
		const report5040 = buildFormReport('5110.40', '2026-05', transfers);
		const report5011 = buildFormReport('5110.11', '2026-05', transfers);
		const report5028 = buildFormReport('5110.28', '2026-05', transfers);

		expect(report5040.lines.length).toBeGreaterThan(0);  // outflow from production
		expect(report5011.lines.length).toBeGreaterThan(0);  // inflow to storage
		expect(report5028.lines).toEqual([]);                 // processing untouched
	});
});

describe('buildFormReport — sort order', () => {
	it('orders lines: inflows → outflows → losses', () => {
		const transfers = [
			makeTransfer({
				_id: 'in',
				ttbAccount: { from: null, to: 'production' },
				totalDestVolume: 100,
			}),
			makeTransfer({
				_id: 'out',
				ttbAccount: { from: 'production', to: 'storage' },
				totalSourceVolume: 100,
				totalDestVolume: 100,
				sourcePG: 0,
				destPG: 0,
				sources: [{ vessel: 'a', volume: 100, proof: 0 }],
				destinations: [{ vessel: 'b', volume: 100, proof: 0 }],
			}),
			makeTransfer({
				_id: 'loss',
				type: 'destruction',
				ttbAccount: { from: 'production', to: null },
				totalSourceVolume: 5,
				totalLossVolume: 5,
				sourcePG: 0,
				lossPG: 0,
				loss: { volume: 5, proof: 0, reasonCode: 'spillage' },
			}),
		];
		const report = buildFormReport('5110.40', '2026-05', transfers);
		const directions = report.lines.map(l => l.direction);
		const firstOutflow = directions.indexOf('outflow');
		const firstLoss = directions.indexOf('loss');
		const lastInflow = directions.lastIndexOf('inflow');
		expect(lastInflow).toBeLessThan(firstOutflow);
		expect(firstOutflow).toBeLessThan(firstLoss);
	});
});
