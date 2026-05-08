import { o as createUpdateHandler, p as bottleUpdateSchema, n as Bottle } from '../../../nitro/nitro.mjs';
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

const __id__put = createUpdateHandler(Bottle, {
  schema: bottleUpdateSchema,
  nullableFields: ["recipe"]
});

export { __id__put as default };
//# sourceMappingURL=__id_.put.mjs.map
