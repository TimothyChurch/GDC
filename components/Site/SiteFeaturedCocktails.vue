<script setup lang="ts">
const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const featuredCocktails = computed(() => {
  const visible = cocktailStore.cocktails.filter((c) => c.visible !== false);
  return [...visible].sort(() => Math.random() - 0.5).slice(0, 3);
});

const getIngredientNames = (cocktail: { ingredients: { item: string; amount: number; unit: string }[] }) => {
  return cocktail.ingredients
    .map((ing) => itemStore.getItemById(ing.item.toString())?.name)
    .filter(Boolean)
    .join(", ");
};
</script>

<template>
  <section class="py-16 sm:py-24 bg-charcoal/5 dark:bg-parchment/5">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold">
          From Our Bar
        </h2>
        <div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div>
        <p class="mt-4 text-brown/70 dark:text-parchment/70 max-w-xl mx-auto">
          Handcrafted cocktails featuring our house-distilled spirits
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="cocktail in featuredCocktails"
          :key="cocktail._id"
          class="bg-cream dark:bg-charcoal rounded-lg p-6 border border-gold/10 hover:border-gold/30 transition-colors duration-300"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-[Cormorant_Garamond] text-xl font-bold">
              {{ cocktail.name }}
            </h3>
            <span class="text-gold font-semibold whitespace-nowrap ml-3">
              {{ Dollar.format(cocktail.price) }}
            </span>
          </div>
          <div class="w-8 h-0.5 bg-gold/40 mb-3"></div>
          <p v-if="cocktail.description" class="text-sm text-brown/70 dark:text-parchment/70 mb-3">
            {{ cocktail.description }}
          </p>
          <p class="text-xs italic text-brown/50 dark:text-parchment/50">
            {{ getIngredientNames(cocktail) }}
          </p>
        </div>
      </div>

      <div class="text-center mt-10">
        <NuxtLink
          to="/menu"
          class="inline-block rounded-md border border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
        >
          View Full Menu
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
