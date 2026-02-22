export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const record = await Inventory.findOne({ _id: id }).lean();
    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'Inventory record not found' });
    }
    return record;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch inventory record' });
  }
});
