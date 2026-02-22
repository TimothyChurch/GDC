export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const found = await Event.findById(id).populate("contact").lean();
    if (!found) {
      throw createError({
        statusCode: 404,
        statusMessage: "Event not found",
      });
    }
    return found;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch event",
    });
  }
});
