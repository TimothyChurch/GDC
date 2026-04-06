import { h as createUpdateHandler, ak as vesselUpdateSchema, V as Vessel } from '../../../nitro/nitro.mjs';
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

const _id__put = createUpdateHandler(Vessel, {
  schema: vesselUpdateSchema
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
