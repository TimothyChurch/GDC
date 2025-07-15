// /server/api/checkout-session.js
import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { session_id } = getQuery(event);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return { status: session.status };
  } catch (error) {
    return { error: { message: error.message } };
  }
});
