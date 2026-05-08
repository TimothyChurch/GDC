import type { TransferInput } from '../../../types/interfaces/Transfer';
// `executeTransfer` and `TransferEngineError` are auto-imported from server/utils/.

/**
 * POST /api/transfer
 *
 * Create a new Transfer. Atomic: source vessel(s), destination vessel(s),
 * batch cache, and Transfer doc all commit together inside a MongoDB
 * transaction. Replaces the legacy multi-PUT flow.
 */
export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin', 'Manager');

	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, transferCreateSchema);

	const session = await getAuthSession(event);
	const createdBy: { user?: string; name?: string } = {
		user: session.data.userId,
		name: session.data.email,
	};

	try {
		const result = await executeTransfer(sanitized as TransferInput, { createdBy });
		return result;
	} catch (error: any) {
		if (error instanceof TransferEngineError) {
			throw createError({
				status: error.status,
				statusText: error.message,
				data: { code: error.code, details: error.details },
			});
		}
		console.error('Transfer engine failed:', error);
		throw createError({
			status: 500,
			statusText: 'Failed to execute transfer',
			data: { message: error?.message },
		});
	}
});
