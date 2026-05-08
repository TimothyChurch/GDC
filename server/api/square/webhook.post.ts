import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const webhookSignatureKey = config.squareWebhookSignatureKey as string;

  if (!webhookSignatureKey) {
    throw createError({ status: 500, statusText: 'Webhook signature key not configured' });
  }

  const body = await readRawBody(event);
  const signature = getHeader(event, 'x-square-hmacsha256-signature');

  if (!body || !signature) {
    throw createError({ status: 400, statusText: 'Missing body or signature' });
  }

  // Square HMAC verification: HMAC-SHA256(webhookSignatureKey, notificationUrl + body)
  const domain = (config.domain as string) || '';
  const notificationUrl = `${domain}/api/square/webhook`;
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = hmac.digest('base64');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw createError({ status: 400, statusText: 'Invalid webhook signature' });
  }

  let payload: { type?: string; data?: { object?: { payment?: { order_id?: string } } } };
  try {
    payload = JSON.parse(body);
  } catch {
    throw createError({ status: 400, statusText: 'Invalid JSON payload' });
  }

  if (payload.type === 'payment.completed') {
    const orderId = payload.data?.object?.payment?.order_id;
    if (orderId) {
      const client = useSquareClient(event);
      const result = await client.orders.get({ orderId });
      const metadata = result.order?.metadata || {};
      const originType = metadata.originType;
      const originId = metadata.originId;
      const quantity = Number(metadata.quantity) || 1;
      const contactId = metadata.contactId;

      if (originType === 'event' && originId) {
        // Fetch contact details for booking record
        let bookingName = 'Unknown';
        let bookingEmail = '';
        if (contactId) {
          const contact = await GDCContact.findById(contactId)
            .select('firstName lastName email')
            .lean();
          if (contact) {
            bookingName = `${contact.firstName} ${contact.lastName}`;
            bookingEmail = (contact.email as unknown as string) || '';
          }
        }

        // Calculate total from order line items
        let totalCents = 0n;
        if (result.order?.lineItems) {
          for (const item of result.order.lineItems) {
            totalCents += item.totalMoney?.amount || 0n;
          }
        }

        await GDCEvent.updateOne(
          { _id: originId, processedOrders: { $ne: orderId } },
          {
            $inc: { groupSize: quantity },
            $addToSet: { processedOrders: orderId },
            ...(contactId && { $set: { contact: contactId } }),
            $push: {
              bookings: {
                contact: contactId,
                name: bookingName,
                email: bookingEmail,
                quantity,
                amount: Number(totalCents) / 100,
                orderId,
                bookedAt: new Date(),
              },
            },
          },
        );
      }
    }
  }

  return { received: true };
});
