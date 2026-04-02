<script setup lang="ts">
if (import.meta.server) {
  useSeoMeta({
    title: 'Our Spirits | Galveston Distilling Co',
    description: 'Discover our collection of small-batch spirits crafted on Galveston Island, Texas.',
    ogTitle: 'Our Spirits | Galveston Distilling Co',
    ogDescription: 'Discover our collection of small-batch spirits crafted on Galveston Island, Texas.',
    ogImage: 'https://galvestondistilling.com/images/og-spirits.jpg',
    ogUrl: 'https://galvestondistilling.com/bottles',
  });
}

const bottleStore = usePublicBottleStore();

const activeClass = ref("All");

const spiritClasses = computed(() => {
  const classes = bottleStore.activeBottles
    .map((b) => b.class)
    .filter(Boolean);
  return ["All", ...new Set(classes)];
});

const filteredBottles = computed(() => {
  if (activeClass.value === "All") return bottleStore.activeBottles;
  return bottleStore.activeBottles.filter((b) => b.class === activeClass.value);
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
      <div v-if="spiritClasses.length > 2" role="tablist" aria-label="Spirit categories" class="flex flex-wrap gap-2 mb-8 justify-center">
        <UButton
          v-for="cls in spiritClasses"
          :key="cls"
          role="tab"
          :aria-selected="activeClass === cls"
          :label="cls"
          size="sm"
          :variant="activeClass === cls ? 'solid' : 'soft'"
          :class="
            activeClass === cls
              ? 'bg-gold text-espresso'
              : 'bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-gold/20'
          "
          class="rounded-full"
          @click="activeClass = cls"
        />
      </div>

      <!-- Bottle grid -->
      <div v-if="bottleStore.loading" class="flex justify-center py-12">
        <span class="text-brown/50 dark:text-parchment/50">Loading spirits...</span>
      </div>
      <div v-else-if="filteredBottles.length === 0" class="text-center py-12">
        <Icon name="lucide:wine" class="text-4xl text-brown/20 dark:text-parchment/20 mb-3" />
        <p class="text-brown/50 dark:text-parchment/50">No spirits found</p>
        <UButton
          v-if="activeClass !== 'All'"
          variant="link"
          label="Show all spirits"
          class="mt-3 text-gold hover:text-copper"
          @click="activeClass = 'All'"
        />
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
