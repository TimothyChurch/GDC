import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const stripe = new Stripe(config.stripe.key as string);
  const priceId = config.stripePriceId as string;

  if (!priceId) {
    throw createError({ status: 500, statusText: 'Stripe price ID not configured' });
  }

  const domain = (config.domain as string)
    || `${getRequestProtocol(event)}://${getRequestHost(event)}`;
  if (!domain) {
    throw createError({ status: 500, statusText: 'Domain not configured' });
  }

  const body = await readBody(event);
  const eventId = body?.eventId as string | undefined;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity) || 1));

  let metadata: Record<string, string> = {};

  // If booking a specific class, validate capacity
  if (eventId) {
    const classEvent = await Event.findById(eventId).lean();
    if (!classEvent) {
      throw createError({ status: 404, statusText: 'Class not found' });
    }
    if (classEvent.status !== 'Confirmed') {
      throw createError({ status: 400, statusText: 'This class is not available for booking' });
    }
    if (classEvent.capacity) {
      const booked = classEvent.groupSize || 0;
      const available = classEvent.capacity - booked;
      if (quantity > available) {
        throw createError({
          status: 400,
          statusText: available <= 0
            ? 'This class is sold out'
            : `Only ${available} seat(s) remaining`,
        });
      }
    }
    metadata = {
      eventId,
      quantity: String(quantity),
    };
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [{ price: priceId, quantity }],
    mode: 'payment',
    return_url: `${domain}/return?session_id={CHECKOUT_SESSION_ID}`,
    metadata,
  });

  return { clientSecret: session.client_secret };
});
