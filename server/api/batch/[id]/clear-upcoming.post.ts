import { Batch } from '~/server/models/batch.schema';

/**
 * POST /api/batch/[id]/clear-upcoming
 *
 * One-off cleanup: removes a stuck `stageVolumes.Upcoming` entry.
 *
 * Why this exists: batches advanced under a pre-fix engine kept their planned
 * Upcoming volume after transitioning to Mashing — the engine only decremented
 * `stageVolumes[fromStage]` when there was a physical source vessel, and
 * "Upcoming → first stage" is a sourceless initial entry. The engine has been
 * patched (server/utils/transferEngine.ts) so new transfers handle this; this
 * endpoint exists to fix the small set of batches that already got stuck.
 *
 * Admin-only. Safe to run repeatedly (no-op if Upcoming is already absent).
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const id = validateObjectId(getRouterParam(event, 'id'), 'batch id');

	const batch = await Batch.findById(id);
	if (!batch) {
		throw createError({ status: 404, statusText: 'Batch not found' });
	}

	const stageVolumes = (batch.stageVolumes as unknown) as Map<string, number> | undefined;
	const previous = stageVolumes?.get('Upcoming') ?? 0;

	if (stageVolumes?.has('Upcoming')) {
		stageVolumes.delete('Upcoming');
	}
	const stageProofs = ((batch as any).stageProofs as unknown) as Map<string, number> | undefined;
	stageProofs?.delete('Upcoming');

	await batch.save();

	return {
		ok: true,
		batchId: id,
		clearedVolume: previous,
		remainingStages: stageVolumes ? Array.from(stageVolumes.keys()) : [],
	};
});
