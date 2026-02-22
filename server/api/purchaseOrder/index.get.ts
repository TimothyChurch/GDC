export default defineEventHandler(async (event) => {
  try {
    return await PurchaseOrder.find({}).lean();
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch purchase orders' });
  }
});
