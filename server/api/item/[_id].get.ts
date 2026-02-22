export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const item = await Item.findOne({ _id: id }).lean();
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Item not found' });
    }
    return item;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch item' });
  }
});
