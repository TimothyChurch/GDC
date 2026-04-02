import { defineEventHandler } from "h3";
import { useServerStripe } from "#stripe/server";

export default defineEventHandler(async (event) => {
  const stripe = await useServerStripe(event);
  const query = getQuery(event);
  const amount = Number(query.amount);

  if (!amount || !Number.isInteger(amount) || amount < 50) {
    throw createError({
      status: 400,
      statusText: 'Invalid amount: must be an integer >= 50 (cents)',
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount,
      automatic_payment_methods: { enabled: true },
    });
    return {
      clientSecret: paymentIntent.client_secret,
      error: null,
    };
  } catch (e) {
    throw createError({
      status: 500,
      statusText: 'Failed to create payment intent',
    });
  }
});
