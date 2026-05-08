export default defineEventHandler(async () => {
  try {
    const now = new Date();
    const events = await GDCEvent.find({
      status: "Confirmed",
      isPublic: true,
      date: { $gte: now },
    })
      .select("date type capacity groupSize isPublic price addOns")
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
