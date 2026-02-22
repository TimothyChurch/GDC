import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, batchUpdateSchema);
	try {
		const updatedBatch = await Batch.findByIdAndUpdate(id, sanitized, { new: true });
		if (!updatedBatch) {
			throw createError({
				statusCode: 404,
				statusMessage: "Batch not found",
			});
		}
		return updatedBatch;
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: "Server error occurred while updating the batch.",
		});
	}
});
