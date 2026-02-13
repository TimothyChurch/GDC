<script setup>
const categories = [
  {
    name: "Cocktail Collection",
    href: "/menu",
    imageSrc: "/images/cocktail.jpg",
    imageAlt: "Handcrafted cocktail featuring house-distilled spirits",
    description:
      "Handcrafted cocktails featuring our house-distilled spirits, designed to showcase the unique character of each bottle.",
  },
  {
    name: "Bottles",
    href: "/bottles",
    imageSrc: "/images/absinthe.jpg",
    imageAlt: "Small-batch craft spirits bottle",
    description:
      "Our full lineup of small-batch spirits — from smooth vodkas to complex whiskeys, each crafted with island character.",
  },
  {
    name: "Events",
    href: "/events",
    imageSrc: "/images/class.jpg",
    imageAlt: "Cocktail class at the distillery tasting room",
    description:
      "Join us for cocktail classes, distillery tours, tastings, and more at our Galveston tasting room.",
  },
];
</script>

<template>
  <div
    class="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8"
  >
    <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-center mb-12">
      Discover Galveston Distilling
    </h2>
    <div
      class="mt-10 space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-8"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category.name"
        :to="category.href"
        class="group block"
      >
        <div class="overflow-hidden rounded-lg">
          <img
            :src="category.imageSrc"
            :alt="category.imageAlt"
            class="aspect-3/2 w-full object-cover group-hover:scale-105 transition-transform duration-500 lg:aspect-5/6"
            loading="lazy"
          />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-brown dark:text-parchment font-[Cormorant_Garamond]">
          {{ category.name }}
        </h3>
        <p class="mt-2 text-sm text-brown/70 dark:text-parchment/70">
          {{ category.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
