import { d as defineEventHandler, k as requireRole, r as readBody, s as sanitize, v as validateBody, a7 as Settings, c as createError, a8 as isH3Error, a9 as settingsUpdateSchema } from '../../nitro/nitro.mjs';
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

const index_put = defineEventHandler(async (event) => {
  await requireRole(event, "Admin");
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, settingsUpdateSchema);
  try {
    const updated = await Settings.findOneAndUpdate(
      {},
      { $set: sanitized },
      { new: true, upsert: true, lean: true }
    );
    if (!updated) {
      throw createError({ status: 500, statusText: "Failed to update settings" });
    }
    if (updated.barrelAgeDefaults instanceof Map) {
      updated.barrelAgeDefaults = Object.fromEntries(updated.barrelAgeDefaults);
    }
    return updated;
  } catch (error) {
    if (isH3Error(error)) throw error;
    throw createError({ status: 500, statusText: "Failed to update settings" });
  }
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
