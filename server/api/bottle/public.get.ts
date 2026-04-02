export default defineCachedEventHandler(
  async () => {
    try {
      const bottles = await Bottle.find({ archived: { $ne: true } })
        .select('name class type abv price img description inStock')
        .sort({ name: 1 })
        .lean();

      return bottles;
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
