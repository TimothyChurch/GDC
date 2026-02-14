export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?._id;

    // Check for references in Production records
    const prodRefs = await Production.countDocuments({ bottle: id });
    if (prodRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${prodRefs} production record(s) reference this bottle`,
      });
    }

    const deletedBottle = await Bottle.findByIdAndDelete(id);
    if (!deletedBottle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bottle not found',
      });
    }
    return { message: 'Bottle deleted successfully' };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete bottle',
    });
  }
});
