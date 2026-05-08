import { d as defineEventHandler, r as rateLimit, a as readBody, s as sanitize, v as validateBody, H as GDCContact, M as Message, c as createError, L as contactInquirySchema } from '../../../nitro/nitro.mjs';
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

const inquiry_post = defineEventHandler(async (event) => {
  rateLimit(event, {
    key: "contact:inquiry",
    limit: 5,
    windowMs: 60 * 60 * 1e3,
    message: "Too many submissions. Please try again later."
  });
  const body = await readBody(event);
  if (body == null ? void 0 : body.website) {
    return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
  }
  if ((body == null ? void 0 : body._t) && Date.now() - Number(body._t) < 3e3) {
    return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
  }
  const { website: _hp, _t, ...cleanBody } = body || {};
  const sanitized = sanitize(cleanBody);
  const validated = await validateBody(sanitized, contactInquirySchema);
  try {
    let contactId;
    const existing = await GDCContact.findOne({ email: validated.email });
    if (existing) {
      contactId = existing._id.toString();
      const notePrefix = `[${validated.topic}] `;
      const existingNotes = existing.notes || "";
      const newNote = notePrefix + validated.message;
      const updatedNotes = existingNotes ? `${newNote}
---
${existingNotes}` : newNote;
      await GDCContact.findByIdAndUpdate(existing._id, {
        notes: updatedNotes,
        firstName: validated.firstName || existing.firstName,
        lastName: validated.lastName || existing.lastName,
        phone: validated.phone || existing.phone
      });
    } else {
      const newContact = await GDCContact.create({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone || void 0,
        type: "Inquiry",
        notes: `[${validated.topic}] ${validated.message}`
      });
      contactId = newContact._id.toString();
    }
    await Message.create({
      contact: contactId,
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone || void 0,
      topic: validated.topic,
      message: validated.message
    });
    return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
  } catch (error) {
    throw createError({ status: 500, statusText: "Failed to submit inquiry" });
  }
});

export { inquiry_post as default };
//# sourceMappingURL=inquiry.post.mjs.map
