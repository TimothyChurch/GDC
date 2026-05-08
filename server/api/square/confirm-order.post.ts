export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const orderId = body?.orderId as string | undefined;

  if (!orderId) {
    throw createError({ status: 400, statusText: 'Missing orderId' });
  }

  const client = useSquareClient(event);
  const result = await client.orders.get({ orderId });
  const order = result.order;

  if (!order) {
    throw createError({ status: 404, statusText: 'Order not found' });
  }

  const metadata = order.metadata || {};
  const originType = metadata.originType;
  const originId = metadata.originId;
  const quantity = Number(metadata.quantity) || 1;
  const contactId = metadata.contactId;

  // Calculate total from line items (Square stores in cents as BigInt)
  let totalCents = 0n;
  if (order.lineItems) {
    for (const item of order.lineItems) {
      const price = item.totalMoney?.amount || 0n;
      totalCents += price;
    }
  }
  const totalDollars = Number(totalCents) / 100;

  // Fetch guest details
  let guest = null;
  if (contactId) {
    const contact = await GDCContact.findById(contactId)
      .select('firstName lastName email phone')
      .lean();
    if (contact) {
      guest = {
        _id: String(contact._id),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
      };
    }
  }

  // Build origin details
  let origin: { type: string; id: string; label?: string } | null = null;
  if (originType && originId) {
    origin = { type: originType, id: originId };

    if (originType === 'event') {
      const evt = await GDCEvent.findById(originId)
        .select('type date capacity groupSize')
        .lean();
      if (evt) {
        origin.label = `${evt.type} — ${new Date(evt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
      }
    }
  }

  // Check if payment went through: order is COMPLETED, or has a completed tender
  const hasPaidTender = order.tenders?.some(
    (t: any) => t.type === 'CARD' || t.type === 'WALLET' || t.type === 'SQUARE_GIFT_CARD' || t.type === 'OTHER',
  );
  const isCompleted = order.state === 'COMPLETED' || !!hasPaidTender;

  if (isCompleted && originType === 'event' && originId) {
    // Only update if this orderId hasn't been processed yet
    await GDCEvent.updateOne(
      { _id: originId, processedOrders: { $ne: orderId } },
      {
        $inc: { groupSize: quantity },
        $addToSet: { processedOrders: orderId },
        ...(contactId && { $set: { contact: contactId } }),
        $push: {
          bookings: {
            contact: contactId,
            name: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown',
            email: guest?.email || '',
            quantity,
            amount: totalDollars,
            orderId,
            bookedAt: new Date(),
          },
        },
      },
    );
  }

  return {
    status: isCompleted ? 'COMPLETED' : (order.state || 'UNKNOWN'),
    amount: totalDollars,
    quantity,
    guest,
    origin,
  };
});
