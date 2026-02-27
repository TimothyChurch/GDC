<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const cocktailStore = useCocktailStore()
const { menuOptions } = useCocktailOptions()

const viewMode = ref<'grid' | 'table'>('grid')
const selectedMenu = ref('All')
const searchQuery = ref('')
const visibilityFilter = ref<'all' | 'visible' | 'hidden'>('all')

const capitalize = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())

const MENU_TABS = computed(() => [
  'All',
  ...menuOptions.value.map((m) => capitalize(m)),
])

const menuTabs = computed(() => {
  const counts: Record<string, number> = { All: cocktailStore.cocktails.length }
  for (const menu of menuOptions.value) {
    const label = capitalize(menu)
    if (menu === 'off menu') {
      counts[label] = cocktailStore.cocktails.filter((c) => !c.visible).length
    } else {
      counts[label] = cocktailStore.cocktails.filter((c) => c.menu === menu).length
    }
  }
  return MENU_TABS.value.map((name) => ({ name, count: counts[name] || 0 }))
})

const filteredCocktails = computed(() => {
  let result = cocktailStore.cocktails

  // Menu filter
  if (selectedMenu.value === capitalize('off menu')) {
    result = result.filter((c) => !c.visible)
  } else if (selectedMenu.value !== 'All') {
    const menuKey = selectedMenu.value.toLowerCase()
    result = result.filter((c) => c.menu === menuKey)
  }

  // Visibility filter
  if (visibilityFilter.value === 'visible') {
    result = result.filter((c) => c.visible)
  } else if (visibilityFilter.value === 'hidden') {
    result = result.filter((c) => !c.visible)
  }

  // Text search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((c) =>
      c.name.toLowerCase().includes(q)
      || (c.description?.toLowerCase().includes(q))
    )
  }

  return result
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (visibilityFilter.value !== 'all') count++
  return count
})

const clearFilters = () => {
  searchQuery.value = ''
  visibilityFilter.value = 'all'
}
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

    <!-- Search & Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search cocktails..."
        icon="i-lucide-search"
        class="flex-1"
        size="sm"
      >
        <template v-if="searchQuery" #trailing>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            color="neutral"
            @click="searchQuery = ''"
          />
        </template>
      </UInput>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-0.5 bg-brown/15 rounded-lg p-0.5 border border-brown/20">
          <UButton
            v-for="opt in ([
              { label: 'All', value: 'all' },
              { label: 'Visible', value: 'visible' },
              { label: 'Hidden', value: 'hidden' },
            ] as const)"
            :key="opt.value"
            size="xs"
            :variant="visibilityFilter === opt.value ? 'solid' : 'ghost'"
            :color="visibilityFilter === opt.value ? 'primary' : 'neutral'"
            @click="visibilityFilter = opt.value"
          >
            {{ opt.label }}
          </UButton>
        </div>

        <UButton
          v-if="activeFilterCount > 0"
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          Clear
        </UButton>
      </div>
    </div>

    <!-- Results count -->
    <p
      v-if="searchQuery || visibilityFilter !== 'all'"
      class="text-xs text-parchment/50 mb-3"
    >
      {{ filteredCocktails.length }} cocktail{{ filteredCocktails.length !== 1 ? 's' : '' }} found
    </p>

    <CocktailCardGrid v-if="viewMode === 'grid'" :data="filteredCocktails" />
    <TableCocktails v-else :data="filteredCocktails" />
  </div>
</template>
