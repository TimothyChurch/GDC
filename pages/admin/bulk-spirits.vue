<script setup lang="ts">
import type { BulkSpirit } from '~/types'
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin' })

const bulkSpiritStore = useBulkSpiritStore()
const vesselStore = useVesselStore()

function vesselName(id?: string) {
  if (!id) return '-'
  return vesselStore.getVesselById(id)?.name || '-'
}

function shortUnit(unit: string) {
  return unit.replace(/gallon/i, 'gal').replace(/liter/i, 'L')
}

const columns: TableColumn<BulkSpirit>[] = [
  sortableColumn<BulkSpirit>('name', 'Name'),
  sortableColumn<BulkSpirit>('spiritClass', 'Class'),
  sortableColumn<BulkSpirit>('volume', 'Volume', {
    cell: ({ row }) => `${row.original.volume.toFixed(1)} ${shortUnit(row.original.volumeUnit)}`,
  }),
  sortableColumn<BulkSpirit>('abv', 'ABV', {
    cell: ({ row }) => `${row.original.abv.toFixed(1)}%`,
  }),
  sortableColumn<BulkSpirit>('proofGallons', 'Proof Gallons', {
    cell: ({ row }) => row.original.proofGallons.toFixed(2),
  }),
  sortableColumn<BulkSpirit>('costPerProofGallon', '$/PG', {
    cell: ({ row }) => Dollar.format(row.original.costPerProofGallon),
  }),
  sortableColumn<BulkSpirit>('totalValue', 'Total Value', {
    cell: ({ row }) => Dollar.format(row.original.totalValue),
  }),
  {
    id: 'vessel',
    header: 'Vessel',
    cell: ({ row }) => vesselName(row.original.vessel),
  } as TableColumn<BulkSpirit>,
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: row.original.status === 'active' ? 'success' : 'neutral',
        variant: 'subtle',
      }, () => row.original.status)
    },
  } as TableColumn<BulkSpirit>,
  actionsColumn<BulkSpirit>((row) => [
    {
      label: 'View Ledger',
      icon: 'i-lucide-scroll-text',
      onSelect() { showLedger.value = showLedger.value === row.original._id ? null : row.original._id },
    },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() { editBulkSpirit(row.original._id) },
    },
  ]),
]

const showPanel = ref(false)
const showLedger = ref<string | null>(null)

function newBulkSpirit() {
  bulkSpiritStore.resetBulkSpirit()
  showPanel.value = true
}

function editBulkSpirit(id: string) {
  bulkSpiritStore.setBulkSpirit(id)
  showPanel.value = true
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
    <div class="rounded-xl border border-brown/30 bg-charcoal overflow-hidden">
      <UTable
        :data="bulkSpiritStore.bulkSpirits"
        :columns="columns"
        :loading="bulkSpiritStore.loading"
        class="w-full"
      >
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
    </div>

    <!-- Ledger detail -->
    <div v-if="showLedger" class="mt-6 rounded-xl border border-brown/30 bg-charcoal p-4">
      <BulkSpiritLedger :bulk-spirit-id="showLedger" />
    </div>

    <!-- Slideover panel -->
    <PanelBulkSpirit
      v-if="showPanel"
      @close="showPanel = false"
    />
  </div>
</template>
