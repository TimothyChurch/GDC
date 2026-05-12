import { d as defineEventHandler, c as createError, a as readBody, s as sanitize, v as validateBody, V as Vessel, az as vesselUpdateSchema } from '../../../nitro/nitro.mjs';
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

const TRANSFER_OWNED_FIELDS = ["contents", "current", "contentsVersion"];
const _id__put = defineEventHandler(async (event) => {
  var _a;
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!id) throw createError({ status: 400, statusText: "Vessel ID is required" });
  const body = await readBody(event);
  const sanitized = sanitize(body);
  for (const field of TRANSFER_OWNED_FIELDS) {
    if (field in sanitized) {
      throw createError({
        status: 409,
        statusText: "USE_TRANSFER_ENDPOINT",
        data: {
          code: "USE_TRANSFER_ENDPOINT",
          message: `Field "${field}" is managed by the Transfer Engine. Use POST /api/transfer/create instead.`,
          field
        }
      });
    }
  }
  await validateBody(sanitized, vesselUpdateSchema);
  try {
    const updated = await Vessel.findByIdAndUpdate(id, sanitized, { new: true });
    if (!updated) {
      throw createError({ status: 404, statusText: "Vessel not found" });
    }
    return updated;
  } catch (error) {
    if ((error == null ? void 0 : error.statusCode) || (error == null ? void 0 : error.status)) throw error;
    console.error("Failed to update vessel:", error);
    throw createError({ status: 500, statusText: "Failed to update vessel" });
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
