<script setup lang="ts">
const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const selectedCocktails = ref<Cocktail[]>([]);

const printCocktails = () => {
  window.print();
};
</script>

<template>
  <div class="flex gap-5">
    <div>
      <div class="flex gap-2 print:hidden">
        <UButton @click="printCocktails()">Print Cocktails</UButton>
        <UButton @click="selectedCocktails = []">Clear Selection</UButton>
      </div>
      <div id="sheet" class="print:text-black">
        <div class="grid grid-cols-4 w-[210mm]">
          <div
            v-for="cocktail in selectedCocktails"
            :key="cocktail._id.toString()"
            class="outline-2 flex flex-col"
          >
            <div class="outline-1 text-center p-1 font-bold">
              {{ cocktail.name }}
            </div>
            <div class="outline-1 px-2 flex-grow">
              <div
                v-for="ingredient in cocktail.ingredients"
                :key="ingredient.item.toString()"
                class="flex justify-between gap-2"
              >
                <div>
                  {{ itemStore.getItemById(ingredient.item.toString())?.name }}
                </div>
                <div>{{ ingredient.amount }} {{ ingredient.unit }}</div>
              </div>
            </div>
            <div class="outline-1 p-1 text-center text-sm">
              <div class="">{{ cocktail.glassware }}</div>
              <div>{{ cocktail.directions }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="h-100 p-10 overflow-y-auto print:hidden">
      <UCheckboxGroup
        v-model="selectedCocktails"
        :items="
          cocktailStore.cocktails.map((cocktail) => {
            return { label: cocktail.name, value: cocktail };
          })
        "
      />
    </div>
  </div>
</template>

<style scoped>
/* @media print {
  .sheet {
    background-color: white;
    color: black;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 15px;
    font-size: 14px;
    line-height: 18px;
  }
} */
</style>
