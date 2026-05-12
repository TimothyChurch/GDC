import { d as defineEventHandler, $ as getQuery, l as validateObjectId, ap as Transfer, c as createError } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter = {};
  if (query.batch) {
    const id = validateObjectId(String(query.batch), "batch");
    filter.batch = id;
  }
  if (query.vessel) {
    const id = validateObjectId(String(query.vessel), "vessel");
    filter.$or = [{ "sources.vessel": id }, { "destinations.vessel": id }];
  }
  if (query.period) {
    filter.reportingPeriod = String(query.period);
  }
  if (query.type) {
    filter.type = String(query.type);
  }
  if (query.status) {
    filter.status = String(query.status);
  }
  const requestedLimit = Number(query.limit) || 100;
  const limit = Math.min(Math.max(requestedLimit, 1), 1e3);
  try {
    return await Transfer.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  } catch (error) {
    console.error("Failed to list transfers:", error);
    throw createError({ status: 500, statusText: "Failed to list transfers" });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get16.mjs.map
