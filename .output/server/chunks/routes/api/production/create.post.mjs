import { d as defineEventHandler, r as readBody, s as sanitize, v as validateBody, P as Production, c as createError, a2 as productionCreateSchema } from '../../../nitro/nitro.mjs';
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
  await validateBody(sanitized, productionCreateSchema);
  if (!sanitized._id) delete sanitized._id;
  if (sanitized.bottling) {
    for (const key of ["glassware", "cap", "label"]) {
      if (!sanitized.bottling[key]) delete sanitized.bottling[key];
    }
  }
  try {
    const doc = new Production(sanitized);
    await doc.save();
    return doc;
  } catch (error) {
    const details = (error == null ? void 0 : error.errors) ? Object.entries(error.errors).map(([k, v]) => `${k}: ${v.message}`).join("; ") : (error == null ? void 0 : error.message) || String(error);
    console.error("Failed to create production:", details);
    throw createError({ status: 500, statusText: `Failed to create production: ${details}` });
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
