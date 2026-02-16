export default defineEventHandler(async () => {
  try {
    const now = new Date();
    const events = await Event.find({
      status: "Confirmed",
      date: { $gte: now },
    })
      .select("date type capacity groupSize")
      .sort({ date: 1 });
    return events;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch upcoming events",
    });
  }
});
