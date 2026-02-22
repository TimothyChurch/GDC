export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const bottle = await Bottle.findOne({ _id: id }).lean();
    if (!bottle) {
      throw createError({ statusCode: 404, statusMessage: 'Bottle not found' });
    }
    return bottle;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch bottle' });
  }
});
