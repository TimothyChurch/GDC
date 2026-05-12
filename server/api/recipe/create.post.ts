import { getDefaultGrainInForClass } from "../../../utils/grainBill";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, recipeCreateSchema);

  // Prefill grain-in from the recipe's class when not explicitly provided.
  // Whisky/Bourbon/Rye/Moonshine → true; everything else → false.
  if (typeof sanitized.grainIn !== "boolean") {
    sanitized.grainIn = getDefaultGrainInForClass(sanitized.class);
  }

  // Compute projection snapshot from grain bill + settings defaults
  const projection = await computeRecipeProjection(sanitized);
  Object.assign(sanitized, projection);

  try {
    const recipe = new Recipe(sanitized);
    await recipe.save();
    return recipe;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to create recipe",
    });
  }
});
