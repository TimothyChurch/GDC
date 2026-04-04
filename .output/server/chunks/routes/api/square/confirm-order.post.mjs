import { d as defineEventHandler, r as readBody, c as createError, aa as useSquareClient, F as Contact, D as Event } from '../../../nitro/nitro.mjs';
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

const confirmOrder_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const orderId = body == null ? void 0 : body.orderId;
  if (!orderId) {
    throw createError({ status: 400, statusText: "Missing orderId" });
  }
  const client = useSquareClient(event);
  const result = await client.orders.get({ orderId });
  const order = result.order;
  if (!order) {
    throw createError({ status: 404, statusText: "Order not found" });
  }
  const metadata = order.metadata || {};
  const originType = metadata.originType;
  const originId = metadata.originId;
  const quantity = Number(metadata.quantity) || 1;
  const contactId = metadata.contactId;
  let totalCents = /* @__PURE__ */ BigInt("0");
  if (order.lineItems) {
    for (const item of order.lineItems) {
      const price = ((_a = item.totalMoney) == null ? void 0 : _a.amount) || /* @__PURE__ */ BigInt("0");
      totalCents += price;
    }
  }
  const totalDollars = Number(totalCents) / 100;
  let guest = null;
  if (contactId) {
    const contact = await Contact.findById(contactId).select("firstName lastName email phone").lean();
    if (contact) {
      guest = {
        _id: String(contact._id),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone
      };
    }
  }
  let origin = null;
  if (originType && originId) {
    origin = { type: originType, id: originId };
    if (originType === "event") {
      const evt = await Event.findById(originId).select("type date capacity groupSize").lean();
      if (evt) {
        origin.label = `${evt.type} \u2014 ${new Date(evt.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
      }
    }
  }
  const hasPaidTender = (_b = order.tenders) == null ? void 0 : _b.some(
    (t) => t.type === "CARD" || t.type === "WALLET" || t.type === "SQUARE_GIFT_CARD" || t.type === "OTHER"
  );
  const isCompleted = order.state === "COMPLETED" || !!hasPaidTender;
  if (isCompleted && originType === "event" && originId) {
    await Event.updateOne(
      { _id: originId, processedOrders: { $ne: orderId } },
      {
        $inc: { groupSize: quantity },
        $addToSet: { processedOrders: orderId },
        ...contactId && { $set: { contact: contactId } },
        $push: {
          bookings: {
            contact: contactId,
            name: guest ? `${guest.firstName} ${guest.lastName}` : "Unknown",
            email: (guest == null ? void 0 : guest.email) || "",
            quantity,
            amount: totalDollars,
            orderId,
            bookedAt: /* @__PURE__ */ new Date()
          }
        }
      }
    );
  }
  return {
    status: isCompleted ? "COMPLETED" : order.state || "UNKNOWN",
    amount: totalDollars,
    quantity,
    guest,
    origin
  };
});

export { confirmOrder_post as default };
//# sourceMappingURL=confirm-order.post.mjs.map
