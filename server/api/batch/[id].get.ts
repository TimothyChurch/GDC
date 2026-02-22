import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const batch = await Batch.findById(id).lean();
    if (!batch) {
      throw createError({ statusCode: 404, statusMessage: 'Batch not found' });
    }
    return batch;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error occurred while fetching the batch.',
    });
  }
});
