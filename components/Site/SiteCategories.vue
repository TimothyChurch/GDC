<script setup>
const categories = [
  {
    name: "Handcrafted Collection",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-01.jpg",
    imageAlt:
      "Brown leather key ring with brass metal loops and rivets on wood table.",
    description:
      "Keep your phone, keys, and wallet together, so you can lose everything at once.",
  },
  {
    name: "Organized Desk Collection",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-02.jpg",
    imageAlt:
      "Natural leather mouse pad on white desk next to porcelain mug and keyboard.",
    description:
      "The rest of the house will still be a mess, but your desk will look great.",
  },
  {
    name: "Focus Collection",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-01-collection-03.jpg",
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
    <h2 class="text-2xl font-bold tracking-tight text-gray-900">
      Shop by Collection
    </h2>
    <p class="mt-4 text-base text-gray-500">
      Each season, we collaborate with world-class designers to create a
      collection inspired by the natural world.
    </p>

    <div
      class="mt-10 space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-8"
    >
      <a
        v-for="category in categories"
        :key="category.name"
        :href="category.href"
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
        <p class="mt-2 text-sm text-gray-500">{{ category.description }}</p>
      </a>
    </div>
  </div>
</template>
