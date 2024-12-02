export default defineEventHandler(async (event) => {
  try {
    return await Item.find({});
  } catch (error) {
    return error;
  }
});
