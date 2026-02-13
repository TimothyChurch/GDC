<script setup></script>

<template>
  <section class="relative py-24 overflow-hidden">
    <img
      src="/images/20231017_104945.jpg"
      alt="Galveston Distilling tasting room"
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
    <div class="absolute inset-0 bg-espresso/75"></div>

    <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
      <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl md:text-5xl font-bold text-parchment">
        Visit Our Tasting Room
      </h2>
      <div class="mt-4 w-16 h-0.5 bg-gold mx-auto"></div>
      <p class="mt-6 text-parchment/80 text-lg max-w-xl mx-auto">
        2618 Market St, Galveston, TX 77550
      </p>
      <p class="text-parchment/60 mt-1">
        Monday - Saturday &middot; 11:00 AM - 11:00 PM
      </p>
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550"
          target="_blank"
          rel="noopener"
          class="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"
        >
          Get Directions
        </a>
        <NuxtLink
          to="/events"
          class="rounded-md border border-parchment/50 px-6 py-3 text-sm font-semibold text-parchment hover:bg-parchment/10 transition-colors duration-300"
        >
          Upcoming Events
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
