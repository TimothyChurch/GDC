<script setup lang="ts">
const bottleStore = useBottleStore();

const activeClass = ref("All");

const spiritClasses = computed(() => {
  const classes = bottleStore.bottles
    .map((b) => b.class)
    .filter(Boolean);
  return ["All", ...new Set(classes)];
});

const filteredBottles = computed(() => {
  if (activeClass.value === "All") return bottleStore.bottles;
  return bottleStore.bottles.filter((b) => b.class === activeClass.value);
});
</script>

<template>
  <div>
    <SitePageHero
      title="Our Spirits"
      subtitle="Small-batch spirits crafted with island character"
      background-image="/images/absinthe.jpg"
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <!-- Spirit class filter tabs -->
      <div v-if="spiritClasses.length > 2" class="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          v-for="cls in spiritClasses"
          :key="cls"
          @click="activeClass = cls"
          class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200"
          :class="
            activeClass === cls
              ? 'bg-gold text-espresso'
              : 'bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-gold/20'
          "
        >
          {{ cls }}
        </button>
      </div>

      <!-- Bottle grid -->
      <div v-if="bottleStore.loading" class="flex justify-center py-12">
        <span class="text-brown/50 dark:text-parchment/50">Loading spirits...</span>
      </div>
      <div v-else-if="filteredBottles.length === 0" class="text-center py-12">
        <Icon name="carbon:wine-bottle" class="text-4xl text-brown/20 dark:text-parchment/20 mb-3" />
        <p class="text-brown/50 dark:text-parchment/50">No spirits found</p>
        <button
          v-if="activeClass !== 'All'"
          @click="activeClass = 'All'"
          class="mt-3 text-sm text-gold hover:text-copper transition-colors bg-transparent"
        >
          Show all spirits
        </button>
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <CardBottle
          v-for="bottle in filteredBottles"
          :key="bottle._id"
          :bottle="bottle"
        />
      </div>
    </div>
  </div>
</template>
