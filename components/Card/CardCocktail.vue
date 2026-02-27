<script setup lang="ts">
import type { PublicCocktail } from "~/types";

const props = defineProps<{
  cocktail: PublicCocktail;
}>();

const ingredientNames = computed(() => {
  return props.cocktail.ingredients
    .map((ing) => ing.name)
    .filter((name) => name && name !== 'Unknown')
    .join(", ");
});
</script>

<template>
  <NuxtLink
    :to="`/menu/${cocktail._id}`"
    class="block bg-cream dark:bg-charcoal rounded-lg p-5 border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="font-[Cormorant_Garamond] text-xl sm:text-2xl font-bold leading-tight">
        {{ cocktail.name }}
      </h3>
      <span class="text-gold font-bold text-lg whitespace-nowrap">
        {{ Dollar.format(cocktail.price) }}
      </span>
    </div>

    <div class="w-10 h-0.5 bg-gold/40 my-3"></div>

    <p v-if="cocktail.description" class="text-sm text-brown/70 dark:text-parchment/70 mb-3 leading-relaxed">
      {{ cocktail.description }}
    </p>

    <p class="text-xs italic text-brown/50 dark:text-parchment/50">
      {{ ingredientNames }}
    </p>

    <div v-if="cocktail.glassware" class="mt-3 flex items-center gap-1.5 text-xs text-brown/60 dark:text-parchment/60">
      <Icon name="carbon:drink-02" class="text-sm" />
      <span>{{ cocktail.glassware }}</span>
    </div>
  </NuxtLink>
</template>
