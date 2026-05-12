import { d as defineEventHandler, l as validateObjectId, I as Inventory, c as createError } from '../../../../nitro/nitro.mjs';
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

const _item__get = defineEventHandler(async (event) => {
  var _a;
  const itemId = validateObjectId((_a = event.context.params) == null ? void 0 : _a.item, "Item");
  try {
    return await Inventory.find({ item: itemId }).lean();
  } catch (error) {
    throw createError({ status: 500, statusText: "Failed to fetch inventory by item" });
  }
});

export { _item__get as default };
//# sourceMappingURL=_item_.get.mjs.map
