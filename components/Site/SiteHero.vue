<script setup></script>

<template>
  <div class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
    <NuxtImg
      src="/images/hero.jpg"
      alt="Galveston Craft Spirits Distillery"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
      width="1920"
      height="1080"
      format="webp"
      quality="80"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/50 to-espresso/30"></div>

    <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
      <h1
        class="font-[Cormorant_Garamond] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-parchment drop-shadow-lg"
      >
        Crafting Spirits with Island Flair
      </h1>
      <p
        class="mt-6 text-lg sm:text-xl text-parchment/85 max-w-2xl mx-auto leading-relaxed"
      >
        Nestled in the heart of Galveston, our small-batch distillery
        captures the essence of the island in every bottle.
      </p>
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/bottles"
          class="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-espresso shadow-md hover:bg-copper transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Explore Our Spirits
        </NuxtLink>
        <NuxtLink
          to="/menu"
          class="rounded-md border border-parchment/50 px-6 py-3 text-sm font-semibold text-parchment hover:bg-parchment/10 transition-colors duration-300"
        >
          View Cocktail Menu
        </NuxtLink>
      </div>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
      <Icon name="carbon:chevron-down" class="text-parchment/60 text-2xl" />
    </div>
  </div>
</template>
