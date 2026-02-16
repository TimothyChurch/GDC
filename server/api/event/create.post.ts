export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await validateBody(body, eventCreateSchema);
  const sanitized = sanitize(body);
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
