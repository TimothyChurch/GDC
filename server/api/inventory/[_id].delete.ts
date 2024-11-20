export default defineEventHandler(async (event) => {
  try {
    return await Inventory.findOneAndDelete({ _id: event.context.params?._id });
  } catch (error) {
    return error;
  }
});
