/**
 * PUT /api/vessel/[id]
 *
 * Generic vessel update for fields safe to edit directly (name, location, status, etc.).
 *
 * GUARD: rejects any payload that mutates `contents`, `current`, or
 * `contentsVersion`. Those fields are owned by the Transfer Engine; mutating
 * them directly bypasses atomicity and audit. Callers should use
 * `POST /api/transfer/create` instead.
 *
 * Phase 2 of PLAN-PIPELINE-REVAMP.md.
 */

const TRANSFER_OWNED_FIELDS = ['contents', 'current', 'contentsVersion'] as const;

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	if (!id) throw createError({ status: 400, statusText: 'Vessel ID is required' });

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

	await validateBody(sanitized, vesselUpdateSchema);

	try {
		const updated = await Vessel.findByIdAndUpdate(id, sanitized, { new: true });
		if (!updated) {
			throw createError({ status: 404, statusText: 'Vessel not found' });
		}
		return updated;
	} catch (error: any) {
		if (error?.statusCode || error?.status) throw error;
		console.error('Failed to update vessel:', error);
		throw createError({ status: 500, statusText: 'Failed to update vessel' });
	}
});
