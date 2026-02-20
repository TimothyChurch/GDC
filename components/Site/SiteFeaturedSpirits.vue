<script setup lang="ts">
const bottleStore = useBottleStore();

const featuredBottles = ref<typeof bottleStore.bottles>([]);

onMounted(() => {
  const inStock = bottleStore.activeBottles.filter((b) => b.inStock);
  featuredBottles.value = [...inStock].sort(() => Math.random() - 0.5).slice(0, 4);
});
</script>

<template>
  <section class="py-16 sm:py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold">
          Our Spirits
        </h2>
        <div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div>
        <p class="mt-4 text-brown/70 dark:text-parchment/70 max-w-xl mx-auto">
          Small-batch spirits crafted with island character
        </p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="bottle in featuredBottles"
          :key="bottle._id"
          :to="`/bottles/${bottle._id}`"
          class="group text-center"
        >
          <div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            <img
              v-if="bottle.img"
              :src="bottle.img"
              :alt="bottle.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <Icon v-else name="carbon:wine-bottle" class="text-5xl text-brown/20 dark:text-parchment/20" />
          </div>
          <h3 class="font-[Cormorant_Garamond] text-lg font-semibold group-hover:text-gold transition-colors">
            {{ bottle.name }}
          </h3>
          <p v-if="bottle.class" class="text-sm text-brown/60 dark:text-parchment/60 mt-1">
            {{ bottle.class }}
          </p>
          <p v-if="bottle.price" class="text-sm font-semibold text-gold mt-1">
            {{ Dollar.format(bottle.price) }}
          </p>
        </NuxtLink>
      </div>

      <div class="text-center mt-10">
        <NuxtLink
          to="/bottles"
          class="inline-block rounded-md border border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
        >
          View All Spirits
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
