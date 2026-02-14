<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const cocktailStore = useCocktailStore()

const viewMode = ref<'grid' | 'table'>('grid')
const selectedMenu = ref('All')

const MENU_TABS = ['All', 'Main', 'Seasonal', 'Shots', 'Off Menu'] as const

const menuTabs = computed(() => {
  const counts: Record<string, number> = { All: cocktailStore.cocktails.length }
  counts['Main'] = cocktailStore.cocktails.filter(c => c.menu === 'main').length
  counts['Seasonal'] = cocktailStore.cocktails.filter(c => c.menu === 'seasonal').length
  counts['Shots'] = cocktailStore.cocktails.filter(c => c.menu === 'shots').length
  counts['Off Menu'] = cocktailStore.cocktails.filter(c => !c.visible).length
  return MENU_TABS.map(name => ({ name, count: counts[name] || 0 }))
})

const filteredCocktails = computed(() => {
  if (selectedMenu.value === 'All') return undefined
  if (selectedMenu.value === 'Off Menu') return cocktailStore.cocktails.filter(c => !c.visible)
  const menuKey = selectedMenu.value.toLowerCase()
  return cocktailStore.cocktails.filter(c => c.menu === menuKey)
})
</script>

<template>
  <div>
    <AdminPageHeader title="Cocktails" subtitle="Manage cocktail menu and recipes" icon="i-lucide-martini">
      <template #actions>
        <div class="flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20">
          <UButton
            icon="i-lucide-layout-grid"
            size="xs"
            :variant="viewMode === 'grid' ? 'solid' : 'ghost'"
            :color="viewMode === 'grid' ? 'primary' : 'neutral'"
            @click="viewMode = 'grid'"
            aria-label="Grid view"
          />
          <UButton
            icon="i-lucide-list"
            size="xs"
            :variant="viewMode === 'table' ? 'solid' : 'ghost'"
            :color="viewMode === 'table' ? 'primary' : 'neutral'"
            @click="viewMode = 'table'"
            aria-label="Table view"
          />
        </div>
      </template>
    </AdminPageHeader>

    <div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide">
      <button
        v-for="tab in menuTabs"
        :key="tab.name"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
        :class="selectedMenu === tab.name
          ? 'bg-gold/15 text-gold border-gold/20'
          : 'text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30'"
        @click="selectedMenu = tab.name"
      >
        {{ tab.name }}
        <span
          class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
          :class="selectedMenu === tab.name ? 'bg-gold/20 text-gold' : 'bg-brown/20 text-parchment/60'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <CocktailCardGrid v-if="viewMode === 'grid'" :data="filteredCocktails" />
    <TableCocktails v-else />
  </div>
</template>
