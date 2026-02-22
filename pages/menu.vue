<script setup lang="ts">
import type { Cocktail } from "~/types";

useSeoMeta({
  title: 'Cocktail Menu | Galveston Distilling Co',
  description: 'Explore our handcrafted cocktail menu featuring island-inspired drinks made with our own spirits.',
  ogTitle: 'Cocktail Menu | Galveston Distilling Co',
  ogDescription: 'Explore our handcrafted cocktail menu featuring island-inspired drinks made with our own spirits.',
  ogImage: '/images/og-menu.jpg',
  ogUrl: 'https://galvestondistilling.com/menu',
});

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const search = ref("");
const activeCategory = ref("All");
const activeSpirit = ref("All");

// Map specific spirit types/names to broad categories
const spiritCategoryMap: [RegExp, string][] = [
  [/vodka/i, "Vodka"],
  [/bourbon/i, "Whiskey"],
  [/rye/i, "Whiskey"],
  [/whisk(e)?y/i, "Whiskey"],
  [/gin/i, "Gin"],
  [/rum/i, "Rum"],
  [/tequila/i, "Tequila"],
  [/mezcal/i, "Tequila"],
  [/brandy/i, "Brandy"],
  [/cognac/i, "Brandy"],
  [/absinthe/i, "Absinthe"],
  [/liqueur|cordial|amaretto|schnapps|triple sec/i, "Liqueur"],
  [/vermouth|amaro|aperol|campari/i, "Amaro"],
];

const getSpiritCategory = (text: string): string | null => {
  for (const [pattern, category] of spiritCategoryMap) {
    if (pattern.test(text)) return category;
  }
  return null;
};

const getBaseSpirit = (cocktail: Cocktail): string | null => {
  for (const ing of cocktail.ingredients) {
    const item = itemStore.getItemById(ing.item as unknown as string);
    if (!item) continue;
    // Check item type first, then fall back to item name
    const category = getSpiritCategory(item.type || "") || getSpiritCategory(item.name || "");
    if (category) return category;
  }
  return null;
};

const visibleCocktails = computed(() => {
  return cocktailStore.cocktails.filter((c) => c.visible !== false);
});

const categories = computed(() => {
  const menus = visibleCocktails.value
    .map((c) => c.menu)
    .filter(Boolean);
  return ["All", ...new Set(menus)];
});

const spiritTypes = computed(() => {
  const spirits = visibleCocktails.value
    .map((c) => getBaseSpirit(c))
    .filter(Boolean) as string[];
  return ["All", ...new Set(spirits)].sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return a.localeCompare(b);
  });
});

const filteredCocktails = computed(() => {
  let result = visibleCocktails.value;

  if (activeCategory.value !== "All") {
    result = result.filter((c) => c.menu === activeCategory.value);
  }

  if (activeSpirit.value !== "All") {
    result = result.filter((c) => getBaseSpirit(c) === activeSpirit.value);
  }

  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ingredients.some((ing) =>
          itemStore
            .getItemById(ing.item as unknown as string)
            ?.name.toLowerCase()
            .includes(q)
        )
    );
  }

  return result;
});

const hasActiveFilters = computed(() => {
  return search.value || activeCategory.value !== "All" || activeSpirit.value !== "All";
});

const clearFilters = () => {
  search.value = "";
  activeCategory.value = "All";
  activeSpirit.value = "All";
};
</script>

<template>
  <div>
    <SitePageHero
      title="Cocktail Menu"
      subtitle="Handcrafted cocktails featuring our house-distilled spirits"
      background-image="/images/cocktail.jpg"
    />

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <!-- Category filter tabs -->
      <div v-if="categories.length > 2" class="mb-4">
        <p class="text-xs uppercase tracking-wider text-brown/60 dark:text-parchment/60 text-center mb-2">Menu</p>
        <div role="tablist" aria-label="Menu categories" class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="cat in categories"
            :key="cat"
            role="tab"
            :aria-selected="activeCategory === cat"
            @click="activeCategory = cat"
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200"
            :class="
              activeCategory === cat
                ? 'bg-gold text-espresso'
                : 'bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-gold/20'
            "
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Base spirit filter -->
      <div v-if="spiritTypes.length > 2" class="mb-6">
        <p class="text-xs uppercase tracking-wider text-brown/60 dark:text-parchment/60 text-center mb-2">Base Spirit</p>
        <div role="tablist" aria-label="Base spirit filter" class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="spirit in spiritTypes"
            :key="spirit"
            role="tab"
            :aria-selected="activeSpirit === spirit"
            @click="activeSpirit = spirit"
            class="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200"
            :class="
              activeSpirit === spirit
                ? 'bg-copper text-parchment'
                : 'bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-copper/20'
            "
          >
            {{ spirit }}
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="max-w-md mx-auto mb-8">
        <UInput
          type="text"
          v-model="search"
          placeholder="Search cocktails or ingredients..."
          class="w-full"
          size="lg"
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
      </div>

      <!-- Cocktail grid -->
      <div v-if="cocktailStore.loading" class="flex justify-center py-12">
        <span class="text-brown/50 dark:text-parchment/50">Loading cocktails...</span>
      </div>
      <div v-else-if="filteredCocktails.length === 0" class="text-center py-12">
        <Icon name="carbon:drink-02" class="text-4xl text-brown/20 dark:text-parchment/20 mb-3" />
        <p class="text-brown/50 dark:text-parchment/50">No cocktails found</p>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="mt-3 text-sm text-gold hover:text-copper transition-colors bg-transparent"
        >
          Clear filters
        </button>
      </div>
      <div v-else class="grid md:grid-cols-2 gap-6">
        <CardCocktail
          v-for="cocktail in filteredCocktails"
          :key="cocktail._id"
          :cocktail="cocktail as Cocktail"
        />
      </div>
    </div>
  </div>
</template>
