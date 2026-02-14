<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const viewMode = ref<'grid' | 'table'>('grid')
</script>

<template>
  <div>
    <AdminPageHeader title="Bottles" subtitle="Manage bottle products and inventory" icon="i-lucide-wine">
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

    <BottleCardGrid v-if="viewMode === 'grid'" />
    <TableBottles v-else />
  </div>
</template>
