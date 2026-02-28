<script setup lang="ts">
useServerSeoMeta({
  title: 'Events | Galveston Distilling Co',
  description: 'Book cocktail classes, distillery tours, and spirit tastings at Galveston Distilling Co.',
  ogTitle: 'Events | Galveston Distilling Co',
  ogDescription: 'Book cocktail classes, distillery tours, and spirit tastings at Galveston Distilling Co.',
  ogImage: 'https://galvestondistilling.com/images/og-events.jpg',
  ogUrl: 'https://galvestondistilling.com/events',
});
</script>

<template>
  <div>
    <SitePageHero
      title="Events & Experiences"
      subtitle="Join us at our Galveston tasting room for classes, tours, and more"
      background-image="/images/class.jpg"
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <!-- Recurring Events -->
      <div class="text-center mb-12">
        <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold">
          What We Offer
        </h2>
        <div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <!-- Cocktail Classes -->
        <NuxtLink
          to="/events/cocktailClass"
          class="group bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <NuxtImg
              src="/images/class.jpg"
              alt="Cocktail Class"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              width="400"
              height="300"
              loading="lazy"
              format="webp"
            />
          </div>
          <div class="p-6">
            <h3 class="font-[Cormorant_Garamond] text-xl font-bold group-hover:text-gold transition-colors">
              Cocktail Classes
            </h3>
            <p class="mt-2 text-sm text-brown/70 dark:text-parchment/70">
              Learn to craft cocktails from our expert bartenders. Perfect for date nights, team outings, or anyone who wants to up their mixology game.
            </p>
            <span class="inline-block mt-4 text-sm font-semibold text-gold">
              Learn More &rarr;
            </span>
          </div>
        </NuxtLink>

        <!-- Distillery Tours -->
        <div class="bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10">
          <div class="aspect-[4/3] overflow-hidden">
            <NuxtImg
              src="/images/20231017_104945.jpg"
              alt="Distillery Tour"
              class="w-full h-full object-cover"
              width="400"
              height="300"
              loading="lazy"
              format="webp"
            />
          </div>
          <div class="p-6">
            <h3 class="font-[Cormorant_Garamond] text-xl font-bold">
              Distillery Tours
            </h3>
            <p class="mt-2 text-sm text-brown/70 dark:text-parchment/70">
              Go behind the scenes and see how we craft our spirits. Walk through the mashing, fermentation, and distillation processes with our distillers.
            </p>
            <span class="inline-block mt-4 text-sm text-brown/50 dark:text-parchment/50">
              Drop in during business hours
            </span>
          </div>
        </div>

        <!-- Tastings -->
        <div class="bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10">
          <div class="aspect-[4/3] overflow-hidden bg-charcoal/5 dark:bg-parchment/5 flex items-center justify-center">
            <NuxtImg
              src="/images/cocktail.jpg"
              alt="Spirit Tastings"
              class="w-full h-full object-cover"
              width="400"
              height="300"
              loading="lazy"
              format="webp"
            />
          </div>
          <div class="p-6">
            <h3 class="font-[Cormorant_Garamond] text-xl font-bold">
              Spirit Tastings
            </h3>
            <p class="mt-2 text-sm text-brown/70 dark:text-parchment/70">
              Sample our full lineup of small-batch spirits. Our knowledgeable staff will guide you through tasting notes, production methods, and food pairings.
            </p>
            <span class="inline-block mt-4 text-sm text-brown/50 dark:text-parchment/50">
              Available daily at the tasting room
            </span>
          </div>
        </div>
      </div>

      <!-- Private Events CTA -->
      <div class="relative rounded-xl overflow-hidden">
        <NuxtImg
          src="/images/20231205_174024 (3).jpg"
          alt="Private events at Galveston Distilling"
          class="absolute inset-0 w-full h-full object-cover"
          width="1200"
          height="600"
          loading="lazy"
          format="webp"
        />
        <div class="absolute inset-0 bg-espresso/70"></div>
        <div class="relative z-10 text-center px-6 py-16 sm:py-20">
          <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-parchment">
            Host Your Event With Us
          </h2>
          <p class="mt-4 text-parchment/80 max-w-xl mx-auto">
            Looking for a unique venue? Our tasting room is available for private events, corporate gatherings, and celebrations. Let us create a custom experience for your group.
          </p>
          <NuxtLink
            to="/contact?topic=private-events"
            class="inline-block mt-8 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"
          >
            Contact Us About Private Events
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
