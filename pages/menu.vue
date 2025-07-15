<script setup lang="ts">
import type { Cocktail } from "~/types";
import { UContainer } from "#components";

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
</script>

<template>
  <UContainer class="flex gap-3">
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
      <div class="grid md:grid-cols-2 gap-6 p-3 overflow-y-auto">
        <div v-for="cocktail in filteredCocktails">
          <CardCocktail :cocktail="cocktail as Cocktail" />
        </div>
      </div>
    </div>
  </UContainer>
</template>
