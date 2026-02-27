export default createDeleteHandler(Vessel, {
  preDelete: async (id) => {
    const vessel = await Vessel.findById(id);
    if (vessel?.contents && vessel.contents.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete: vessel still has contents. Empty it first.",
      });
    }
  },
});
