export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  const body = await readBody(event);
  await validateBody(body, eventUpdateSchema);
  const sanitized = sanitize(body);
  try {
    const updated = await Event.findByIdAndUpdate(id, sanitized, {
      new: true,
    }).populate("contact");
    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: "Event not found",
      });
    }
    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update event",
    });
  }
});
