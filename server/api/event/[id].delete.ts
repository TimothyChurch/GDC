export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: "Event not found",
      });
    }
    return { message: "Event deleted successfully" };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete event",
    });
  }
});
