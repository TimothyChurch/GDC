import { d as defineEventHandler, r as readBody, s as sanitize, v as validateBody, F as Contact, c as createError, L as newsletterSubscribeSchema } from '../../../nitro/nitro.mjs';
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

const subscribe_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const validated = await validateBody(sanitized, newsletterSubscribeSchema);
  try {
    const existing = await Contact.findOne({ email: validated.email });
    if (existing) {
      await Contact.findByIdAndUpdate(existing._id, { newsletter: true, type: "Customer" });
      return { success: true, message: "You're now subscribed to our newsletter!" };
    }
    await Contact.create({
      email: validated.email,
      firstName: validated.firstName || void 0,
      lastName: validated.lastName || void 0,
      phone: validated.phone || void 0,
      type: "Customer",
      newsletter: true
    });
    return { success: true, message: "Thanks for subscribing!" };
  } catch (error) {
    throw createError({ status: 500, statusText: "Failed to subscribe" });
  }
});

export { subscribe_post as default };
//# sourceMappingURL=subscribe.post.mjs.map
