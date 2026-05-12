import { d as defineEventHandler, K as GDCEvent, c as createError } from '../../../nitro/nitro.mjs';
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

const upcoming_get = defineEventHandler(async () => {
  try {
    const now = /* @__PURE__ */ new Date();
    const events = await GDCEvent.find({
      status: "Confirmed",
      isPublic: true,
      date: { $gte: now }
    }).select("date type capacity groupSize isPublic price addOns").sort({ date: 1 }).lean();
    return events;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to fetch upcoming events"
    });
  }
});

export { upcoming_get as default };
//# sourceMappingURL=upcoming.get.mjs.map
