export default createDeleteHandler(BulkSpirit, {
  preDelete: async (id) => {
    const doc = await BulkSpirit.findById(id);
    if (doc && (doc as any).volume > 0) {
      throw createError({
        status: 400,
        statusText: 'Cannot delete: bulk spirit still has volume. Deplete it first.',
      });
    }
  },
});
