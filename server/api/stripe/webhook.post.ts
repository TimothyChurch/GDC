import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const stripe = new Stripe(config.stripe.key as string);
  const webhookSecret = config.stripeWebhookSecret as string;

  if (!webhookSecret) {
    throw createError({ status: 500, statusText: 'Webhook secret not configured' });
  }

  const body = await readRawBody(event);
  const signature = getHeader(event, 'stripe-signature');

  if (!body || !signature) {
    throw createError({ status: 400, statusText: 'Missing body or signature' });
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    throw createError({ status: 400, statusText: 'Invalid webhook signature' });
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const eventId = session.metadata?.eventId;
    const quantity = Number(session.metadata?.quantity) || 1;

    if (eventId) {
      await Event.updateOne(
        { _id: eventId },
        { $inc: { groupSize: quantity } },
      );
    }
  }

  return { received: true };
});
