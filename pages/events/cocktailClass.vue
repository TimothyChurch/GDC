<script setup>
const { loadStripe } = useClientStripe();
const nuxtApp = useNuxtApp();
const stripePromise = loadStripe(nuxtApp.$config.public.stripe.key);
const clientSecret = process.env.STRIPE_SECRET_KEY;
console.log("clientSecret", clientSecret);
const fetchClientSecret = async () => {
  const clientSecret = await $fetch("/api/stripe/create-checkout-session");
  console.log("clientSecret", await clientSecret.json());
  return clientSecret.json().client_secret;
};

// Initialize and mount Checkout
onMounted(async () => {
  const stripe = await stripePromise;
  stripe.initEmbeddedCheckout({
    clientSecret,
  });
});
</script>

<template>
  <div>
    Testing
    <div id="checkout-element" ref="checkoutElementRef"></div>
  </div>
</template>
