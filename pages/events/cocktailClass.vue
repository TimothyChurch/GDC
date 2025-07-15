<script setup>
const { loadStripe } = useClientStripe();
const nuxtApp = useNuxtApp();
const stripePromise = loadStripe(nuxtApp.$config.public.stripe.key);

// Element to mount Checkout
const checkoutElementRef = ref(null);
const clientSecret = ref(null);

// Function to fetch client secret from your server
const fetchClientSecret = async () => {
  const clientSecret = await createCheckoutSession();
  return clientSecret;
};

// Initialize and mount Checkout
onMounted(async () => {
  const stripe = await stripePromise;

  const checkout = await stripe.initCheckout({
    fetchClientSecret,
  });
  console.log("testing");
  //   console.log("checkout Object" + checkout);

  //   checkout.mount("#checkout-element");
});
</script>

<template>
  <div>
    Testing
    <div id="checkout-element" ref="checkoutElementRef"></div>
  </div>
</template>
