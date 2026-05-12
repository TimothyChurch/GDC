import { x as createCreateHandler, G as cocktailCreateSchema, D as Cocktail } from '../../../nitro/nitro.mjs';
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

const create_post = createCreateHandler(Cocktail, {
  schema: cocktailCreateSchema
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
