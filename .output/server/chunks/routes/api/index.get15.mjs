import { d as defineEventHandler, k as requireRole, U as User, c as createError } from '../../nitro/nitro.mjs';
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
  await requireRole(event, "Admin", "Manager");
  try {
    return await User.find({}).select("-password").lean();
  } catch (error) {
    throw createError({ status: 500, statusText: "Failed to fetch users" });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get15.mjs.map
