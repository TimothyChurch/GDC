<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Item, ItemCategory } from '~/types'
import type { Row } from '@tanstack/vue-table'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { getStockStatus, getStockStatusColor } from '~/composables/useInventoryCategories'

const props = defineProps<{
  category: ItemCategory
}>()

const router = useRouter()
const itemStore = useItemStore()
const inventoryStore = useInventoryStore()
const { confirm } = useDeleteConfirm()

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const showOutOfStock = ref(false)

const allCategoryItems = computed(() => itemStore.getItemsByCategory(props.category))

function getLatestQuantity(itemId: string): number {
  const records = inventoryStore.getInventoriesByItem(itemId)
  if (records.length === 0) return 0
  const sorted = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return sorted[0].quantity
}

const outOfStockCount = computed(() =>
  allCategoryItems.value.filter(item => getLatestQuantity(item._id) <= 0).length
)

const categoryItems = computed(() => {
  if (showOutOfStock.value) return allCategoryItems.value
  return allCategoryItems.value.filter(item => getLatestQuantity(item._id) > 0)
})

const columns: TableColumn<Item>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Name',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    id: 'inventory',
    header: 'Inventory',
    cell: ({ row }) => {
      const qty = getLatestQuantity(row.original._id)
      const unit = row.original.inventoryUnit || ''
      return `${qty} ${unit}`
    },
  },
  {
    accessorKey: 'usePerMonth',
    header: 'Use/Month',
    cell: ({ row }) => {
      const val = row.original.usePerMonth || 0
      if (val === 0) return '--'
      const unit = row.original.inventoryUnit || ''
      return `${val} ${unit}`
    },
  },
  {
    id: 'stockStatus',
    header: 'Status',
    cell: ({ row }) => {
      const qty = getLatestQuantity(row.original._id)
      const reorder = row.original.reorderPoint || 0
      const status = getStockStatus(qty, reorder)
      const color = getStockStatusColor(status)
      return h(UBadge, { color, variant: 'subtle', size: 'sm' }, () => status)
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: { align: 'end' },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown',
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown',
            }),
        ),
      )
    },
  },
]

function getRowItems(row: Row<Item>) {
  return [
    {
      label: 'Edit item',
      onSelect() {
        itemStore.setItem(row.original._id.toString())
        openModal()
      },
    },
    {
      label: 'Delete item',
      variant: 'danger',
      async onClick() {
        const confirmed = await confirm('Item', row.original.name)
        if (confirmed) {
          itemStore.deleteItem(row.original._id.toString())
        }
      },
    },
  ]
}

// Panel slide-over
import { LazyPanelItem } from '#components'
const overlay = useOverlay()
const modal = overlay.create(LazyPanelItem)
const newItem = () => {
  itemStore.resetItem()
  itemStore.item.category = props.category
  openModal()
}
const openModal = async () => await modal.open()

const globalFilter = ref('')
const pagination = ref({ pageIndex: 0, pageSize: 10 })

const tableRef = useTemplateRef('tableRef')
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? categoryItems.value.length
)
</script>

<template>
  <TableWrapper
    v-model:search="globalFilter"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="itemStore.loading"
    search-placeholder="Search items..."
  >
    <template #actions>
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <USwitch v-model="showOutOfStock" />
        <span class="text-xs text-parchment/60">
          Show out-of-stock
          <span v-if="outOfStockCount > 0" class="text-red-400/70">({{ outOfStockCount }})</span>
        </span>
      </label>
      <UButton
        icon="i-lucide-plus-circle"
        size="xl"
        @click="newItem"
        variant="ghost"
      >
        Add Item
      </UButton>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="globalFilter"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="categoryItems"
        :columns="columns"
        :loading="itemStore.loading"
        :empty="'No items found'"
        @select="(_e: Event, row: any) => router.push(`/admin/items/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="item in categoryItems"
        :key="item._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/items/${item._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ item.name }}</div>
            <div class="text-xs text-parchment/60">{{ item.type || 'No type' }}</div>
          </div>
          <UBadge
            :color="getStockStatusColor(getStockStatus(getLatestQuantity(item._id), item.reorderPoint || 0))"
            variant="subtle"
            size="sm"
          >
            {{ getStockStatus(getLatestQuantity(item._id), item.reorderPoint || 0) }}
          </UBadge>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Stock</span>
            <div class="text-parchment font-semibold">
              {{ getLatestQuantity(item._id) }} {{ item.inventoryUnit || '' }}
            </div>
          </div>
          <div>
            <span class="text-parchment/60">Use/Month</span>
            <div class="text-parchment/70">
              {{ item.usePerMonth ? `${item.usePerMonth} ${item.inventoryUnit || ''}` : '--' }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="categoryItems.length === 0"
        class="text-center py-6 text-parchment/50 text-sm"
      >
        No items in this category
      </div>
    </div>
  </TableWrapper>
</template>
