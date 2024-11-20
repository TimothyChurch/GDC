export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    return await new Inventory(body).save();
  } catch (error) {
    return error;
  }
});
