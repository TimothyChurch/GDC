import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripe.key as string);
  const priceId = config.stripePriceId as string;

  if (!priceId) {
    throw createError({ statusCode: 500, statusMessage: 'Stripe price ID not configured' });
  }

  const domain = config.domain as string;
  if (!domain) {
    throw createError({ statusCode: 500, statusMessage: 'Domain not configured' });
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    return_url: `${domain}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  return { clientSecret: session.client_secret };
});
