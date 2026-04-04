export default defineEventHandler(async (event) => {
  const { orderId } = getQuery(event);

  if (!orderId || typeof orderId !== 'string') {
    throw createError({ status: 400, statusText: 'Missing orderId' });
  }

  const client = useSquareClient(event);
  const result = await client.orders.get({ orderId });

  const order = result.order;
  const metadata = order?.metadata || {};

  // Calculate total from line items (Square stores in cents)
  let totalCents = 0n;
  if (order?.lineItems) {
    for (const item of order.lineItems) {
      const price = item.basePriceMoney?.amount || 0n;
      const qty = BigInt(item.quantity || '1');
      totalCents += price * qty;
    }
  }
  const totalDollars = Number(totalCents) / 100;

  // Fetch contact details if available
  let guest = null;
  if (metadata.contactId) {
    const contact = await Contact.findById(metadata.contactId)
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
  if (metadata.originType && metadata.originId) {
    origin = { type: metadata.originType, id: metadata.originId };

    if (metadata.originType === 'event') {
      const evt = await Event.findById(metadata.originId)
        .select('type date')
        .lean();
      if (evt) {
        origin.label = `${evt.type} — ${new Date(evt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
      }
    }
  }

  return {
    status: order?.state || 'UNKNOWN',
    amount: totalDollars,
    quantity: Number(metadata.quantity) || 1,
    guest,
    origin,
  };
});
