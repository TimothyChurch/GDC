<script setup lang="ts">
import { differenceInDays } from 'date-fns'

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const { confirm } = useDeleteConfirm()

const targetMonths = ref(24)
const targetAgeDays = computed(() => targetMonths.value * 30)

const sortBy = ref<'name' | 'age-asc' | 'age-desc'>('name')
const showDisposed = ref(false)

const getBarrelAge = (vessel: any): number => {
  if (!vessel.contents?.length) return 0
  const batch = batchStore.getBatchById(vessel.contents[0].batch)
  const fillDate = (batch?.stages as any)?.barrelAging?.entry?.date ? new Date((batch?.stages as any).barrelAging.entry.date) : null
  if (!fillDate) return 0
  return differenceInDays(new Date(), fillDate)
}

// Active barrels (excludes disposed)
const activeBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.status !== 'Disposed')
)

// Disposed barrels
const disposedBarrels = computed(() =>
  vesselStore.barrels.filter(b => b.status === 'Disposed')
)

const sortedBarrels = computed(() => {
  const barrels = showDisposed.value
    ? [...vesselStore.barrels]
    : [...activeBarrels.value]
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
  const atTarget = all.filter(b => getBarrelAge(b) >= targetAgeDays.value).length
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
      <UFormField label="Target Age (months)">
        <UInput v-model="targetMonths" type="number" min="1" class="w-24" />
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
        v-for="barrel in sortedBarrels"
        :key="barrel._id"
        :vessel="barrel"
        :target-age-days="targetAgeDays"
        @dispose="handleDispose"
      />
    </div>
  </div>
</template>
