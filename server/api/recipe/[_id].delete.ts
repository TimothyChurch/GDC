export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;

    // Check for references in Batches
    const batchRefs = await Batch.countDocuments({ recipe: id });
    if (batchRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${batchRefs} batch(es) use this recipe`,
      });
    }

    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      throw createError({
        statusCode: 404,
        statusMessage: "Recipe not found",
      });
    }
    return { message: "Recipe deleted successfully" };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete recipe",
    });
  }
});
