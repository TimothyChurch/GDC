import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, batchCreateSchema);
	const sanitized = sanitize(body);

	// Add initial log entry
	if (!sanitized.log) sanitized.log = [];
	sanitized.log.push({
		date: new Date(),
		action: 'Batch created',
		details: `Pipeline: ${sanitized.pipeline?.join(' → ')}`,
	});

	try {
		const newBatch = new Batch(sanitized);
		await newBatch.save();
		return newBatch;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Server error occurred while creating a new batch.",
		});
	}
});
