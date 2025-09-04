<script setup>
const categories = [
  {
    name: "Cocktail Collection",
    href: "/menu",
    imageSrc: "/images/cocktail.jpg",
    imageAlt: "Whiskey sour in front of Barley",
    description:
      "Keep your phone, keys, and wallet together, so you can lose everything at once.",
  },
  {
    name: "Bottles",
    href: "/bottles",
    imageSrc: "/images/absinthe.jpg",
    imageAlt: "Absinthe Bottle",
    description:
      "The rest of the house will still be a mess, but your desk will look great.",
  },
  {
    name: "Events",
    href: "/events",
    imageSrc: "/images/class.jpg",
    imageAlt:
      "Person placing task list card into walnut card holder next to felt carrying case on leather desk pad.",
    description:
      "Be more productive than enterprise project managers with a single piece of paper.",
  },
];
</script>

<template>
  <div
    class="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8"
  >
    <div
      class="mt-10 space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-8"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category.name"
        :to="category.href"
        class="group block"
      >
        <img
          :src="category.imageSrc"
          :alt="category.imageAlt"
          class="aspect-3/2 w-full rounded-lg object-cover group-hover:opacity-75 lg:aspect-5/6"
        />
        <h3 class="mt-4 text-base font-semibold text-gray-900">
          {{ category.name }}
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ category.description }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
