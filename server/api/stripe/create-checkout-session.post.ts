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

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    return_url: `${domain}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  return { clientSecret: session.client_secret };
});
