<script setup lang="ts">
import type { Cocktail } from "~/types";

const props = defineProps<{
  cocktail: Cocktail;
}>();

const itemStore = useItemStore();
const cocktailIngredients = computed(() => {
  const ingredientString = ref("");
  props.cocktail.ingredients.forEach((ingredient) => {
    ingredientString.value += `${
      itemStore.getItemById(ingredient.item.toString())?.name
    }, `;
  });
  ingredientString.value = ingredientString.value.slice(0, -2); // Remove trailing comma and space
  return ingredientString;
});
</script>

<template>
  <div>
    <div>
      <div class="flex justify-between text-2xl">
        <h1>{{ cocktail.name }}</h1>
        <h1>{{ Dollar.format(cocktail.price) }}</h1>
      </div>
      <p class="text-sm py-2">
        {{ cocktailIngredients }}
        <!-- {{ itemStore.getItemById(ingredient.item)?.name }} -->
      </p>
    </div>
  </div>
</template>

<style scoped></style>
