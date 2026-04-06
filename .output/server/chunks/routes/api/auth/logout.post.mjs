import { d as defineEventHandler, a as getAuthSession } from '../../../nitro/nitro.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  const session = await getAuthSession(event);
  await session.clear();
  return { success: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
