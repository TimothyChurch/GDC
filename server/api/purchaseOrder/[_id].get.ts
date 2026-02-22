export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const po = await PurchaseOrder.findOne({ _id: id }).lean();
    if (!po) {
      throw createError({ statusCode: 404, statusMessage: 'Purchase order not found' });
    }
    return po;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch purchase order' });
  }
});
