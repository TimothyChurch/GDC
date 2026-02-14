<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const selectedCocktails = ref<Cocktail[]>([]);
const columnCount = ref(4);

const gridClass = computed(() => {
  switch (columnCount.value) {
    case 3: return 'grid-cols-3'
    case 6: return 'grid-cols-6'
    default: return 'grid-cols-4'
  }
})

const menuValues = computed(() => {
  const menus = new Set<string>()
  cocktailStore.cocktails.forEach(c => {
    if (c.menu) menus.add(c.menu)
  })
  return Array.from(menus).sort()
})

const selectAll = () => {
  selectedCocktails.value = [...cocktailStore.cocktails]
}

const selectByMenu = (menu: string) => {
  selectedCocktails.value = cocktailStore.cocktails.filter(c => c.menu === menu)
}

const menuItems = computed(() =>
  menuValues.value.map(m => ({
    label: m.charAt(0).toUpperCase() + m.slice(1),
    onSelect: () => selectByMenu(m),
  }))
)

const printCocktails = () => {
  window.print();
};
</script>

<template>
  <div>
    <AdminPageHeader title="Cocktail Grid" subtitle="Print-ready cocktail recipe cards" icon="i-lucide-grid-3x3">
      <template #actions>
        <div class="flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20 print:hidden">
          <UButton
            v-for="cols in [3, 4, 6]"
            :key="cols"
            size="xs"
            :variant="columnCount === cols ? 'solid' : 'ghost'"
            :color="columnCount === cols ? 'primary' : 'neutral'"
            @click="columnCount = cols"
            :label="`${cols}`"
          />
        </div>
        <UButton @click="selectAll" variant="outline" class="print:hidden">Select All</UButton>
        <UDropdownMenu :items="menuItems" class="print:hidden">
          <UButton variant="outline" trailing-icon="i-lucide-chevron-down">By Menu</UButton>
        </UDropdownMenu>
        <UButton @click="printCocktails()" class="print:hidden">Print</UButton>
        <UButton @click="selectedCocktails = []" variant="outline" class="print:hidden">Clear</UButton>
      </template>
    </AdminPageHeader>
    <div class="flex gap-5">
      <div class="flex-1 min-w-0">
        <div id="sheet" class="print:text-black">
          <div class="grid w-[200mm]" :class="gridClass">
            <div
              v-for="cocktail in selectedCocktails"
              :key="cocktail._id.toString()"
              class="border border-brown/30 flex flex-col bg-charcoal print:bg-white print:border-gray-300"
            >
              <div class="border-b border-brown/30 text-center p-1.5 font-bold text-parchment print:text-black print:border-gray-300">
                {{ cocktail.name }}
              </div>
              <div class="px-2 py-1 flex-grow">
                <div
                  v-for="ingredient in cocktail.ingredients"
                  :key="ingredient.item.toString()"
                  class="flex justify-between gap-2 text-xs text-parchment/80 print:text-black"
                >
                  <div class="truncate">
                    {{ itemStore.getItemById(ingredient.item.toString())?.name }}
                  </div>
                  <div class="whitespace-nowrap">{{ ingredient.amount }} {{ ingredient.unit }}</div>
                </div>
              </div>
              <div class="border-t border-brown/30 p-1 text-center text-xs text-parchment/60 print:text-gray-600 print:border-gray-300">
                <div class="font-medium">{{ cocktail.glassware }}</div>
                <div>{{ cocktail.directions }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="print:hidden shrink-0">
        <div class="bg-charcoal rounded-xl border border-brown/30 p-4 max-h-[calc(100vh-200px)] overflow-y-auto w-56">
          <div class="text-xs font-semibold text-parchment/60 uppercase tracking-wider mb-2">Cocktails</div>
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
    </div>
  </div>
</template>

<style>
@media print {
  #sheet {
    page-break-inside: auto;
  }
  #sheet > div > div {
    page-break-inside: avoid;
  }
}
</style>
