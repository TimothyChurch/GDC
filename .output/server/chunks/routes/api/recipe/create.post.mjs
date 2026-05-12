import { d as defineEventHandler, a as readBody, s as sanitize, v as validateBody, aa as getDefaultGrainInForClass, a8 as computeRecipeProjection, R as Recipe, c as createError, ab as recipeCreateSchema } from '../../../nitro/nitro.mjs';
import 'mongoose';
import 'yup';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'vue';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, recipeCreateSchema);
  if (typeof sanitized.grainIn !== "boolean") {
    sanitized.grainIn = getDefaultGrainInForClass(sanitized.class);
  }
  const projection = await computeRecipeProjection(sanitized);
  Object.assign(sanitized, projection);
  try {
    const recipe = new Recipe(sanitized);
    await recipe.save();
    return recipe;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to create recipe"
    });
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
