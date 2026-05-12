import type { Batch, BatchStages } from '~/types';

/**
 * Type-safe accessor for a batch's stage data. Eliminates the
 * `(batch.stages as any).X` cast pattern that was scattered across components
 * and reports.
 *
 * Static usage — return type narrowed to the matching stage interface:
 *   const m = getStage(batch, 'mashing'); // MashingStage | undefined
 *
 * Dynamic usage with a runtime stage key (e.g. from STAGE_KEY_MAP) — return
 * type is the union of all stage shapes:
 *   const ferm = getStage(batch, STAGE_KEY_MAP['Fermenting']);
 *
 * Both `null` and `undefined` batch inputs return `undefined` so callers can
 * use the result with optional chaining safely.
 */
export function getStage<K extends keyof BatchStages>(
	batch: Pick<Batch, 'stages'> | null | undefined,
	stage: K,
): BatchStages[K];
export function getStage(
	batch: Pick<Batch, 'stages'> | null | undefined,
	stage: string,
): BatchStages[string];
export function getStage(
	batch: Pick<Batch, 'stages'> | null | undefined,
	stage: string,
): unknown {
	if (!batch?.stages) return undefined;
	return batch.stages[stage as keyof BatchStages];
}
