// `reverseTransfer` and `TransferEngineError` are auto-imported from server/utils/.

/**
 * POST /api/transfer/[id]/reverse
 *
 * Create an inverse Transfer that undoes the original. The original transfer
 * is marked `status: 'reversed'`; both transfers remain in the audit log.
 *
 * The reversal is recorded against the CURRENT reporting period (not the
 * original's period) — matches TTB recordkeeping practice for corrections.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin');

	const id = event.context.params?.id;
	if (!id) {
		throw createError({ status: 400, statusText: 'Transfer ID is required' });
	}

	const body = await readBody(event).catch(() => ({}));
	const sanitized = sanitize(body || {});
	await validateBody(sanitized, transferReverseSchema);

	const session = await getAuthSession(event);
	const createdBy: { user?: string; name?: string } = {
		user: session.data.userId,
		name: session.data.email,
	};

	try {
		const result = await reverseTransfer(id, {
			createdBy,
			reverseNotes: sanitized?.notes,
		});
		return result;
	} catch (error: any) {
		if (error instanceof TransferEngineError) {
			throw createError({
				status: error.status,
				statusText: error.message,
				data: { code: error.code, details: error.details },
			});
		}
		console.error('Reverse transfer failed:', error);
		throw createError({
			status: 500,
			statusText: 'Failed to reverse transfer',
			data: { message: error?.message },
		});
	}
});
