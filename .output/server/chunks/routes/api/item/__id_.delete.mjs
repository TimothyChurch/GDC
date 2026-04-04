import { b as createDeleteHandler, R as Recipe, A as PurchaseOrder, C as Cocktail, P as Production, z as Item } from '../../../nitro/nitro.mjs';
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

const __id__delete = createDeleteHandler(Item, {
  referenceChecks: [
    { model: Recipe, field: "items._id", label: "recipe(s)" },
    { model: PurchaseOrder, field: "items.item", label: "purchase order(s)" },
    { model: Cocktail, field: "ingredients.item", label: "cocktail(s)" },
    { model: Production, field: "bottling.glassware", label: "production record(s) (glassware)" },
    { model: Production, field: "bottling.cap", label: "production record(s) (cap)" },
    { model: Production, field: "bottling.label", label: "production record(s) (label)" }
  ]
});

export { __id__delete as default };
//# sourceMappingURL=__id_.delete.mjs.map
