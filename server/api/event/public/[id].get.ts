export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ status: 400, statusText: 'Event ID is required' });
  }

  const doc = await GDCEvent.findOne({
    _id: id,
    isPublic: true,
    status: 'Confirmed',
  })
    .select('date type capacity groupSize price addOns')
    .lean();

  if (!doc) {
    throw createError({ status: 404, statusText: 'Class not found' });
  }

  return doc;
});
