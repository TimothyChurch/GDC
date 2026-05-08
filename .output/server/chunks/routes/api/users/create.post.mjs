import { d as defineEventHandler, l as requireRole, a as readBody, v as validateBody, s as sanitize, U as User, c as createError, av as userCreateSchema } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
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

const create_post = defineEventHandler(async (event) => {
  await requireRole(event, "Admin");
  const body = await readBody(event);
  const validated = await validateBody(body, userCreateSchema);
  const sanitized = sanitize(validated);
  try {
    sanitized.password = await bcrypt.hash(sanitized.password, 10);
    const user = await new User(sanitized).save();
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to create user"
    });
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
