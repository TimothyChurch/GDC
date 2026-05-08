<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const vesselStore = useVesselStore()
const viewMode = ref<'grid' | 'table'>('grid')

import { LazyPanelVessel } from '#components'
const overlay = useOverlay()

// Add vessel panel
const vesselPanel = overlay.create(LazyPanelVessel)
const addVessel = () => {
  vesselStore.resetVessel()
  vesselPanel.open()
}
</script>

<template>
  <div>
    <AdminPageHeader title="Vessels" subtitle="Fermenters, stills, and tanks" icon="i-lucide-container">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="addVessel">Add Vessel</UButton>
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

    <VesselGrid v-if="viewMode === 'grid'" />
    <TableVessels v-else />
  </div>
</template>
