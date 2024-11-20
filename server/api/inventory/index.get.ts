export default defineEventHandler(async (event) => {
  try {
    return await Inventory.find({});
  } catch (error) {
    return error;
  }
});
