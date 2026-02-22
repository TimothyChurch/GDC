export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;
    const recipe = await Recipe.findOne({ _id: id }).lean();
    if (!recipe) {
      throw createError({ statusCode: 404, statusMessage: 'Recipe not found' });
    }
    return recipe;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch recipe' });
  }
});
