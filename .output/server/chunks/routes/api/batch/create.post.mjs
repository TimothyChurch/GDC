import { d as defineEventHandler, a as readBody, s as sanitize, v as validateBody, R as Recipe, h as Batch, c as createError, n as batchCreateSchema } from '../../../nitro/nitro.mjs';
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
  var _a;
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, batchCreateSchema);
  if (sanitized.recipe) {
    try {
      const recipeDoc = await Recipe.findById(sanitized.recipe).select("grainIn").lean();
      if (recipeDoc) {
        if (!sanitized.stages) sanitized.stages = {};
        if (!sanitized.stages.mashing) sanitized.stages.mashing = {};
        if (typeof sanitized.stages.mashing.grainIn !== "boolean") {
          sanitized.stages.mashing.grainIn = !!recipeDoc.grainIn;
        }
      }
    } catch {
    }
  }
  if (!sanitized.log) sanitized.log = [];
  sanitized.log.push({
    date: /* @__PURE__ */ new Date(),
    action: "Batch created",
    details: `Pipeline: ${(_a = sanitized.pipeline) == null ? void 0 : _a.join(" \u2192 ")}`
  });
  try {
    const newBatch = new Batch(sanitized);
    await newBatch.save();
    return newBatch;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to create batch"
    });
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
