import { f as createDeleteHandler, P as Production, n as Bottle } from '../../../nitro/nitro.mjs';
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

const __id__delete = createDeleteHandler(Bottle, {
  referenceChecks: [
    { model: Production, field: "bottle", label: "production record(s)" }
  ]
});

export { __id__delete as default };
//# sourceMappingURL=__id_.delete.mjs.map
