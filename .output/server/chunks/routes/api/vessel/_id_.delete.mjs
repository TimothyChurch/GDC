import { f as createDeleteHandler, V as Vessel, c as createError } from '../../../nitro/nitro.mjs';
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

const _id__delete = createDeleteHandler(Vessel, {
  preDelete: async (id) => {
    const vessel = await Vessel.findById(id);
    if ((vessel == null ? void 0 : vessel.contents) && vessel.contents.length > 0) {
      throw createError({
        status: 400,
        statusText: "Cannot delete: vessel still has contents. Empty it first."
      });
    }
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
