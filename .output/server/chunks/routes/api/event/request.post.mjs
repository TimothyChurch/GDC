import { d as defineEventHandler, r as readBody, v as validateBody, s as sanitize, F as Contact, D as Event, M as Message, c as createError, T as eventRequestSchema } from '../../../nitro/nitro.mjs';
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

const request_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validated = await validateBody(body, eventRequestSchema);
  const sanitized = sanitize(validated);
  try {
    let contact = await Contact.findOne({ email: sanitized.email });
    if (contact) {
      await Contact.findByIdAndUpdate(contact._id, {
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        ...sanitized.phone && { phone: sanitized.phone }
      });
    } else {
      contact = await Contact.create({
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        email: sanitized.email,
        phone: sanitized.phone || void 0,
        type: "Customer"
      });
    }
    await Event.create({
      date: sanitized.date,
      groupSize: sanitized.groupSize,
      contact: contact._id,
      type: sanitized.type,
      status: "Pending",
      notes: sanitized.notes || void 0
    });
    const formattedDate = new Date(sanitized.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    await Message.create({
      contact: contact._id,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      email: sanitized.email,
      phone: sanitized.phone || void 0,
      topic: "Private Class Request",
      message: `Private class requested for ${formattedDate} with ${sanitized.groupSize} guests.${sanitized.notes ? `
Notes: ${sanitized.notes}` : ""}`
    });
    return {
      success: true,
      message: "Your request has been submitted! We'll be in touch soon."
    };
  } catch (error) {
    throw createError({
      status: 500,
      statusText: "Failed to submit request"
    });
  }
});

export { request_post as default };
//# sourceMappingURL=request.post.mjs.map
