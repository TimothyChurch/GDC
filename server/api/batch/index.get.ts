import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
  try {
    const batches = await Batch.find();
    return batches;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server error occurred while fetching batches.",
    });
  }
});
