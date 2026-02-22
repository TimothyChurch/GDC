export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, eventCreateSchema);
  try {
    const newEvent = new Event(sanitized);
    await newEvent.save();
    await newEvent.populate("contact");
    return newEvent;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create event",
    });
  }
});
