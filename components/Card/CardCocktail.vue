<script setup lang="ts">
import type { Cocktail } from "~/types";

defineProps<{
  cocktail: Cocktail;
}>();

const itemStore = useItemStore();
const bottleStore = useBottleStore();
</script>

<template>
  <UCard class="h-full bg-[var(--shadow)]">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">{{ cocktail.name }}</h3>
        <span class="text-lg font-bold">{{
          Dollar.format(cocktail.price)
        }}</span>
      </div>
    </template>

    <div>
      <p class="text-sm text-gray-600">{{ cocktail.description }}</p>

      <div class="grid">
        <div v-for="ingredient in cocktail.ingredients" class="text-sm flex">
          {{ itemStore.getItemById(ingredient.item.toString())?.name }}
        </div>
      </div>
    </div>

    <template #footer>
      <p class="text-sm text-gray-500">
        Served in: {{ cocktail.glassware }} Glass
      </p>
    </template>
  </UCard>
</template>

<style scoped>
.u-card {
  display: flex;
  flex-direction: column;
}

.u-card__body {
  flex-grow: 1;
}
</style>
