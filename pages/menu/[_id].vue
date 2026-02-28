<script setup lang="ts">
const route = useRoute();
const cocktailStore = usePublicCocktailStore();

await cocktailStore.ensureLoaded();

const cocktail = computed(() => cocktailStore.getCocktailById(route.params._id as string));

useSeoMeta({
  title: () => cocktail.value ? `${cocktail.value.name} | Galveston Distilling Co` : 'Cocktail | Galveston Distilling Co',
  description: () => cocktail.value?.description || 'A handcrafted cocktail from Galveston Distilling Co.',
  ogTitle: () => cocktail.value ? `${cocktail.value.name} | Galveston Distilling Co` : 'Cocktail',
  ogDescription: () => cocktail.value?.description || 'A handcrafted cocktail from Galveston Distilling Co.',
  ogImage: () => cocktail.value?.img || 'https://galvestondistilling.com/images/cocktail.jpg',
});

const formattedAmount = (amount: number): string => {
  if (amount === 0) return '';
  // Common fractional amounts
  const fractions: Record<string, string> = {
    '0.25': '\u00BC',
    '0.33': '\u2153',
    '0.5': '\u00BD',
    '0.67': '\u2154',
    '0.75': '\u00BE',
  };

  const whole = Math.floor(amount);
  const decimal = amount - whole;
  const decimalKey = decimal.toFixed(2);

  if (decimal === 0) return whole.toString();

  const fraction = fractions[decimalKey];
  if (fraction) {
    return whole > 0 ? `${whole}${fraction}` : fraction;
  }

  // Fall back to decimal display
  return amount % 1 === 0 ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, '');
};
</script>

<template>
  <!-- Not found state -->
  <div v-if="!cocktail" class="min-h-[60vh] flex flex-col items-center justify-center px-6">
    <Icon name="i-lucide-search-x" class="text-5xl text-brown/30 dark:text-parchment/30 mb-4" />
    <h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment mb-2">
      Cocktail Not Found
    </h1>
    <p class="text-brown/60 dark:text-parchment/60 mb-6">
      We couldn't find the cocktail you're looking for.
    </p>
    <NuxtLink
      to="/menu"
      class="inline-flex items-center gap-2 px-6 py-3 bg-gold text-espresso font-semibold rounded-lg hover:bg-copper transition-colors duration-300"
    >
      <Icon name="i-lucide-arrow-left" class="text-lg" />
      Back to Menu
    </NuxtLink>
  </div>

  <!-- Cocktail detail -->
  <div v-else>
    <!-- Back navigation -->
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <NuxtLink
        to="/menu"
        class="inline-flex items-center gap-1.5 text-sm text-brown/60 dark:text-parchment/60 hover:text-gold transition-colors duration-200 group"
      >
        <Icon name="i-lucide-arrow-left" class="text-base transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Menu
      </NuxtLink>
    </div>

    <!-- Hero image -->
    <div v-if="cocktail.img" class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-6">
      <div class="overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">
        <NuxtImg
          :src="cocktail.img"
          :alt="cocktail.name"
          class="w-full h-64 sm:h-80 md:h-96 object-cover"
          loading="eager"
          format="webp"
          quality="85"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Title and price -->
      <div class="text-center">
        <h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl md:text-6xl font-bold text-brown dark:text-parchment leading-tight">
          {{ cocktail.name }}
        </h1>
        <p class="mt-3 text-xl sm:text-2xl text-gold font-semibold">
          {{ Dollar.format(cocktail.price) }}
        </p>
      </div>

      <!-- Gold divider -->
      <div class="flex justify-center my-8">
        <div class="w-24 h-0.5 bg-gold/50"></div>
      </div>

      <!-- Meta info: glassware and preparation -->
      <div
        v-if="cocktail.glassware || cocktail.preparation"
        class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8"
      >
        <div v-if="cocktail.glassware" class="flex items-center gap-2 text-brown/70 dark:text-parchment/70">
          <Icon name="carbon:drink-02" class="text-lg text-gold" />
          <span class="text-sm font-medium">{{ cocktail.glassware }}</span>
        </div>
        <div
          v-if="cocktail.glassware && cocktail.preparation"
          class="w-px h-4 bg-brown/20 dark:bg-parchment/20"
        ></div>
        <div v-if="cocktail.preparation" class="flex items-center gap-2 text-brown/70 dark:text-parchment/70">
          <Icon name="i-lucide-chef-hat" class="text-lg text-gold" />
          <span class="text-sm font-medium">{{ cocktail.preparation }}</span>
        </div>
      </div>

      <!-- Description -->
      <p
        v-if="cocktail.description"
        class="text-center text-lg text-brown/80 dark:text-parchment/80 leading-relaxed max-w-2xl mx-auto mb-10"
      >
        {{ cocktail.description }}
      </p>

      <!-- Two column layout for ingredients and directions -->
      <div class="grid md:grid-cols-2 gap-8 md:gap-12">
        <!-- Ingredients -->
        <div>
          <h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-brown dark:text-parchment mb-5">
            Ingredients
          </h2>
          <ul class="space-y-3">
            <li
              v-for="(ing, idx) in cocktail.ingredients"
              :key="idx"
              class="flex items-baseline gap-3 text-brown/90 dark:text-parchment/90"
            >
              <span class="text-gold font-bold whitespace-nowrap min-w-[4.5rem] text-right tabular-nums">
                {{ formattedAmount(ing.amount) }} {{ ing.unit }}
              </span>
              <span class="font-medium">
                {{ ing.name }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Directions -->
        <div v-if="cocktail.directions">
          <h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-brown dark:text-parchment mb-5">
            Directions
          </h2>
          <p class="text-brown/80 dark:text-parchment/80 leading-relaxed whitespace-pre-line">
            {{ cocktail.directions }}
          </p>
        </div>
      </div>

      <!-- Bottom divider -->
      <div class="flex justify-center my-10 sm:my-12">
        <div class="w-16 h-0.5 bg-gold/30"></div>
      </div>

      <!-- Back to menu CTA -->
      <div class="text-center">
        <NuxtLink
          to="/menu"
          class="inline-flex items-center gap-2 px-8 py-3 bg-gold/10 text-gold border border-gold/30 font-semibold rounded-lg hover:bg-gold hover:text-espresso transition-all duration-300"
        >
          <Icon name="i-lucide-arrow-left" class="text-lg" />
          Explore More Cocktails
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
