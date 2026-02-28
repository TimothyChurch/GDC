<script setup lang="ts">
useServerSeoMeta({
  title: 'Cocktail Classes | Galveston Distilling Co',
  description: 'Join our hands-on cocktail classes and learn to craft drinks with Galveston-made spirits.',
  ogTitle: 'Cocktail Classes | Galveston Distilling Co',
  ogDescription: 'Join our hands-on cocktail classes and learn to craft drinks with Galveston-made spirits.',
  ogImage: 'https://galvestondistilling.com/images/og-events.jpg',
  ogUrl: 'https://galvestondistilling.com/events/cocktailClass',
});

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

// Upcoming public classes
const { data: upcomingClasses, status: classesStatus } = useFetch('/api/event/upcoming');

function formatClassDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatClassTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function availableSeats(event: any) {
  if (!event.capacity) return null;
  return event.capacity - (event.groupSize || 0);
}

// Private class request form
const requestForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  date: '',
  groupSize: null as number | null,
  notes: '',
});
const requestStatus = ref('idle');
const requestMessage = ref('');

const submitRequest = async () => {
  if (!requestForm.value.email || !requestForm.value.firstName || !requestForm.value.lastName || !requestForm.value.date || !requestForm.value.groupSize) return;
  requestStatus.value = 'loading';
  try {
    const data = await $fetch('/api/event/request', {
      method: 'POST',
      body: {
        ...requestForm.value,
        type: 'Private Class',
        groupSize: Number(requestForm.value.groupSize),
      },
    });
    requestStatus.value = 'success';
    requestMessage.value = data.message || 'Your request has been submitted!';
    requestForm.value = { firstName: '', lastName: '', email: '', phone: '', date: '', groupSize: null, notes: '' };
  } catch (e) {
    requestStatus.value = 'error';
    requestMessage.value = e?.data?.data?.[0] || 'Something went wrong. Please try again.';
  }
};
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

      <!-- Upcoming Classes Section -->
      <div class="mt-12 pt-12 border-t border-gold/10">
        <div class="text-center mb-8">
          <h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-4">
            Upcoming Classes
          </h2>
          <div class="w-12 h-0.5 bg-gold/40 mx-auto mb-4"></div>
          <p class="text-brown/80 dark:text-parchment/80">
            Browse our scheduled classes and reserve your spot.
          </p>
        </div>

        <div v-if="classesStatus === 'pending'" class="flex justify-center py-8">
          <span class="text-brown/50 dark:text-parchment/50">Loading classes...</span>
        </div>

        <div v-else-if="upcomingClasses?.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            v-for="cls in upcomingClasses"
            :key="cls._id"
            class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6 flex flex-col"
          >
            <div class="flex items-center gap-2 text-gold mb-3">
              <Icon name="carbon:calendar" class="text-lg" />
              <span class="text-sm font-semibold uppercase tracking-wider">{{ cls.type }}</span>
            </div>

            <h3 class="font-[Cormorant_Garamond] text-xl font-bold mb-1">
              {{ formatClassDate(cls.date) }}
            </h3>
            <p class="text-sm text-brown/60 dark:text-parchment/60 mb-4">
              {{ formatClassTime(cls.date) }}
            </p>

            <div class="flex items-center gap-2 text-sm text-brown/70 dark:text-parchment/70 mb-6">
              <Icon name="carbon:group" class="text-base" />
              <span v-if="availableSeats(cls) !== null">
                <strong class="text-brown dark:text-parchment">{{ availableSeats(cls) }}</strong> seats available
              </span>
              <span v-else>Open enrollment</span>
            </div>

            <div class="mt-auto">
              <button
                disabled
                class="w-full rounded-md bg-gold/30 px-4 py-2.5 text-sm font-semibold text-espresso/50 cursor-not-allowed"
                title="Online booking coming soon"
              >
                Book Now &mdash; Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <Icon name="carbon:calendar" class="text-3xl text-brown/20 dark:text-parchment/20 mb-3" />
          <p class="text-brown/60 dark:text-parchment/60">
            No upcoming classes scheduled right now. Check back soon or request a private class below!
          </p>
        </div>
      </div>

      <!-- Private Class Request Section -->
      <div class="lg:col-span-2 mt-12 pt-12 border-t border-gold/10">
        <div class="max-w-2xl mx-auto text-center mb-8">
          <h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-4">
            Request a Private Class
          </h2>
          <div class="w-12 h-0.5 bg-gold/40 mx-auto mb-4"></div>
          <p class="text-brown/80 dark:text-parchment/80">
            Want an exclusive experience for your group? Fill out the form below and we'll get back to you to arrange your private cocktail class.
          </p>
        </div>

        <div v-if="requestStatus === 'success'" class="max-w-2xl mx-auto">
          <div class="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
            <Icon name="carbon:checkmark-filled" class="text-green-500 text-3xl mb-3" />
            <p class="text-green-400 font-semibold text-lg">{{ requestMessage }}</p>
          </div>
        </div>

        <form v-else class="max-w-2xl mx-auto space-y-4" @submit.prevent="submitRequest">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">First Name *</label>
              <input
                v-model="requestForm.firstName"
                type="text"
                required
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
                placeholder="First name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Last Name *</label>
              <input
                v-model="requestForm.lastName"
                type="text"
                required
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
                placeholder="Last name"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Email *</label>
              <input
                v-model="requestForm.email"
                type="email"
                required
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Phone</label>
              <input
                v-model="requestForm.phone"
                type="tel"
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Preferred Date *</label>
              <input
                v-model="requestForm.date"
                type="date"
                required
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Group Size *</label>
              <input
                v-model.number="requestForm.groupSize"
                type="number"
                min="1"
                required
                :disabled="requestStatus === 'loading'"
                class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
                placeholder="Number of guests"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-1">Notes</label>
            <textarea
              v-model="requestForm.notes"
              rows="3"
              :disabled="requestStatus === 'loading'"
              class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6"
              placeholder="Any special requests or details..."
            ></textarea>
          </div>

          <div class="flex justify-center pt-2">
            <button
              type="submit"
              :disabled="requestStatus === 'loading'"
              class="rounded-md bg-gold px-8 py-3 text-sm font-semibold text-espresso shadow-xs hover:bg-copper transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
            >
              {{ requestStatus === 'loading' ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>

          <p v-if="requestStatus === 'error'" class="text-center text-sm text-red-500">
            {{ requestMessage }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
