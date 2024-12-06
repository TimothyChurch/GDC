import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const body = await readBody(event);
    const updatedBatch = await Batch.findByIdAndUpdate(id, body, { new: true });
    if (!updatedBatch) {
      throw createError({
        statusCode: 404,
        statusMessage: "Batch not found",
      });
    }
    return updatedBatch;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Server error occurred while updating the batch.",
    });
  }
});
