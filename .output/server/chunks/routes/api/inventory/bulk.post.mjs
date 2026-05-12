import { d as defineEventHandler, a as readBody, c as createError, s as sanitize, v as validateBody, I as Inventory, _ as inventoryCreateSchema } from '../../../nitro/nitro.mjs';
import mongoose from 'mongoose';
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

const bulk_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!Array.isArray(body)) {
    throw createError({
      status: 400,
      statusText: "Request body must be an array of inventory records"
    });
  }
  if (body.length === 0) {
    return [];
  }
  if (body.length > 100) {
    throw createError({
      status: 400,
      statusText: "Cannot create more than 100 inventory records at once"
    });
  }
  const records = [];
  for (const entry of body) {
    const sanitized = sanitize(entry);
    await validateBody(sanitized, inventoryCreateSchema);
    if (!sanitized.location) delete sanitized.location;
    records.push(sanitized);
  }
  const session = await mongoose.startSession();
  try {
    let inserted = [];
    await session.withTransaction(async () => {
      inserted = await Inventory.insertMany(records, { session, ordered: true });
    });
    return inserted;
  } catch (error) {
    console.error("[inventory/bulk]", error);
    throw createError({
      status: 500,
      statusText: "Failed to create bulk inventory records"
    });
  } finally {
    await session.endSession();
  }
});

export { bulk_post as default };
//# sourceMappingURL=bulk.post.mjs.map
