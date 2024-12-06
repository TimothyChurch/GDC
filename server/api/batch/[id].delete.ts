import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const deletedBatch = await Batch.findByIdAndDelete(id);
    if (!deletedBatch) {
      throw createError({
        statusCode: 404,
        statusMessage: "Batch not found",
      });
    }
    return { message: "Batch deleted successfully" };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Server error occurred while deleting the batch.",
    });
  }
});
