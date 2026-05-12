import { d as defineEventHandler, c as createError, l as validateObjectId, a as readBody, s as sanitize, v as validateBody, R as Recipe, a8 as computeRecipeProjection, a9 as recipeUpdateSchema } from '../../../nitro/nitro.mjs';
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

const __id__put = defineEventHandler(async (event) => {
  var _a;
  const id = (_a = event.context.params) == null ? void 0 : _a._id;
  if (!id) {
    throw createError({ status: 400, statusText: "Missing recipe ID" });
  }
  validateObjectId(id, "recipe ID");
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, recipeUpdateSchema);
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
      statusText: "Failed to update recipe"
    });
  }
});

export { __id__put as default };
//# sourceMappingURL=__id_.put.mjs.map
