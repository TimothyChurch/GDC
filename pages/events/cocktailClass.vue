<script setup>
const { loadStripe } = useClientStripe();
const nuxtApp = useNuxtApp();
const stripePromise = loadStripe(nuxtApp.$config.public.stripe.key);
const checkoutLoading = ref(true);

const fetchClientSecret = async () => {
  const clientSecret = await $fetch("/api/stripe/create-checkout-session");
  return clientSecret;
};

onMounted(async () => {
  const stripe = await stripePromise;
  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });
  checkout.mount("#checkout-element");
  checkoutLoading.value = false;
});
</script>

<template>
  <div>
    <SitePageHero
      title="Cocktail Classes"
      subtitle="Learn to craft cocktails from our expert bartenders"
      background-image="/images/class.jpg"
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid lg:grid-cols-2 gap-12 items-start">
        <!-- Info section -->
        <div>
          <h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-6">
            What to Expect
          </h2>
          <div class="w-12 h-0.5 bg-gold/40 mb-6"></div>

          <div class="space-y-6 text-brown/80 dark:text-parchment/80">
            <p class="leading-relaxed">
              Join us for a hands-on cocktail class where you'll learn the art of mixology using our house-distilled spirits. Our bartenders will walk you through techniques, flavor profiles, and the stories behind each spirit.
            </p>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:time" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Duration</span>
                <p class="font-semibold mt-1">~2 Hours</p>
              </div>
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:group" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Group Size</span>
                <p class="font-semibold mt-1">Up to 12</p>
              </div>
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:drink-02" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Includes</span>
                <p class="font-semibold mt-1">3 Cocktails</p>
              </div>
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:location" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Location</span>
                <p class="font-semibold mt-1">Tasting Room</p>
              </div>
            </div>

            <div>
              <h3 class="font-[Cormorant_Garamond] text-xl font-bold mb-3">What's Included</h3>
              <ul class="space-y-2">
                <li class="flex items-start gap-2">
                  <Icon name="carbon:checkmark" class="text-gold mt-0.5 shrink-0" />
                  <span>Guided instruction from our bartenders</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="carbon:checkmark" class="text-gold mt-0.5 shrink-0" />
                  <span>Three handcrafted cocktails to make and enjoy</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="carbon:checkmark" class="text-gold mt-0.5 shrink-0" />
                  <span>Recipe cards to take home</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon name="carbon:checkmark" class="text-gold mt-0.5 shrink-0" />
                  <span>Discount on bottle purchases after class</span>
                </li>
              </ul>
            </div>
          </div>

          <NuxtLink
            to="/events"
            class="inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors mt-8"
          >
            <Icon name="carbon:arrow-left" />
            Back to all events
          </NuxtLink>
        </div>

        <!-- Booking section -->
        <div>
          <h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-6">
            Book Your Class
          </h2>
          <div class="w-12 h-0.5 bg-gold/40 mb-6"></div>

          <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6">
            <div v-if="checkoutLoading" class="flex justify-center py-12">
              <span class="text-brown/50 dark:text-parchment/50">Loading checkout...</span>
            </div>
            <div id="checkout-element" ref="checkoutElementRef"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
