import { d as defineEventHandler, k as requireRole, r as readBody, s as sanitize, v as validateBody, U as User, c as createError, ai as userUpdateSchema } from '../../../nitro/nitro.mjs';
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

const __id__put = defineEventHandler(async (event) => {
  var _a;
  await requireRole(event, "Admin");
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, userUpdateSchema);
  try {
    if (sanitized.password) {
      sanitized.password = await bcrypt.hash(sanitized.password, 10);
    }
    const user = await User.findOneAndUpdate(
      { _id: (_a = event.context.params) == null ? void 0 : _a._id },
      sanitized,
      { new: true }
    );
    if (!user) {
      throw createError({
        status: 404,
        statusText: "User not found"
      });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  } catch (error) {
    if (error == null ? void 0 : error.status) throw error;
    throw createError({
      status: 500,
      statusText: "Failed to update user"
    });
  }
});

export { __id__put as default };
//# sourceMappingURL=__id_.put.mjs.map
