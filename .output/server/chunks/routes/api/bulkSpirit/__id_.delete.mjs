import { b as createDeleteHandler, B as BulkSpirit, c as createError } from '../../../nitro/nitro.mjs';
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

const __id__delete = createDeleteHandler(BulkSpirit, {
  preDelete: async (id) => {
    const doc = await BulkSpirit.findById(id);
    if (doc && doc.volume > 0) {
      throw createError({
        status: 400,
        statusText: "Cannot delete: bulk spirit still has volume. Deplete it first."
      });
    }
  }
});

export { __id__delete as default };
//# sourceMappingURL=__id_.delete.mjs.map
