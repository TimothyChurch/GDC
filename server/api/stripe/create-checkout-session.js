// /server/api/create-checkout-session.js
import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await readBody(event);

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price: "price_1RkyNhKIquLNl1bagG6fkPuB",
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${process.env.DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      clientSecret: session.client_secret,
    };
  } catch (error) {
    return {
      error: {
        message: error.message,
      },
    };
  }
});
