import { d as defineEventHandler, e as getAuthSession, c as createError, U as User } from '../../../nitro/nitro.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const session = await getAuthSession(event);
  if (!session.data.userId) {
    throw createError({ status: 401, statusText: "Not authenticated" });
  }
  const user = await User.findById(session.data.userId).select("-password").lean();
  if (!user) {
    await session.clear();
    throw createError({ status: 401, statusText: "User not found" });
  }
  return user;
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
