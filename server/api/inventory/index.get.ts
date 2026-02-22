export default defineEventHandler(async (event) => {
  try {
    return await Inventory.find({}).lean();
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch inventory' });
  }
});
