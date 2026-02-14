<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const viewMode = ref<'grid' | 'table'>('grid')

// Transfer panel
import { PanelVesselTransfer } from '#components'
const overlay = useOverlay()
const transferPanel = overlay.create(PanelVesselTransfer)
const openTransfer = async () => await transferPanel.open()
</script>

<template>
  <div>
    <AdminPageHeader title="Vessels" subtitle="Fermenters, stills, tanks, and barrels" icon="i-lucide-container">
      <template #actions>
        <UButton variant="outline" icon="i-lucide-arrow-right-left" @click="openTransfer">Transfer</UButton>
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
