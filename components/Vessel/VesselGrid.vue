<script setup lang="ts">
const vesselStore = useVesselStore()

const typeGroups = computed(() => {
  const types = ['Mash Tun', 'Fermenter', 'Still', 'Tank', 'Barrel'] as const
  const typeIcons: Record<string, string> = {
    'Mash Tun': 'i-lucide-flame',
    'Fermenter': 'i-lucide-beaker',
    'Still': 'i-lucide-flask-conical',
    'Tank': 'i-lucide-cylinder',
    'Barrel': 'i-lucide-cylinder',
  }

  return types
    .map(type => ({
      type,
      icon: typeIcons[type],
      vessels: vesselStore.vessels.filter(v => v.type === type),
    }))
    .filter(g => g.vessels.length > 0)
})
</script>

<template>
  <div v-if="vesselStore.loading" class="text-center py-12">
    <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
    <p class="text-sm text-parchment/50">Loading vessels...</p>
  </div>

  <div v-else-if="vesselStore.vessels.length === 0" class="text-center py-12">
    <UIcon name="i-lucide-container" class="text-2xl text-parchment/20 mx-auto mb-2" />
    <p class="text-sm text-parchment/50">No vessels found</p>
  </div>

  <div v-else class="space-y-6">
    <div v-for="group in typeGroups" :key="group.type">
      <div class="flex items-center gap-2 mb-3">
        <UIcon :name="group.icon" class="text-copper" />
        <h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider">
          {{ group.type }}s
        </h3>
        <span class="text-xs text-parchment/50">({{ group.vessels.length }})</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <VesselCard
          v-for="vessel in group.vessels"
          :key="vessel._id"
          :vessel="vessel"
        />
      </div>
    </div>
  </div>
</template>
