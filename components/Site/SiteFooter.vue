<script setup></script>

<template>
  <footer class="bg-charcoal text-parchment/90">
    <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div class="flex justify-center mb-8">
        <img
          src="/images/Logo.png"
          alt="Galveston Distilling Company"
          class="h-24"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Location</span>
          <span class="text-sm">2618 Market St.</span>
          <span class="text-sm">Galveston, TX 77550</span>
          <a
            href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550"
            target="_blank"
            rel="noopener"
            class="text-sm text-gold hover:text-copper transition-colors mt-1"
          >
            Get Directions
          </a>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Hours</span>
          <span class="text-sm">Monday - Saturday</span>
          <span class="text-sm">11:00 AM - 11:00 PM</span>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Quick Links</span>
          <NuxtLink to="/menu" class="text-sm text-parchment/80 hover:text-gold transition-colors">Cocktail Menu</NuxtLink>
          <NuxtLink to="/bottles" class="text-sm text-parchment/80 hover:text-gold transition-colors">Our Spirits</NuxtLink>
          <NuxtLink to="/events" class="text-sm text-parchment/80 hover:text-gold transition-colors">Events</NuxtLink>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-lg font-bold text-gold font-[Cormorant_Garamond]">Contact</span>
          <a href="mailto:Timothy@GalvestonDistillingCo.com" class="text-sm text-parchment/80 hover:text-gold transition-colors break-all">
            Timothy@GalvestonDistillingCo.com
          </a>
          <a href="tel:14093513248" class="text-sm text-parchment/80 hover:text-gold transition-colors">
            (409) 351-3248
          </a>
        </div>
      </div>

      <div class="flex justify-center gap-6 mt-10">
        <a href="https://www.instagram.com/galvestondistilling/" target="_blank" rel="noopener" aria-label="Instagram" class="text-parchment/60 hover:text-gold transition-colors">
          <Icon name="carbon:logo-instagram" class="text-xl" />
        </a>
        <a href="https://www.facebook.com/GalvestonDistilling/" target="_blank" rel="noopener" aria-label="Facebook" class="text-parchment/60 hover:text-gold transition-colors">
          <Icon name="carbon:logo-facebook" class="text-xl" />
        </a>
      </div>

      <div class="border-t border-parchment/10 mt-8 pt-6 text-center">
        <p class="text-xs text-parchment/40">
          &copy; {{ new Date().getFullYear() }} Galveston Distilling Company. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
