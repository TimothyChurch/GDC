/**
 * PUT /api/batch/[id]
 *
 * Generic batch update for fields safe to edit directly (notes, batchCost, etc.).
 *
 * GUARD: rejects any payload that mutates `stageVolumes`, `stageProofs`, or
 * `transferLog`. Those fields are owned by the Transfer Engine; mutating them
 * directly bypasses atomicity, period-locking, and audit. Callers should use
 * `POST /api/transfer/create` instead.
 *
 * Phase 2 of PLAN-PIPELINE-REVAMP.md.
 */

const TRANSFER_OWNED_FIELDS = ['stageVolumes', 'stageProofs', 'transferLog'] as const;

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	if (!id) throw createError({ status: 400, statusText: 'Batch ID is required' });

	const body = await readBody(event);
	const sanitized = sanitize(body);

	for (const field of TRANSFER_OWNED_FIELDS) {
		if (field in sanitized) {
			throw createError({
				status: 409,
				statusText: 'USE_TRANSFER_ENDPOINT',
				data: {
					code: 'USE_TRANSFER_ENDPOINT',
					message: `Field "${field}" is managed by the Transfer Engine. Use POST /api/transfer/create instead.`,
					field,
				},
			});
		}
	}

	await validateBody(sanitized, batchUpdateSchema);

	try {
		const updated = await Batch.findByIdAndUpdate(id, sanitized, { new: true });
		if (!updated) {
			throw createError({ status: 404, statusText: 'Batch not found' });
		}
		return updated;
	} catch (error: any) {
		if (error?.statusCode || error?.status) throw error;
		console.error('Failed to update batch:', error);
		throw createError({ status: 500, statusText: 'Failed to update batch' });
	}
});
