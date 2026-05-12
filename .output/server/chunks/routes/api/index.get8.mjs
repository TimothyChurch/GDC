import { d as defineEventHandler, $ as getQuery, I as Inventory, c as createError } from '../../nitro/nitro.mjs';
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
  try {
    const query = getQuery(event);
    const filter = {};
    if (query.item && typeof query.item === "string") {
      filter.item = query.item;
    }
    if (query.all === "true") {
    } else if (query.since && typeof query.since === "string") {
      const sinceDate = new Date(query.since);
      if (!isNaN(sinceDate.getTime())) {
        filter.date = { $gte: sinceDate };
      }
    } else {
      const days = parseInt(query.days, 10);
      const lookbackDays = days > 0 ? days : 90;
      const cutoff = /* @__PURE__ */ new Date();
      cutoff.setDate(cutoff.getDate() - lookbackDays);
      filter.date = { $gte: cutoff };
    }
    return await Inventory.find(filter).sort({ date: -1 }).lean();
  } catch (error) {
    throw createError({ status: 500, statusText: "Failed to fetch inventory" });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get8.mjs.map
