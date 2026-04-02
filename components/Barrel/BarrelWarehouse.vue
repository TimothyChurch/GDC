<script setup lang="ts">
import { differenceInDays } from 'date-fns'
import { getBarrelAgeDefault } from '~/composables/definitions'

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const { confirm } = useDeleteConfirm()

const sortBy = ref<'name' | 'age-asc' | 'age-desc'>('name')
const showDisposed = ref(false)
const filterStatus = ref<'all' | 'filled' | 'empty' | 'used'>('all')
const filterRecipe = ref<string | undefined>(undefined)

const getBarrelAge = (vessel: any): number => {
  if (!vessel.contents?.length) return 0
  const batch = batchStore.getBatchById(vessel.contents[0].batch)
  const fillDate = (batch?.stages as any)?.barrelAging?.entry?.date ? new Date((batch?.stages as any).barrelAging.entry.date) : null
  if (!fillDate) return 0
  return differenceInDays(new Date(), fillDate)
}

const getBarrelTargetAgeDays = (vessel: any): number => {
  const months = vessel.targetAge || getBarrelAgeDefault(vessel.barrel?.size) || 0
  return months * 30
}

const getBarrelRecipeId = (vessel: any): string | null => {
  if (!vessel.contents?.length) return null
  const batch = batchStore.getBatchById(vessel.contents[0].batch)
  return batch?.recipe || null
}

// Recipe options for filter dropdown
const recipeOptions = computed(() => {
  const recipeIds = new Set<string>()
  vesselStore.barrels.forEach(b => {
    const id = getBarrelRecipeId(b)
    if (id) recipeIds.add(id)
  })
  const options = Array.from(recipeIds).map(id => {
    const recipe = recipeStore.getRecipeById(id)
    return { label: recipe?.name || 'Unknown', value: id }
  }).sort((a, b) => a.label.localeCompare(b.label))
  return options
})

// Active barrels (excludes disposed)
const activeBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.status !== 'Disposed')
)

// Disposed barrels
const disposedBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.status === 'Disposed')
)

const filteredBarrels = computed(() => {
  let barrels = showDisposed.value
    ? [...vesselStore.barrels]
    : [...activeBarrels.value]

  // Status filter
  if (filterStatus.value === 'filled') {
    barrels = barrels.filter(b => b.contents && b.contents.length > 0)
  } else if (filterStatus.value === 'empty') {
    barrels = barrels.filter(b => !b.contents || b.contents.length === 0)
  } else if (filterStatus.value === 'used') {
    barrels = barrels.filter(b => b.isUsed)
  }

  // Recipe filter
  if (filterRecipe.value) {
    barrels = barrels.filter(b => getBarrelRecipeId(b) === filterRecipe.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'age-asc':
      return barrels.sort((a, b) => getBarrelAge(a) - getBarrelAge(b))
    case 'age-desc':
      return barrels.sort((a, b) => getBarrelAge(b) - getBarrelAge(a))
    default:
      return barrels.sort((a, b) => a.name.localeCompare(b.name))
  }
})

const stats = computed(() => {
  const all = activeBarrels.value
  const total = all.length
  const filled = all.filter(b => b.contents && b.contents.length > 0).length
  const empty = total - filled
  const atTarget = all.filter(b => {
    const target = getBarrelTargetAgeDays(b)
    return target > 0 && getBarrelAge(b) >= target
  }).length
  const disposed = disposedBarrels.value.length
  return { total, filled, empty, atTarget, disposed }
})

const handleDispose = async (vesselId: string) => {
  const barrel = vesselStore.barrels.find(b => b._id === vesselId)
  if (!barrel) return
  const confirmed = await confirm('Barrel', barrel.name)
  if (!confirmed) return
  await vesselStore.disposeBarrel(vesselId)
}
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="flex flex-wrap items-end gap-4 mb-4">
      <UFormField label="Status">
        <USelect v-model="filterStatus" :items="[
          { label: 'All', value: 'all' },
          { label: 'Filled', value: 'filled' },
          { label: 'Empty', value: 'empty' },
          { label: 'Used', value: 'used' },
        ]" value-key="value" label-key="label" />
      </UFormField>
      <UFormField label="Recipe">
        <USelect v-model="filterRecipe" :items="recipeOptions" value-key="value" label-key="label" placeholder="All Recipes" />
      </UFormField>
      <UFormField label="Sort By">
        <USelect v-model="sortBy" :items="[
          { label: 'Name', value: 'name' },
          { label: 'Age (newest)', value: 'age-asc' },
          { label: 'Age (oldest)', value: 'age-desc' },
        ]" value-key="value" />
      </UFormField>
      <UButton
        v-if="stats.disposed > 0"
        :icon="showDisposed ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        variant="outline"
        color="neutral"
        size="sm"
        @click="showDisposed = !showDisposed"
      >
        {{ showDisposed ? 'Hide' : 'Show' }} Disposed ({{ stats.disposed }})
      </UButton>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center">
        <div class="text-2xl font-bold text-parchment">{{ stats.total }}</div>
        <div class="text-xs text-parchment/60">Active</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center">
        <div class="text-2xl font-bold text-copper">{{ stats.filled }}</div>
        <div class="text-xs text-parchment/60">Filled</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center">
        <div class="text-2xl font-bold text-parchment/60">{{ stats.empty }}</div>
        <div class="text-xs text-parchment/60">Empty</div>
      </div>
      <div class="bg-charcoal rounded-lg border border-brown/30 p-3 text-center">
        <div class="text-2xl font-bold text-gold">{{ stats.atTarget }}</div>
        <div class="text-xs text-parchment/60">At Target</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="vesselStore.loading" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
      <p class="text-sm text-parchment/50">Loading barrels...</p>
    </div>

    <!-- Empty -->
    <BaseEmptyState v-else-if="activeBarrels.length === 0 && !showDisposed" icon="i-lucide-cylinder" title="No barrels found" description="Add barrel vessels to track your aging inventory" />

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <BarrelCard
        v-for="barrel in filteredBarrels"
        :key="barrel._id"
        :vessel="barrel"
        @dispose="handleDispose"
      />
    </div>
  </div>
</template>
