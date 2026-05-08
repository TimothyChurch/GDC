import { d as defineEventHandler, ad as Settings, c as createError, ae as isH3Error } from '../../nitro/nitro.mjs';
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
    let settings = await Settings.findOne({}).lean();
    if (!settings) {
      settings = await new Settings({}).save().then((doc) => doc.toObject());
    }
    if (!settings) {
      throw createError({ status: 500, statusText: "Failed to initialize settings" });
    }
    if (settings.barrelAgeDefaults instanceof Map) {
      settings.barrelAgeDefaults = Object.fromEntries(settings.barrelAgeDefaults);
    }
    if (Array.isArray(settings.itemCategories) && settings.itemCategories.length > 0 && typeof settings.itemCategories[0] === "string") {
      const migrated = settings.itemCategories.map((cat) => ({
        key: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
        category: cat,
        icon: "i-lucide-box",
        description: ""
      }));
      await Settings.findByIdAndUpdate(settings._id, {
        $set: { itemCategories: migrated }
      });
      settings.itemCategories = migrated;
    }
    return settings;
  } catch (error) {
    if (isH3Error(error)) throw error;
    throw createError({ status: 500, statusText: "Failed to fetch settings" });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get15.mjs.map
