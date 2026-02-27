export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const filter: Record<string, any> = {};

    // Filter by specific item
    if (query.item && typeof query.item === "string") {
      filter.item = query.item;
    }

    // Date range: ?since=ISO_DATE or ?days=N (default: 90 days)
    // Pass ?all=true to bypass date filtering
    if (query.all === "true") {
      // No date filter
    } else if (query.since && typeof query.since === "string") {
      const sinceDate = new Date(query.since);
      if (!isNaN(sinceDate.getTime())) {
        filter.date = { $gte: sinceDate };
      }
    } else {
      const days = parseInt(query.days as string, 10);
      const lookbackDays = days > 0 ? days : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - lookbackDays);
      filter.date = { $gte: cutoff };
    }

    return await Inventory.find(filter).sort({ date: -1 }).lean();
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch inventory" });
  }
});
