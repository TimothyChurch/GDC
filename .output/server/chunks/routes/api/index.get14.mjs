import { d as defineEventHandler, a9 as ReportingPeriod, c as createError } from '../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async () => {
  try {
    return await ReportingPeriod.find({}).sort({ period: -1 }).lean();
  } catch (error) {
    console.error("Failed to list reporting periods:", error);
    throw createError({ status: 500, statusText: "Failed to list reporting periods" });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get14.mjs.map
