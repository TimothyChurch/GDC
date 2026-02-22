export default defineEventHandler(async () => {
  try {
    const events = await Event.find().populate("contact").sort({ date: -1 }).lean();
    return events;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch events",
    });
  }
});
