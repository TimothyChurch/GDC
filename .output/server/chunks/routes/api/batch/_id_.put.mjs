import { d as defineEventHandler, c as createError, a as readBody, s as sanitize, v as validateBody, h as Batch, j as batchUpdateSchema } from '../../../nitro/nitro.mjs';
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

const TRANSFER_OWNED_FIELDS = ["stageVolumes", "stageProofs", "transferLog"];
const _id__put = defineEventHandler(async (event) => {
  var _a;
  const id = (_a = event.context.params) == null ? void 0 : _a.id;
  if (!id) throw createError({ status: 400, statusText: "Batch ID is required" });
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
  await validateBody(sanitized, batchUpdateSchema);
  try {
    const updated = await Batch.findByIdAndUpdate(id, sanitized, { new: true });
    if (!updated) {
      throw createError({ status: 404, statusText: "Batch not found" });
    }
    return updated;
  } catch (error) {
    if ((error == null ? void 0 : error.statusCode) || (error == null ? void 0 : error.status)) throw error;
    console.error("Failed to update batch:", error);
    throw createError({ status: 500, statusText: "Failed to update batch" });
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
