export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    // Check if vessel has contents
    const vessel = await Vessel.findById(id);
    if (!vessel) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vessel not found',
      });
    }

    if (vessel.contents && vessel.contents.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete: vessel still has contents. Empty it first.',
      });
    }

    await Vessel.findByIdAndDelete(id);
    return { message: 'Vessel deleted successfully' };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete vessel',
    });
  }
});
