<script setup lang="ts">
const route = useRoute();
const bottleStore = useBottleStore();
const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const bottle = computed(() => {
  const b = bottleStore.getBottleById(route.params.id as string);
  if (b?.archived) return undefined;
  return b;
});

const relatedCocktails = computed(() => {
  if (!bottle.value) return [];

  // Use bottle type (e.g. "Vodka", "Bourbon Whisky") as the primary match term.
  // Fall back to class only for simple single-concept classes (e.g. "Gin", "Rum")
  // but NOT compound ones like "Liqueur/Cordial" or "Neutral Spirits or Alcohol".
  const bottleType = bottle.value.type && bottle.value.type !== 'N/A'
    ? bottle.value.type.toLowerCase()
    : null;
  const bottleClass = bottle.value.class?.toLowerCase();
  const typeTerm = bottleType
    || (bottleClass && !bottleClass.includes('/') && !bottleClass.includes(' or ') ? bottleClass : null);
  const bottleName = bottle.value.name?.toLowerCase();

  if (!typeTerm && !bottleName) return [];

  return cocktailStore.cocktails
    .filter((c) => c.visible !== false)
    .filter((c) =>
      c.ingredients.some((ing) => {
        const item = itemStore.getItemById(ing.item.toString());
        if (!item) return false;
        const itemType = item.type?.toLowerCase() || '';
        const itemName = item.name?.toLowerCase() || '';

        // Type-based: "Bourbon" ↔ "Bourbon Whisky", "Vodka" ↔ "Vodka"
        if (typeTerm && itemType && (itemType.includes(typeTerm) || typeTerm.includes(itemType))) {
          return true;
        }
        // Name-based: ingredient named "Allspice Dram" ↔ bottle named "Allspice Dram"
        if (bottleName && itemName && (itemName.includes(bottleName) || bottleName.includes(itemName))) {
          return true;
        }
        return false;
      })
    )
    .slice(0, 3);
});

const proof = computed(() => {
  if (!bottle.value?.abv) return null;
  return (bottle.value.abv * 2).toFixed(0);
});

useSeoMeta({
  title: () => bottle.value ? `${bottle.value.name} | Galveston Distilling Co` : 'Spirit Details | Galveston Distilling Co',
  description: () => bottle.value?.description || 'Handcrafted spirit from Galveston Distilling Co.',
});
</script>

<template>
  <div>
    <div v-if="!bottle" class="flex flex-col items-center justify-center py-24">
      <Icon name="carbon:wine-bottle" class="text-5xl text-brown/20 dark:text-parchment/20 mb-4" />
      <p class="text-brown/50 dark:text-parchment/50 text-lg">Bottle not found</p>
      <NuxtLink
        to="/bottles"
        class="mt-4 text-gold hover:text-copper transition-colors text-sm font-semibold"
      >
        &larr; Back to all spirits
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Product Header -->
      <div class="bg-charcoal/5 dark:bg-parchment/5">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <NuxtLink
            to="/bottles"
            class="inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors mb-6"
          >
            <Icon name="carbon:arrow-left" />
            Back to all spirits
          </NuxtLink>

          <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <!-- Bottle image -->
            <div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                v-if="bottle.img"
                :src="bottle.img"
                :alt="bottle.name"
                class="w-full h-full object-cover"
              />
              <Icon v-else name="carbon:wine-bottle" class="text-8xl text-brown/10 dark:text-parchment/10" />
            </div>

            <!-- Bottle details -->
            <div>
              <div class="flex flex-wrap gap-2 mb-3">
                <span v-if="bottle.class" class="text-xs bg-gold/15 text-gold px-3 py-1 rounded-full font-semibold">
                  {{ bottle.class }}
                </span>
                <span v-if="bottle.type && bottle.type !== 'N/A'" class="text-xs bg-copper/15 text-copper px-3 py-1 rounded-full font-semibold">
                  {{ bottle.type }}
                </span>
              </div>

              <h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl font-bold leading-tight">
                {{ bottle.name }}
              </h1>

              <div class="flex items-center gap-4 mt-4">
                <span v-if="bottle.price" class="text-2xl font-bold text-gold">
                  {{ Dollar.format(bottle.price) }}
                </span>
                <span
                  v-if="bottle.inStock !== false"
                  class="text-xs bg-green-500/15 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-semibold"
                >
                  In Stock
                </span>
                <span
                  v-else
                  class="text-xs bg-red-500/15 text-red-500 px-3 py-1 rounded-full font-semibold"
                >
                  Out of Stock
                </span>
              </div>

              <div class="w-12 h-0.5 bg-gold/40 my-6"></div>

              <p v-if="bottle.description" class="text-brown/70 dark:text-parchment/70 leading-relaxed text-lg">
                {{ bottle.description }}
              </p>

              <!-- Specs -->
              <div class="mt-8 grid grid-cols-2 gap-4">
                <div v-if="bottle.abv" class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                  <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">ABV</span>
                  <p class="text-xl font-bold mt-1">{{ bottle.abv }}%</p>
                </div>
                <div v-if="proof" class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                  <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Proof</span>
                  <p class="text-xl font-bold mt-1">{{ proof }}</p>
                </div>
                <div v-if="bottle.class" class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                  <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Class</span>
                  <p class="text-lg font-semibold mt-1">{{ bottle.class }}</p>
                </div>
                <div v-if="bottle.type && bottle.type !== 'N/A'" class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10">
                  <span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Type</span>
                  <p class="text-lg font-semibold mt-1">{{ bottle.type }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related cocktails -->
      <div v-if="relatedCocktails.length" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-8">
          <h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold">
            Cocktails Featuring This Spirit
          </h2>
          <div class="mt-3 w-12 h-0.5 bg-gold mx-auto"></div>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <CardCocktail
            v-for="cocktail in relatedCocktails"
            :key="cocktail._id"
            :cocktail="cocktail"
          />
        </div>
      </div>
    </div>
  </div>
</template>
