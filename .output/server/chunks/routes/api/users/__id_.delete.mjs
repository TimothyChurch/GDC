import { d as defineEventHandler, k as requireRole, U as User, c as createError, a8 as isH3Error } from '../../../nitro/nitro.mjs';
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

const __id__delete = defineEventHandler(async (event) => {
  var _a;
  try {
    await requireRole(event, "Admin");
    const id = (_a = event.context.params) == null ? void 0 : _a._id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw createError({
        status: 404,
        statusText: "User not found"
      });
    }
    return { message: "User deleted successfully" };
  } catch (error) {
    if (isH3Error(error)) throw error;
    throw createError({
      status: 500,
      statusText: "Failed to delete user"
    });
  }
});

export { __id__delete as default };
//# sourceMappingURL=__id_.delete.mjs.map
