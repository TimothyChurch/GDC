<script setup lang="ts">
import type { Cocktail } from "~/types";
import type { ObjectId } from "mongodb";
import { UContainer } from "#components";
import type { TabsItem } from "@nuxt/ui";

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const search = ref("");
const base = ref("all");

const items = ref([
  {
    label: "All Cocktails",
    value: "all",
  },
  {
    label: "Vodka",
    value: "vodka",
  },
  {
    label: "Gin",
    value: "gin",
  },
  {
    label: "Rum",
    value: "rum",
  },
  {
    label: "Whiskey",
    value: "whiskey",
  },
  {
    label: "Liqueur",
    value: "liqueur",
  },
]);

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
const baseFilter = computed(() => {
  if (base.value === "all") {
    return cocktailStore.cocktails;
  } else {
    return cocktailStore.cocktails.filter(
      (cocktail) =>
        cocktail.name.toLowerCase().includes(base.value.toLowerCase()) ||
        cocktail.ingredients.some((ingredient) =>
          itemStore
            .getItemById(ingredient.item as unknown as string)
            ?.name.toLowerCase()
            .includes(base.value.toLowerCase())
        )
    );
  }
});
const menuFilter = computed(() => {});
const ingredientFilter = computed(() => {});
</script>

<template>
  <UContainer class="flex gap-3">
    <!-- <div>
      {{ base }}
      <UTabs
        v-model="base"
        orientation="vertical"
        variant="pill"
        :content="false"
        :items="items"
        class="w-full"
        color="neutral"
      />
    </div> -->
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
      <div class="grid grid-cols-2 gap-6 p-3 overflow-y-auto">
        <div v-for="cocktail in filteredCocktails">
          <CardCocktail :cocktail="cocktail as Cocktail" />
        </div>
      </div>
    </div>
  </UContainer>
</template>
