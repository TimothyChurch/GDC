<script setup lang="ts">
const route = useRoute();
const classId = route.params.id as string;

const { data: classEvent, status: fetchStatus, error: fetchError } = useFetch(`/api/event/public/${classId}`);

// SEO meta (reactive based on fetched data)
if (import.meta.server) {
  useSeoMeta({
    title: 'Cocktail Class | Galveston Distilling Co',
    description: 'Book your spot in a hands-on cocktail class at Galveston Distilling Co.',
    ogTitle: 'Cocktail Class | Galveston Distilling Co',
    ogDescription: 'Book your spot in a hands-on cocktail class at Galveston Distilling Co.',
    ogImage: 'https://galvestondistilling.com/images/og-events.jpg',
  });
}

// Booking state
const quantity = ref(1);
const selectedAddOns = ref<Record<string, boolean>>({});
const checkoutLoading = ref(false);
const checkoutError = ref('');

// Customer info
const customer = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const availableSeats = computed(() => {
  if (!classEvent.value?.capacity) return null;
  return classEvent.value.capacity - (classEvent.value.groupSize || 0);
});

const isSoldOut = computed(() => {
  return availableSeats.value !== null && availableSeats.value <= 0;
});

const maxQuantity = computed(() => {
  if (availableSeats.value === null) return 20;
  return Math.max(0, availableSeats.value);
});

const bookingTotal = computed(() => {
  if (!classEvent.value?.price) return 0;
  let total = classEvent.value.price * quantity.value;
  if (classEvent.value.addOns) {
    for (const addOn of classEvent.value.addOns) {
      if (selectedAddOns.value[addOn.name]) {
        total += addOn.price * quantity.value;
      }
    }
  }
  return total;
});

function formatPrice(dollars: number) {
  return `$${dollars.toFixed(2)}`;
}

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

function decrementQuantity() {
  if (quantity.value > 1) quantity.value--;
}

function incrementQuantity() {
  if (quantity.value < maxQuantity.value) quantity.value++;
}

const canSubmit = computed(() => {
  return customer.value.firstName.trim()
    && customer.value.lastName.trim()
    && customer.value.email.trim();
});

