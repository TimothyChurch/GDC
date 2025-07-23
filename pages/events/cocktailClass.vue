<script setup>
const { loadStripe } = useClientStripe();
const nuxtApp = useNuxtApp();
const stripePromise = loadStripe(nuxtApp.$config.public.stripe.key);

const fetchClientSecret = async () => {
  const clientSecret = await $fetch("/api/stripe/create-checkout-session");
  return clientSecret;
};

// Initialize and mount Checkout
onMounted(async () => {
  const stripe = await stripePromise;
  stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });
  console.log("Checkout initialized", stripe);
});
</script>

<template>
  <div>
    Testing
    <div id="checkout-element" ref="checkoutElementRef"></div>
  </div>
</template>
