export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;

    // Check for references in Recipe ingredients
    const recipeRefs = await Recipe.countDocuments({ 'items.item': id });
    if (recipeRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${recipeRefs} recipe(s) use this item as an ingredient`,
      });
    }

    // Check for references in Purchase Order items
    const poRefs = await PurchaseOrder.countDocuments({ 'items.item': id });
    if (poRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${poRefs} purchase order(s) reference this item`,
      });
    }

    // Check for references in Cocktail ingredients
    const cocktailRefs = await Cocktail.countDocuments({ 'ingredients.item': id });
    if (cocktailRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${cocktailRefs} cocktail(s) use this item as an ingredient`,
      });
    }

    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found',
      });
    }
    return { message: 'Item deleted successfully' };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete item',
    });
  }
});
