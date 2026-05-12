import type { Batch, DistillingRun } from '~/types';
import { calculateProofGallons } from '~/utils/proofGallons';

/**
 * Recompute the lowWines stage totals from all stripping-run outputs.
 *
 * Low wines is the accumulation of every stripping run: volumes sum, ABV is
 * volume-weighted, proof gallons are derived from the totals. Mutates the
 * batch's `stages.lowWines` slot in place.
 *
 * Pure-ish: only depends on `target.stages.strippingRun.runs`. Lifted out of
 * `useBatchStore` so it can be unit-tested without mounting Pinia.
 */
export function recomputeLowWines(target: Batch): void {
	const runs = target.stages?.strippingRun?.runs || [];
	const runsWithOutput = runs.filter(
		(r: DistillingRun) => (r.output?.volume || r.total?.volume || 0) > 0,
	);

	if (!target.stages.lowWines) target.stages.lowWines = {};
	const lw = target.stages.lowWines as Record<string, unknown>;

	if (runsWithOutput.length === 0) {
		lw.volume = 0;
		lw.abv = 0;
		lw.proofGallons = 0;
		lw.sourceRuns = runs.length;
		return;
	}

	const totalVol = runsWithOutput.reduce(
		(s: number, r: DistillingRun) =>
			s + (r.output?.volume || r.total?.volume || 0),
		0,
	);
	const weightedAbv = runsWithOutput.reduce((s: number, r: DistillingRun) => {
		const vol = r.output?.volume || r.total?.volume || 0;
		const abv = r.output?.abv || r.total?.abv || 0;
		return s + vol * abv;
	}, 0);
	const avgAbv = totalVol > 0 ? weightedAbv / totalVol : 0;

	const firstWithOutput = runsWithOutput[0]!;
	lw.volume = totalVol;
	lw.volumeUnit =
		firstWithOutput.output?.volumeUnit
		|| firstWithOutput.total?.volumeUnit
		|| (lw.volumeUnit as string)
		|| 'gallon';
	lw.abv = avgAbv;
	lw.proofGallons =
		totalVol > 0 && avgAbv > 0
			? calculateProofGallons(totalVol, lw.volumeUnit as string, avgAbv)
			: 0;
	lw.sourceRuns = runs.length;
}
