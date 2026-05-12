import { d as defineEventHandler, $ as getQuery, c as createError, aj as useSquareClient, L as GDCContact, K as GDCEvent } from '../../../nitro/nitro.mjs';
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

const orderStatus_get = defineEventHandler(async (event) => {
  var _a;
  const { orderId } = getQuery(event);
  if (!orderId || typeof orderId !== "string") {
    throw createError({ status: 400, statusText: "Missing orderId" });
  }
  const client = useSquareClient(event);
  const result = await client.orders.get({ orderId });
  const order = result.order;
  const metadata = (order == null ? void 0 : order.metadata) || {};
  let totalCents = /* @__PURE__ */ BigInt("0");
  if (order == null ? void 0 : order.lineItems) {
    for (const item of order.lineItems) {
      const price = ((_a = item.basePriceMoney) == null ? void 0 : _a.amount) || /* @__PURE__ */ BigInt("0");
      const qty = BigInt(item.quantity || "1");
      totalCents += price * qty;
    }
  }
  const totalDollars = Number(totalCents) / 100;
  let guest = null;
  if (metadata.contactId) {
    const contact = await GDCContact.findById(metadata.contactId).select("firstName lastName email phone").lean();
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
  if (metadata.originType && metadata.originId) {
    origin = { type: metadata.originType, id: metadata.originId };
    if (metadata.originType === "event") {
      const evt = await GDCEvent.findById(metadata.originId).select("type date").lean();
      if (evt) {
        origin.label = `${evt.type} \u2014 ${new Date(evt.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
      }
    }
  }
  return {
    status: (order == null ? void 0 : order.state) || "UNKNOWN",
    amount: totalDollars,
    quantity: Number(metadata.quantity) || 1,
    guest,
    origin
  };
});

export { orderStatus_get as default };
//# sourceMappingURL=order-status.get.mjs.map
