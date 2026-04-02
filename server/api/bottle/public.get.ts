export default defineCachedEventHandler(
  async () => {
    try {
      const bottles = await Bottle.find({ archived: { $ne: true } })
        .select('name class type abv price img description inStock')
        .sort({ name: 1 })
        .lean();

      // Compute inStock from actual inventory data instead of relying on stale boolean
      const bottleIds = bottles.map((b) => b._id);
      const latestInventory = await Inventory.aggregate([
        { $match: { item: { $in: bottleIds } } },
        { $sort: { date: -1 } },
        { $group: { _id: '$item', quantity: { $first: '$quantity' } } },
      ]);
      const stockMap = new Map(
        latestInventory.map((rec: { _id: string; quantity: number }) => [
          rec._id.toString(),
          rec.quantity > 0,
        ]),
      );

      return bottles.map((b) => ({
        ...b,
        inStock: stockMap.has(b._id.toString())
          ? stockMap.get(b._id.toString())
          : b.inStock ?? false,
      }));
    } catch {
      throw createError({
        status: 500,
        statusText: 'Failed to fetch public bottles',
      });
    }
  },
  {
    name: 'public-bottles',
    maxAge: 300,
    getKey: () => 'all',
  }
);
