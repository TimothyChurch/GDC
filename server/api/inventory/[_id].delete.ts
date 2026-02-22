export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const deleted = await Inventory.findOneAndDelete({ _id: id });
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Inventory record not found' });
    }
    return { message: 'Inventory record deleted successfully' };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete inventory record' });
  }
});
