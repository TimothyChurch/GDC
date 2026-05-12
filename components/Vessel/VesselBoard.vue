<script setup lang="ts">
import { LazyPanelVessel, LazyPanelBatch } from '#components'

const overlay = useOverlay()
const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const { grouped, counts } = useVesselBoard()

const isLoading = computed(() => vesselStore.loading || batchStore.loading)

const addVessel = async () => {
  vesselStore.resetVessel()
  const panel = overlay.create(LazyPanelVessel)
  await panel.open()
}

const addBatch = async () => {
  batchStore.resetItem()
  const panel = overlay.create(LazyPanelBatch)
  await panel.open()
}

const now = ref(new Date())
onMounted(() => {
  const id = setInterval(() => (now.value = new Date()), 60_000)
  onBeforeUnmount(() => clearInterval(id))
})

const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-parchment font-[Cormorant_Garamond]">
          {{ greeting }}
        </h1>
        <p class="text-sm text-parchment/60 mt-1">
          What's in every vessel right now.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton size="sm" variant="soft" class="bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20" @click="addBatch">
          <UIcon name="i-lucide-plus" class="mr-1" />
          New Batch
        </UButton>
        <UButton size="sm" variant="soft" class="bg-copper/10 text-copper border border-copper/20 hover:bg-copper/20" @click="addVessel">
          <UIcon name="i-lucide-container" class="mr-1" />
          Add Vessel
        </UButton>
        <NuxtLink to="/admin/dashboard">
          <UButton size="sm" variant="ghost" class="text-parchment/60 hover:text-parchment">
            <UIcon name="i-lucide-layout-dashboard" class="mr-1" />
            Dashboard
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Compact attention feed -->
    <DashboardActionItems :max-items="6" />

    <!-- Filters -->
    <VesselBoardFilters />

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-parchment/60">
        <UIcon name="i-lucide-loader-2" class="text-xl animate-spin text-gold" />
        <span class="text-sm">Loading vessel data...</span>
      </div>
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="counts.total === 0"
      icon="i-lucide-container"
      title="No vessels yet"
      description="Add your first vessel to start tracking what's on the floor."
      action-label="Add Vessel"
      @action="addVessel"
    />

    <BaseEmptyState
      v-else-if="counts.filtered === 0"
      icon="i-lucide-filter"
      title="No vessels match these filters"
      description="Try clearing filters or expanding what you're looking for."
    />

    <!-- Grouped tile grid -->
    <template v-else>
      <div v-for="group in grouped" :key="group.type" class="space-y-3">
        <div class="flex items-center gap-2">
          <UIcon :name="group.icon" class="text-copper" />
          <h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider">
            {{ group.type }}<span v-if="group.entries.length !== 1">s</span>
          </h3>
          <span class="text-xs text-parchment/40">({{ group.entries.length }})</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <VesselTile
            v-for="entry in group.entries"
            :key="entry.vessel._id"
            :entry="entry"
          />
        </div>
      </div>
    </template>
  </div>
</template>
