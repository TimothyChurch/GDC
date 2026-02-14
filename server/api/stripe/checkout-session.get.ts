import Stripe from 'stripe';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripe.key as string);
  const { session_id } = getQuery(event);

  if (!session_id || typeof session_id !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing session_id parameter' });
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  return { status: session.status };
});
