import { d as defineEventHandler, ab as useRuntimeConfig, c as createError, ae as readRawBody, af as getHeader, aa as useSquareClient, F as Contact, D as Event } from '../../../nitro/nitro.mjs';
import require$$1 from 'crypto';
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

const webhook_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const config = useRuntimeConfig(event);
  const webhookSignatureKey = config.squareWebhookSignatureKey;
  if (!webhookSignatureKey) {
    throw createError({ status: 500, statusText: "Webhook signature key not configured" });
  }
  const body = await readRawBody(event);
  const signature = getHeader(event, "x-square-hmacsha256-signature");
  if (!body || !signature) {
    throw createError({ status: 400, statusText: "Missing body or signature" });
  }
  const domain = config.domain || "";
  const notificationUrl = `${domain}/api/square/webhook`;
  const hmac = require$$1.createHmac("sha256", webhookSignatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = hmac.digest("base64");
  if (signature !== expectedSignature) {
    throw createError({ status: 400, statusText: "Invalid webhook signature" });
  }
  const payload = JSON.parse(body);
  if (payload.type === "payment.completed") {
    const orderId = (_c = (_b = (_a = payload.data) == null ? void 0 : _a.object) == null ? void 0 : _b.payment) == null ? void 0 : _c.order_id;
    if (orderId) {
      const client = useSquareClient(event);
      const result = await client.orders.get({ orderId });
      const metadata = ((_d = result.order) == null ? void 0 : _d.metadata) || {};
      const originType = metadata.originType;
      const originId = metadata.originId;
      const quantity = Number(metadata.quantity) || 1;
      const contactId = metadata.contactId;
      if (originType === "event" && originId) {
        let bookingName = "Unknown";
        let bookingEmail = "";
        if (contactId) {
          const contact = await Contact.findById(contactId).select("firstName lastName email").lean();
          if (contact) {
            bookingName = `${contact.firstName} ${contact.lastName}`;
            bookingEmail = contact.email || "";
          }
        }
        let totalCents = /* @__PURE__ */ BigInt("0");
        if ((_e = result.order) == null ? void 0 : _e.lineItems) {
          for (const item of result.order.lineItems) {
            totalCents += ((_f = item.totalMoney) == null ? void 0 : _f.amount) || /* @__PURE__ */ BigInt("0");
          }
        }
        await Event.updateOne(
          { _id: originId, processedOrders: { $ne: orderId } },
          {
            $inc: { groupSize: quantity },
            $addToSet: { processedOrders: orderId },
            ...contactId && { $set: { contact: contactId } },
            $push: {
              bookings: {
                contact: contactId,
                name: bookingName,
                email: bookingEmail,
                quantity,
                amount: Number(totalCents) / 100,
                orderId,
                bookedAt: /* @__PURE__ */ new Date()
              }
            }
          }
        );
      }
    }
  }
  return { received: true };
});

export { webhook_post as default };
//# sourceMappingURL=webhook.post.mjs.map