async function proceedToPayment() {
  if (!classEvent.value || isSoldOut.value || !canSubmit.value) return;

  checkoutLoading.value = true;
  checkoutError.value = '';

  try {
    const addOns = Object.entries(selectedAddOns.value)
      .filter(([, selected]) => selected)
      .map(([name]) => ({ name, quantity: quantity.value }));

    const { url, orderId } = await $fetch<{ url: string; orderId: string }>('/api/square/create-checkout', {
      method: 'POST',
      body: {
        origin: { type: 'event', id: classId },
        quantity: quantity.value,
        addOns,
        customer: {
          firstName: customer.value.firstName.trim(),
          lastName: customer.value.lastName.trim(),
          email: customer.value.email.trim(),
          phone: customer.value.phone.trim() || undefined,
        },
      },
    });

    // Store orderId before redirecting — Square sandbox doesn't reliably
    // append query params to the redirect URL
    sessionStorage.setItem('square_order_id', orderId);
    await navigateTo(url, { external: true });
  } catch (e: any) {
    checkoutError.value = e?.data?.statusMessage || 'Unable to start checkout. Please try again.';
  } finally {
    checkoutLoading.value = false;
  }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="fetchStatus === 'pending'" class="min-h-screen flex items-center justify-center">
      <span class="text-brown/50 dark:text-parchment/50">Loading class details...</span>
    </div>

    <!-- Error / Not Found -->
    <div v-else-if="fetchError || !classEvent" class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center space-y-4">
        <Icon name="carbon:warning" class="text-4xl text-brown/30 dark:text-parchment/30" />
        <h1 class="text-2xl font-bold">Class Not Found</h1>
        <p class="text-brown/60 dark:text-parchment/60">This class may no longer be available.</p>
        <NuxtLink to="/events/cocktailClass">
          <UButton label="Browse Classes" class="bg-gold text-espresso hover:bg-copper" />
        </NuxtLink>
      </div>
    </div>

    <!-- Class Detail -->
    <template v-else>
      <SitePageHero
        :title="classEvent.type"
        :subtitle="`${formatClassDate(classEvent.date)} at ${formatClassTime(classEvent.date)}`"
        background-image="/images/class.jpg"
      />

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-5 gap-12 items-start">
          <!-- Class Info (3 cols) -->
          <div class="lg:col-span-3 space-y-8">
            <div>
              <h2 class="font-[Cormorant_Garamond] text-3xl font-bold mb-4">About This Class</h2>
              <div class="w-12 h-0.5 bg-gold/40 mb-6"></div>
              <p class="text-brown/80 dark:text-parchment/80 leading-relaxed">
                Join us for a hands-on cocktail class where you'll learn the art of mixology using our house-distilled spirits. Our bartenders will walk you through techniques, flavor profiles, and the stories behind each spirit.
              </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:calendar" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Date</span>
                <p class="font-semibold mt-1">{{ formatClassDate(classEvent.date) }}</p>
              </div>
              <div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                <Icon name="carbon:time" class="text-gold text-xl mb-2" />
                <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider block">Time</span>
                <p class="font-semibold mt-1">{{ formatClassTime(classEvent.date) }}</p>
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
              <ul class="space-y-2 text-brown/80 dark:text-parchment/80">
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

            <NuxtLink
              to="/events/cocktailClass"
              class="inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors"
            >
              <Icon name="carbon:arrow-left" />
              Back to all classes
            </NuxtLink>
          </div>

          <!-- Booking Card (2 cols) -->
          <div class="lg:col-span-2">
            <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6 sticky top-8">
              <h3 class="font-[Cormorant_Garamond] text-2xl font-bold mb-1">Book Your Spot</h3>

              <div v-if="classEvent.price" class="text-2xl font-bold text-gold mb-4">
                {{ formatPrice(classEvent.price) }}
                <span class="text-sm font-normal text-brown/60 dark:text-parchment/60">per person</span>
              </div>

              <!-- Availability -->
              <div class="flex items-center gap-2 text-sm mb-6">
                <Icon name="carbon:group" class="text-base text-brown/50 dark:text-parchment/50" />
                <span v-if="isSoldOut" class="text-red-500 font-semibold">Sold Out</span>
                <span v-else-if="availableSeats !== null" class="text-brown/70 dark:text-parchment/70">
                  <strong class="text-brown dark:text-parchment">{{ availableSeats }}</strong> seats available
                </span>
                <span v-else class="text-brown/70 dark:text-parchment/70">Open enrollment</span>
              </div>

              <!-- Sold out state -->
              <div v-if="isSoldOut" class="text-center py-4">
                <p class="text-brown/60 dark:text-parchment/60 mb-4">This class is fully booked.</p>
                <NuxtLink to="/events/cocktailClass">
                  <UButton label="See Other Classes" variant="outline" class="border-gold text-gold hover:bg-gold/10" />
                </NuxtLink>
              </div>

              <!-- Booking form -->
              <template v-else>
                <!-- Customer info -->
                <div class="mb-6 space-y-3">
                  <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70">Your Information</label>
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="customer.firstName"
                      type="text"
                      required
                      placeholder="First name *"
                      class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"
                    />
                    <input
                      v-model="customer.lastName"
                      type="text"
                      required
                      placeholder="Last name *"
                      class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"
                    />
                  </div>
                  <input
                    v-model="customer.email"
                    type="email"
                    required
                    placeholder="Email address *"
                    class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"
                  />
                  <input
                    v-model="customer.phone"
                    type="tel"
                    placeholder="Phone number (optional)"
                    class="w-full rounded-md bg-white dark:bg-espresso/50 px-3 py-2 text-sm text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/40 dark:placeholder:text-parchment/40 focus:outline-2 focus:-outline-offset-2 focus:outline-gold"
                  />
                </div>

                <!-- Guest quantity -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-2">Number of Guests</label>
                  <div class="flex items-center gap-3">
                    <UButton
                      icon="i-lucide-minus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      :disabled="quantity <= 1"
                      @click="decrementQuantity"
                    />
                    <span class="text-xl font-bold w-12 text-center">{{ quantity }}</span>
                    <UButton
                      icon="i-lucide-plus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      :disabled="quantity >= maxQuantity"
                      @click="incrementQuantity"
                    />
                  </div>
                </div>

                <!-- Add-ons -->
                <div v-if="classEvent.addOns?.length" class="mb-6">
                  <label class="block text-sm font-medium text-brown/70 dark:text-parchment/70 mb-3">Add-ons</label>
                  <div class="space-y-3">
                    <label
                      v-for="addOn in classEvent.addOns"
                      :key="addOn.name"
                      class="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        v-model="selectedAddOns[addOn.name]"
                        type="checkbox"
                        class="mt-1 rounded border-gold/30 text-gold focus:ring-gold"
                      />
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="font-medium text-sm group-hover:text-gold transition-colors">{{ addOn.name }}</span>
                          <span class="text-sm text-gold font-semibold">+{{ formatPrice(addOn.price) }}/person</span>
                        </div>
                        <p v-if="addOn.description" class="text-xs text-brown/50 dark:text-parchment/50 mt-0.5">
                          {{ addOn.description }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Price summary -->
                <div class="border-t border-gold/10 pt-4 mb-6 space-y-2">
                  <div v-if="classEvent.price" class="flex justify-between text-sm text-brown/70 dark:text-parchment/70">
                    <span>{{ quantity }} x {{ formatPrice(classEvent.price) }}</span>
                    <span>{{ formatPrice(classEvent.price * quantity) }}</span>
                  </div>
                  <template v-if="classEvent.addOns?.length">
                    <div
                      v-for="addOn in classEvent.addOns.filter(a => selectedAddOns[a.name])"
                      :key="addOn.name"
                      class="flex justify-between text-sm text-brown/70 dark:text-parchment/70"
                    >
                      <span>{{ addOn.name }} x {{ quantity }}</span>
                      <span>{{ formatPrice(addOn.price * quantity) }}</span>
                    </div>
                  </template>
                  <div class="flex justify-between font-bold text-lg pt-2 border-t border-gold/10">
                    <span>Total</span>
                    <span class="text-gold">{{ formatPrice(bookingTotal) }}</span>
                  </div>
                </div>

                <!-- Checkout button -->
                <UButton
                  block
                  :loading="checkoutLoading"
                  :disabled="!classEvent.price || bookingTotal === 0 || !canSubmit"
                  label="Proceed to Payment"
                  class="bg-gold text-espresso hover:bg-copper"
                  @click="proceedToPayment"
                />

                <p v-if="checkoutError" class="text-center text-sm text-red-500 mt-3">
                  {{ checkoutError }}
                </p>

                <p class="text-xs text-brown/40 dark:text-parchment/40 text-center mt-3">
                  You'll be redirected to Square for secure payment
                </p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
