import { f as createDeleteHandler, h as Batch, R as Recipe } from '../../../nitro/nitro.mjs';
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

const __id__delete = createDeleteHandler(Recipe, {
  referenceChecks: [
    { model: Batch, field: "recipe", label: "batch(es)" }
  ]
});

export { __id__delete as default };
//# sourceMappingURL=__id_.delete.mjs.map
