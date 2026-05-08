import { d as defineEventHandler, r as rateLimit, ah as useRuntimeConfig, ag as useSquareClient, s as sanitize, a as readBody, c as createError, N as validateObjectId, H as GDCContact, G as GDCEvent, ai as getRequestProtocol, aj as getRequestHost } from '../../../nitro/nitro.mjs';
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

const createCheckout_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  rateLimit(event, {
    key: "square:create-checkout",
    limit: 10,
    windowMs: 15 * 60 * 1e3,
    message: "Too many checkout attempts. Please try again later."
  });
  const config = useRuntimeConfig(event);
  const client = useSquareClient(event);
  const body = sanitize(await readBody(event));
  const origin = body == null ? void 0 : body.origin;
  const quantity = Math.max(1, Math.floor(Number(body == null ? void 0 : body.quantity) || 1));
  if (!(origin == null ? void 0 : origin.type) || !(origin == null ? void 0 : origin.id)) {
    throw createError({ status: 400, statusText: "Origin type and id are required" });
  }
  validateObjectId(origin.id, "Origin");
  const customerInfo = body == null ? void 0 : body.customer;
  if (!(customerInfo == null ? void 0 : customerInfo.firstName) || !(customerInfo == null ? void 0 : customerInfo.lastName) || !(customerInfo == null ? void 0 : customerInfo.email)) {
    throw createError({ status: 400, statusText: "Name and email are required" });
  }
  let contact = await GDCContact.findOne({ email: customerInfo.email });
  if (contact) {
    await GDCContact.findByIdAndUpdate(contact._id, {
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      ...customerInfo.phone && { phone: customerInfo.phone }
    });
  } else {
    contact = await GDCContact.create({
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone || void 0,
      type: "Customer"
    });
  }
  const toCents = (dollars) => BigInt(Math.round(dollars * 100));
  let lineItems = [];
  let itemLabel = "";
  if (origin.type === "event") {
    const classEvent = await GDCEvent.findById(origin.id).lean();
    if (!classEvent) {
      throw createError({ status: 404, statusText: "Event not found" });
    }
    if (classEvent.status !== "Confirmed") {
      throw createError({ status: 400, statusText: "This event is not available for booking" });
    }
    if (!classEvent.price) {
      throw createError({ status: 400, statusText: "This event does not have a price configured" });
    }
    if (classEvent.capacity) {
      const booked = classEvent.groupSize || 0;
      const available = classEvent.capacity - booked;
      if (quantity > available) {
        throw createError({
          status: 400,
          statusText: available <= 0 ? "This event is sold out" : `Only ${available} seat(s) remaining`
        });
      }
    }
    itemLabel = `${classEvent.type} \u2014 ${new Date(classEvent.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
    lineItems.push({
      name: itemLabel,
      quantity: String(quantity),
      basePriceMoney: {
        amount: toCents(classEvent.price),
        currency: "USD"
      }
    });
    const selectedAddOns = body == null ? void 0 : body.addOns;
    if ((selectedAddOns == null ? void 0 : selectedAddOns.length) && ((_a = classEvent.addOns) == null ? void 0 : _a.length)) {
      for (const selected of selectedAddOns) {
        const addOn = classEvent.addOns.find((a) => a.name === selected.name);
        if (addOn) {
          lineItems.push({
            name: addOn.name,
            quantity: String(selected.quantity || quantity),
            basePriceMoney: {
              amount: toCents(addOn.price),
              currency: "USD"
            }
          });
        }
      }
    }
  } else {
    throw createError({ status: 400, statusText: `Unsupported origin type: ${origin.type}` });
  }
  const domain = config.domain || `${getRequestProtocol(event)}://${getRequestHost(event)}`;
  const result = await client.checkout.paymentLinks.create({
    order: {
      locationId: config.public.squareLocationId,
      lineItems,
      metadata: {
        originType: origin.type,
        originId: origin.id,
        quantity: String(quantity),
        contactId: String(contact._id)
      }
    },
    checkoutOptions: {
      redirectUrl: `${domain}/return`
    }
  });
  if (!((_b = result.paymentLink) == null ? void 0 : _b.url) || !((_c = result.paymentLink) == null ? void 0 : _c.orderId)) {
    throw createError({ status: 500, statusText: "Failed to create checkout link" });
  }
  return {
    url: result.paymentLink.url,
    orderId: result.paymentLink.orderId
  };
});

export { createCheckout_post as default };
//# sourceMappingURL=create-checkout.post.mjs.map
