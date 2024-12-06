import { Batch } from "~/server/models/batch.schema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const newBatch = new Batch(body);
    await newBatch.save();
    return newBatch;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Server error occurred while creating a new batch.",
    });
  }
});
