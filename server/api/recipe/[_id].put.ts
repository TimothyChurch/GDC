export default defineEventHandler(async (event) => {
  const id = event.context.params?._id;
  if (!id) {
    throw createError({ status: 400, statusText: "Missing recipe ID" });
  }
  validateObjectId(id, "recipe ID");

  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, recipeUpdateSchema);

  // Recompute projection snapshot whenever recipe is updated. Merging the
  // submitted body onto the current doc lets us project even when the client
  // only sent partial fields.
  const current = await Recipe.findById(id).lean();
  if (!current) {
    throw createError({ status: 404, statusText: "Recipe not found" });
  }
  const merged = { ...current, ...sanitized };
  const projection = await computeRecipeProjection(merged);
  Object.assign(sanitized, projection);

  try {
    const updated = await Recipe.findByIdAndUpdate(id, sanitized, { new: true });
    if (!updated) {
      throw createError({ status: 404, statusText: "Recipe not found" });
    }
    return updated;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to update recipe",
    });
  }
});
