export default defineEventHandler(async () => {
  try {
    const now = new Date();
    const events = await Event.find({
      status: "Confirmed",
      date: { $gte: now },
    })
      .select("date type capacity groupSize")
      .sort({ date: 1 })
      .lean();
    return events;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to fetch upcoming events",
    });
  }
});
