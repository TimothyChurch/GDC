<script setup lang="ts">
const cocktailStore = useCocktailStore();

const search = ref("");

const filteredCocktails = computed(() => {
  return cocktailStore.cocktails.filter((cocktail) =>
    cocktail.name.toLowerCase().includes(search.value.toLowerCase())
  );
});
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
      <div v-for="cocktail in cocktailStore.cocktails">
        <CardCocktail :cocktail="cocktail" />
      </div>
    </div>
  </div>
</template>
