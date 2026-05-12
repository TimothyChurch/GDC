import { d as defineEventHandler, k as requireRole, av as getCloudinary, m as getRouterParam, c as createError, $ as getQuery } from '../../../nitro/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  await requireRole(event, "Admin", "Manager", "Staff");
  const cloudinary = getCloudinary(event);
  const publicId = getRouterParam(event, "id");
  if (!publicId) {
    throw createError({ status: 400, statusText: "Public ID required" });
  }
  const query = getQuery(event);
  const fullId = query.fullId || publicId;
  if (!fullId.startsWith("gdc/")) {
    throw createError({ status: 400, statusText: "Invalid asset ID" });
  }
  try {
    const result = await cloudinary.uploader.destroy(fullId);
    return { success: result.result === "ok", result: result.result };
  } catch {
    throw createError({ status: 500, statusText: "Delete failed" });
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
