import { d as defineEventHandler, S as getRouterParam, c as createError, D as Event } from '../../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ status: 400, statusText: "Event ID is required" });
  }
  const doc = await Event.findOne({
    _id: id,
    isPublic: true,
    status: "Confirmed"
  }).select("date type capacity groupSize price addOns").lean();
  if (!doc) {
    throw createError({ status: 404, statusText: "Class not found" });
  }
  return doc;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
