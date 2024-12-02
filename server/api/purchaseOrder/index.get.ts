export default defineEventHandler(async (event) => {
  try {
    return await PurchaseOrder.find({});
  } catch (error) {
    return error;
  }
});
