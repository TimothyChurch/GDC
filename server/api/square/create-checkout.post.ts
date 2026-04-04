export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const client = useSquareClient(event);

  const body = await readBody(event);
  const origin = body?.origin as { type?: string; id?: string } | undefined;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));

  if (!origin?.type || !origin?.id) {
    throw createError({ status: 400, statusText: 'Origin type and id are required' });
  }

  // Validate customer info
  const customerInfo = body?.customer as { firstName?: string; lastName?: string; email?: string; phone?: string } | undefined;
  if (!customerInfo?.firstName || !customerInfo?.lastName || !customerInfo?.email) {
    throw createError({ status: 400, statusText: 'Name and email are required' });
  }

  // Find or create contact by email
  let contact = await Contact.findOne({ email: customerInfo.email });
  if (contact) {
    await Contact.findByIdAndUpdate(contact._id, {
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      ...(customerInfo.phone && { phone: customerInfo.phone }),
    });
  } else {
    contact = await Contact.create({
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      email: customerInfo.email,
      phone: customerInfo.phone || undefined,
      type: 'Customer',
    });
  }

  // Build line items based on origin type
  const toCents = (dollars: number) => BigInt(Math.round(dollars * 100));
  let lineItems: any[] = [];
  let itemLabel = '';

  if (origin.type === 'event') {
    const classEvent = await Event.findById(origin.id).lean();
    if (!classEvent) {
      throw createError({ status: 404, statusText: 'Event not found' });
    }
    if (classEvent.status !== 'Confirmed') {
      throw createError({ status: 400, statusText: 'This event is not available for booking' });
    }
    if (!classEvent.price) {
      throw createError({ status: 400, statusText: 'This event does not have a price configured' });
    }
    if (classEvent.capacity) {
      const booked = classEvent.groupSize || 0;
      const available = classEvent.capacity - booked;
      if (quantity > available) {
        throw createError({
          status: 400,
          statusText: available <= 0
            ? 'This event is sold out'
            : `Only ${available} seat(s) remaining`,
        });
      }
    }

    itemLabel = `${classEvent.type} — ${new Date(classEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    lineItems.push({
      name: itemLabel,
      quantity: String(quantity),
      basePriceMoney: {
        amount: toCents(classEvent.price),
        currency: 'USD',
      },
    });

    // Add selected add-ons
    const selectedAddOns = body?.addOns as { name: string; quantity?: number }[] | undefined;
    if (selectedAddOns?.length && classEvent.addOns?.length) {
      for (const selected of selectedAddOns) {
        const addOn = classEvent.addOns.find((a: any) => a.name === selected.name);
        if (addOn) {
          lineItems.push({
            name: addOn.name,
            quantity: String(selected.quantity || quantity),
            basePriceMoney: {
              amount: toCents(addOn.price),
              currency: 'USD',
            },
          });
        }
      }
    }
  } else {
    throw createError({ status: 400, statusText: `Unsupported origin type: ${origin.type}` });
  }

  const domain = (config.domain as string)
    || `${getRequestProtocol(event)}://${getRequestHost(event)}`;

  const result = await client.checkout.paymentLinks.create({
    order: {
      locationId: config.public.squareLocationId as string,
      lineItems,
      metadata: {
        originType: origin.type,
        originId: origin.id,
        quantity: String(quantity),
        contactId: String(contact._id),
      },
    },
    checkoutOptions: {
      redirectUrl: `${domain}/return`,
    },
  });

  if (!result.paymentLink?.url || !result.paymentLink?.orderId) {
    throw createError({ status: 500, statusText: 'Failed to create checkout link' });
  }

  // Append orderId to the Square payment URL so it passes through to the redirect.
  // Square sandbox doesn't reliably append query params to the redirect URL,
  // so we also return the orderId for the client to store before redirecting.
  return {
    url: result.paymentLink.url,
    orderId: result.paymentLink.orderId,
  };
});
