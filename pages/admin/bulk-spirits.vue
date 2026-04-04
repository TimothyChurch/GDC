<script setup lang="ts">
import type { BulkSpirit } from '~/types'
import type { TableColumn } from '@nuxt/ui'
import { LazyPanelBulkSpirit } from '#components'
import { getPaginationRowModel } from '@tanstack/vue-table'

definePageMeta({ layout: 'admin' })

const bulkSpiritStore = useBulkSpiritStore()
const vesselStore = useVesselStore()
const { confirm } = useDeleteConfirm()
const overlay = useOverlay()
const panel = overlay.create(LazyPanelBulkSpirit)

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => bulkSpiritStore.bulkSpirits.length),
)

function vesselName(id?: string) {
  if (!id) return '-'
  return vesselStore.getVesselById(id)?.name || '-'
}

const columns: TableColumn<BulkSpirit>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'spiritClass', header: 'Class' },
  {
    accessorKey: 'volume',
    header: 'Volume',
    cell: ({ row }) => `${row.original.volume.toFixed(1)} ${row.original.volumeUnit === 'gallon' ? 'gal' : row.original.volumeUnit}`,
  },
  {
    accessorKey: 'abv',
    header: 'ABV',
    cell: ({ row }) => `${row.original.abv.toFixed(1)}%`,
  },
  {
    accessorKey: 'proofGallons',
    header: 'Proof Gallons',
    cell: ({ row }) => row.original.proofGallons.toFixed(2),
  },
  {
    accessorKey: 'costPerProofGallon',
    header: '$/PG',
    cell: ({ row }) => Dollar.format(row.original.costPerProofGallon),
  },
  {
    accessorKey: 'totalValue',
    header: 'Total Value',
    cell: ({ row }) => Dollar.format(row.original.totalValue),
  },
  {
    id: 'vessel',
    header: 'Vessel',
    cell: ({ row }) => vesselName(row.original.vessel),
  },
  {
    id: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
  },
]

const showLedger = ref<string | null>(null)

function newBulkSpirit() {
  bulkSpiritStore.resetBulkSpirit()
  panel.open()
}

function editBulkSpirit(id: string) {
  bulkSpiritStore.setBulkSpirit(id)
  panel.open()
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="Bulk Spirits"
      subtitle="Manage stored base spirits for blending and production"
      icon="i-lucide-archive"
    >
      <template #actions>
        <UButton icon="i-lucide-plus" @click="newBulkSpirit">
          New Bulk Spirit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl border border-brown/30 bg-charcoal p-4">
        <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Active Spirits</div>
        <div class="text-2xl font-bold text-parchment">{{ bulkSpiritStore.activeBulkSpirits.length }}</div>
      </div>
      <div class="rounded-xl border border-brown/30 bg-charcoal p-4">
        <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Volume</div>
        <div class="text-2xl font-bold text-parchment">
          {{ bulkSpiritStore.activeBulkSpirits.reduce((sum, bs) => sum + bs.volume, 0).toFixed(1) }} gal
        </div>
      </div>
      <div class="rounded-xl border border-brown/30 bg-charcoal p-4">
        <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Proof Gallons</div>
        <div class="text-2xl font-bold text-parchment">
          {{ bulkSpiritStore.activeBulkSpirits.reduce((sum, bs) => sum + bs.proofGallons, 0).toFixed(2) }}
        </div>
      </div>
      <div class="rounded-xl border border-brown/30 bg-charcoal p-4">
        <div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Value</div>
        <div class="text-2xl font-bold text-gold">
          {{ Dollar.format(bulkSpiritStore.activeBulkSpirits.reduce((sum, bs) => sum + bs.totalValue, 0)) }}
        </div>
      </div>
    </div>

    <!-- Table -->
    <TableWrapper
      v-model:search="search"
      v-model:pagination="pagination"
      :total-items="filteredTotal"
      :loading="bulkSpiritStore.loading"
      search-placeholder="Search bulk spirits..."
    >
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="bulkSpiritStore.bulkSpirits"
        :columns="columns"
        :loading="bulkSpiritStore.loading"
        class="w-full"
      >
        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="text-right">
            <UDropdownMenu
              :content="{ align: 'end' }"
              :items="[
                { label: 'View Ledger', icon: 'i-lucide-scroll-text', onSelect() { showLedger = showLedger === row.original._id ? null : row.original._id } },
                { label: 'Edit', icon: 'i-lucide-pencil', onSelect() { editBulkSpirit(row.original._id) } },
                { label: 'Delete', variant: 'danger', async onClick() { if (await confirm('Bulk Spirit', row.original.name)) await bulkSpiritStore.deleteBulkSpirit(row.original._id) } },
              ]"
            >
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
            </UDropdownMenu>
          </div>
        </template>
        <template #empty>
          <BaseEmptyState
            icon="i-lucide-archive"
            title="No bulk spirits"
            description="Create a bulk spirit entry to start tracking stored spirits"
            action-label="New Bulk Spirit"
            @action="newBulkSpirit"
          />
        </template>
      </UTable>
    </TableWrapper>

    <!-- Ledger detail -->
    <div v-if="showLedger" class="mt-6 rounded-xl border border-brown/30 bg-charcoal p-4">
      <BulkSpiritLedger :bulk-spirit-id="showLedger" />
    </div>

  </div>
</template>
