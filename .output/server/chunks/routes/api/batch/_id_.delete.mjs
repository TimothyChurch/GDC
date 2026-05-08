import { f as createDeleteHandler, B as BulkSpirit, E as EquipmentLog, V as Vessel, h as Batch } from '../../../nitro/nitro.mjs';
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

const _id__delete = createDeleteHandler(Batch, {
  referenceChecks: [
    { model: BulkSpirit, field: "batch", label: "bulk spirit(s)" },
    { model: EquipmentLog, field: "batch", label: "equipment log(s)" },
    { model: Vessel, field: "contents.batch", label: "vessel(s)" }
  ]
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
