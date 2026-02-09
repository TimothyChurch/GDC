import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	try {
		const updatedBatch = await Batch.findByIdAndUpdate(id, sanitized, { new: true });
		if (!updatedBatch) {
			throw createError({
				statusCode: 404,
				statusMessage: "Batch not found",
			});
		}
		return updatedBatch;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Server error occurred while updating the batch.",
		});
	}
});
