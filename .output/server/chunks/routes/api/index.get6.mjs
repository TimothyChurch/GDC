import { m as createGetAllHandler, E as EquipmentLog } from '../../nitro/nitro.mjs';
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

const index_get = createGetAllHandler(EquipmentLog, {
  sort: { timestamp: -1 },
  limit: 50
});

export { index_get as default };
//# sourceMappingURL=index.get6.mjs.map
