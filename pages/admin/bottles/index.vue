<script setup lang="ts">
import type { Bottle } from '~/types'

definePageMeta({ layout: 'admin' })

const bottleStore = useBottleStore()
const { isLowStock } = useBottleStock()

const viewMode = ref<'grid' | 'table'>('grid')

// Filters
const statusFilter = ref<'active' | 'archived'>('active')
const stockFilter = ref<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')

const stockOptions = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
]

const filteredBottles = computed<Bottle[]>(() => {
  return bottleStore.bottles.filter((b) => {
    // Status filter
    if (statusFilter.value === 'active' && b.archived) return false
    if (statusFilter.value === 'archived' && !b.archived) return false

    // Stock level filter
    if (stockFilter.value === 'in-stock') return b.inStock !== false && !isLowStock(b._id)
    if (stockFilter.value === 'low-stock') return isLowStock(b._id)
    if (stockFilter.value === 'out-of-stock') return b.inStock === false

    return true
  })
})
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

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20">
        <UButton
          size="xs"
          :variant="statusFilter === 'active' ? 'solid' : 'ghost'"
          :color="statusFilter === 'active' ? 'primary' : 'neutral'"
          @click="statusFilter = 'active'"
        >
          Active
        </UButton>
        <UButton
          size="xs"
          :variant="statusFilter === 'archived' ? 'solid' : 'ghost'"
          :color="statusFilter === 'archived' ? 'primary' : 'neutral'"
          @click="statusFilter = 'archived'"
        >
          Archived
        </UButton>
      </div>
      <USelect
        v-model="stockFilter"
        :items="stockOptions"
        size="xs"
        class="w-36"
      />
    </div>

    <BottleCardGrid v-if="viewMode === 'grid'" :bottles="filteredBottles" />
    <TableBottles v-else :bottles="filteredBottles" />
  </div>
</template>
