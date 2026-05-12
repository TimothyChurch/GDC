export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, batchCreateSchema);

  // Copy recipe.grainIn → stages.mashing.grainIn at creation so the batch
  // remembers the recipe's setting at the moment it was started. Allows the
  // operator to flip it per-batch without affecting the recipe template.
  if (sanitized.recipe) {
    try {
      const recipeDoc: any = await Recipe.findById(sanitized.recipe).select("grainIn").lean();
      if (recipeDoc) {
        if (!sanitized.stages) sanitized.stages = {};
        if (!sanitized.stages.mashing) sanitized.stages.mashing = {};
        if (typeof sanitized.stages.mashing.grainIn !== "boolean") {
          sanitized.stages.mashing.grainIn = !!recipeDoc.grainIn;
        }
      }
    } catch {
      // Non-fatal — if the lookup fails the batch will still be created
      // without an explicit grainIn flag and the projection will fall back
      // to the recipe at calculation time.
    }
  }

  // Add initial log entry
  if (!sanitized.log) sanitized.log = [];
  sanitized.log.push({
    date: new Date(),
    action: "Batch created",
    details: `Pipeline: ${sanitized.pipeline?.join(" → ")}`,
  });

  try {
    const newBatch = new Batch(sanitized);
    await newBatch.save();
    return newBatch;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to create batch",
    });
  }
});
