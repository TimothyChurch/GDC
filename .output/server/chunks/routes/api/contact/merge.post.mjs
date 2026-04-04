import { d as defineEventHandler, r as readBody, s as sanitize, v as validateBody, c as createError, K as validateObjectId, F as Contact, D as Event, M as Message, A as PurchaseOrder } from '../../../nitro/nitro.mjs';
import * as yup from 'yup';
import 'mongoose';
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

const mergeSchema = yup.object({
  primaryId: yup.string().required("Primary contact ID is required"),
  duplicateId: yup.string().required("Duplicate contact ID is required")
});
const merge_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const { primaryId, duplicateId } = await validateBody(sanitized, mergeSchema);
  if (primaryId === duplicateId) {
    throw createError({ status: 400, statusText: "Cannot merge a contact with itself" });
  }
  validateObjectId(primaryId, "Primary contact");
  validateObjectId(duplicateId, "Duplicate contact");
  const [primary, duplicate] = await Promise.all([
    Contact.findById(primaryId),
    Contact.findById(duplicateId)
  ]);
  if (!primary) {
    throw createError({ status: 404, statusText: "Primary contact not found" });
  }
  if (!duplicate) {
    throw createError({ status: 404, statusText: "Duplicate contact not found" });
  }
  const fillableFields = [
    "firstName",
    "lastName",
    "businessName",
    "website",
    "address",
    "email",
    "phone",
    "city",
    "state",
    "zip",
    "notes"
  ];
  for (const field of fillableFields) {
    if (!primary[field] && duplicate[field]) {
      if (field === "notes" && primary.notes) {
        primary.notes = `${primary.notes}
${duplicate.notes}`;
      } else {
        primary[field] = duplicate[field];
      }
    }
  }
  if (duplicate.newsletter && !primary.newsletter) {
    primary.newsletter = true;
  }
  const [eventUpdates, bookingUpdates, messageUpdates, poUpdates] = await Promise.all([
    // Events where duplicate is the main contact
    Event.updateMany(
      { contact: duplicateId },
      { $set: { contact: primaryId } }
    ),
    // Event bookings where duplicate is the booking contact
    Event.updateMany(
      { "bookings.contact": duplicateId },
      { $set: { "bookings.$[elem].contact": primaryId } },
      { arrayFilters: [{ "elem.contact": duplicateId }] }
    ),
    // Messages referencing the duplicate
    Message.updateMany(
      { contact: duplicateId },
      { $set: { contact: primaryId } }
    ),
    // Purchase orders where duplicate is the vendor
    PurchaseOrder.updateMany(
      { vendor: duplicateId },
      { $set: { vendor: primaryId } }
    )
  ]);
  await primary.save();
  await Contact.findByIdAndDelete(duplicateId);
  return {
    merged: primary.toObject(),
    transferred: {
      events: eventUpdates.modifiedCount,
      bookings: bookingUpdates.modifiedCount,
      messages: messageUpdates.modifiedCount,
      purchaseOrders: poUpdates.modifiedCount
    }
  };
});

export { merge_post as default };
//# sourceMappingURL=merge.post.mjs.map
