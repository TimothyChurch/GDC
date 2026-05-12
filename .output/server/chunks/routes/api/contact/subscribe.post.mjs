import { d as defineEventHandler, r as rateLimit, a as readBody, s as sanitize, v as validateBody, L as GDCContact, c as createError, S as newsletterSubscribeSchema } from '../../../nitro/nitro.mjs';
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
  rateLimit(event, {
    key: "contact:subscribe",
    limit: 5,
    windowMs: 15 * 60 * 1e3,
    message: "Too many subscription attempts. Please try again later."
  });
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const validated = await validateBody(sanitized, newsletterSubscribeSchema);
  try {
    const existing = await GDCContact.findOne({ email: validated.email });
    if (existing) {
      await GDCContact.findByIdAndUpdate(existing._id, { newsletter: true, type: "Customer" });
      return { success: true, message: "You're now subscribed to our newsletter!" };
    }
    await GDCContact.create({
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
