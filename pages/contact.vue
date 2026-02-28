<script setup lang="ts">
useServerSeoMeta({
  title: 'Contact Us | Galveston Distilling Co',
  description: 'Get in touch with Galveston Distilling Co. Ask questions, inquire about private events, or reach out about wholesale opportunities.',
  ogTitle: 'Contact Us | Galveston Distilling Co',
  ogDescription: 'Get in touch with Galveston Distilling Co. Ask questions, inquire about private events, or reach out about wholesale opportunities.',
  ogImage: 'https://galvestondistilling.com/images/og-contact.jpg',
  ogUrl: 'https://galvestondistilling.com/contact',
});

const route = useRoute();

const topicMap: Record<string, string> = {
  'private-events': 'Private Events',
  'tours': 'Distillery Tours',
  'wholesale': 'Wholesale / Distribution',
};

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const topic = ref(topicMap[route.query.topic as string] || '');
const message = ref('');
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const responseMessage = ref('');

const topics = [
  'General Inquiry',
  'Private Events',
  'Distillery Tours',
  'Wholesale / Distribution',
  'Other',
];

const submit = async () => {
  if (!email.value || !topic.value || !message.value) return;
  status.value = 'loading';
  try {
    const data = await $fetch<{ message: string }>('/api/contact/inquiry', {
      method: 'POST',
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phone: phone.value || undefined,
        topic: topic.value,
        message: message.value,
      },
    });
    status.value = 'success';
    responseMessage.value = data.message || "Thanks for reaching out! We'll get back to you soon.";
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    phone.value = '';
    topic.value = '';
    message.value = '';
  } catch (e: any) {
    status.value = 'error';
    responseMessage.value = e?.data?.data?.[0] || 'Something went wrong. Please try again.';
  }
};

const inputClass = 'w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2.5 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6';
</script>

<template>
  <div>
    <SitePageHero
      title="Contact Us"
      subtitle="Have a question or want to plan an event? We'd love to hear from you."
      background-image="/images/20231205_174024 (3).jpg"
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        <!-- Contact Form -->
        <div class="lg:col-span-3">
          <h2 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">
            Send Us a Message
          </h2>
          <div class="mt-3 w-12 h-0.5 bg-gold"></div>
          <p class="mt-4 text-brown/70 dark:text-parchment/70">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          <!-- Success State -->
          <div v-if="status === 'success'" class="mt-8 rounded-xl bg-green-500/10 border border-green-500/20 p-8 text-center">
            <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="carbon:checkmark" class="text-2xl text-green-500" />
            </div>
            <h3 class="text-lg font-semibold text-brown dark:text-parchment">Message Sent!</h3>
            <p class="mt-2 text-brown/70 dark:text-parchment/70">{{ responseMessage }}</p>
            <button
              @click="status = 'idle'"
              class="mt-6 rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"
            >
              Send Another Message
            </button>
          </div>

          <!-- Form -->
          <form v-else class="mt-8 space-y-5" @submit.prevent="submit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  autocomplete="given-name"
                  required
                  :disabled="status === 'loading'"
                  :class="inputClass"
                  placeholder="First name"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="lastName"
                  type="text"
                  autocomplete="family-name"
                  required
                  :disabled="status === 'loading'"
                  :class="inputClass"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="email" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  :disabled="status === 'loading'"
                  :class="inputClass"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                  Phone
                </label>
                <input
                  id="phone"
                  v-model="phone"
                  type="tel"
                  autocomplete="tel"
                  :disabled="status === 'loading'"
                  :class="inputClass"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label for="topic" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                Topic <span class="text-red-500">*</span>
              </label>
              <select
                id="topic"
                v-model="topic"
                required
                :disabled="status === 'loading'"
                :class="inputClass"
              >
                <option value="" disabled>Select a topic...</option>
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5">
                Message <span class="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                v-model="message"
                rows="5"
                required
                :disabled="status === 'loading'"
                :class="inputClass"
                placeholder="Tell us what you have in mind..."
              />
            </div>

            <div>
              <button
                type="submit"
                :disabled="status === 'loading'"
                class="rounded-md bg-gold px-8 py-3 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300 disabled:opacity-50"
              >
                {{ status === 'loading' ? 'Sending...' : 'Send Message' }}
              </button>
            </div>

            <p v-if="status === 'error'" class="text-sm text-red-500">
              {{ responseMessage }}
            </p>
          </form>
        </div>

        <!-- Sidebar Info -->
        <div class="lg:col-span-2">
          <div class="space-y-8">
            <!-- Visit Us -->
            <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6">
              <h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">
                <Icon name="carbon:location" class="text-gold" />
                Visit Us
              </h3>
              <div class="mt-4 space-y-1 text-sm text-brown/80 dark:text-parchment/80">
                <p>2618 Market St.</p>
                <p>Galveston, TX 77550</p>
              </div>
              <a
                href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550"
                target="_blank"
                rel="noopener"
                class="inline-block mt-3 text-sm font-semibold text-gold hover:text-copper transition-colors"
              >
                Get Directions &rarr;
              </a>
            </div>

            <!-- Hours -->
            <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6">
              <h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">
                <Icon name="carbon:time" class="text-gold" />
                Hours
              </h3>
              <div class="mt-4 space-y-1 text-sm text-brown/80 dark:text-parchment/80">
                <p>Monday - Saturday</p>
                <p>11:00 AM - 11:00 PM</p>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6">
              <h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">
                <Icon name="carbon:email" class="text-gold" />
                Direct Contact
              </h3>
              <div class="mt-4 space-y-3">
                <a
                  href="mailto:Timothy@GalvestonDistillingCo.com"
                  class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors"
                >
                  <Icon name="carbon:email" class="text-gold/60" />
                  Timothy@GalvestonDistillingCo.com
                </a>
                <a
                  href="tel:14093513248"
                  class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors"
                >
                  <Icon name="carbon:phone" class="text-gold/60" />
                  (409) 351-3248
                </a>
              </div>
            </div>

            <!-- Social -->
            <div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6">
              <h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">
                <Icon name="carbon:share" class="text-gold" />
                Follow Us
              </h3>
              <div class="mt-4 flex gap-4">
                <a
                  href="https://www.instagram.com/galvestondistillingco/"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors"
                >
                  <Icon name="carbon:logo-instagram" class="text-lg" />
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/GalvestonDistillingCo/"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors"
                >
                  <Icon name="carbon:logo-facebook" class="text-lg" />
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
