<script setup lang="ts">
import type { Cocktail } from "~/types";
import type { ObjectId } from "mongodb";
const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const search = ref("");

const filteredCocktails = computed(() => {
  return cocktailStore.cocktails.filter(
    (cocktail) =>
      cocktail.name.toLowerCase().includes(search.value.toLowerCase()) ||
      cocktail.ingredients.some((ingredient) =>
        itemStore
          .getItemById(ingredient.item as unknown as string)
          ?.name.toLowerCase()
          .includes(search.value.toLowerCase())
      )
  );
});
const menuFilter = computed(() => {});
const ingredientFilter = computed(() => {});
</script>

<template>
  <div class="flex flex-col gap-3">
    <UInput
      type="text"
      v-model="search"
      placeholder="Search for cocktails"
      class="w-80 self-center"
      :ui="{ trailing: 'pe-1' }"
    >
      <template v-if="search?.length" #trailing>
        <UButton
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
          @click="search = ''"
        />
      </template>
    </UInput>
    <div class="grid grid-cols-6 gap-3">
      <div v-for="cocktail in filteredCocktails">
        <CardCocktail :cocktail="cocktail as Cocktail" />
      </div>
    </div>
  </div>
</template>
