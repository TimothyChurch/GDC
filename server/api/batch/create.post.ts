import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, batchCreateSchema);
	const sanitized = sanitize(body);
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
