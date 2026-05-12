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

const UBadge = resolveComponent('UBadge')

const showOutOfStock = ref(false)

const allCategoryItems = computed(() => itemStore.getItemsByCategory(props.category))

function getLatestQuantity(itemId: string): number {
  const records = inventoryStore.getInventoriesByItem(itemId)
  const [latest] = sortByDateDesc(records)
  return latest ? inventoryStore.getTotalQuantity(latest) : 0
}

// Decorate each item with its current stock + status so TanStack Table sees a
// fresh `data` reference whenever `inventoryStore.inventories` changes — cell
// render functions are not Vue reactive templates and won't re-evaluate
// otherwise (tech-debt #71).
type DecoratedItem = Item & { currentStock: number; stockStatus: ReturnType<typeof getStockStatus> }

const decoratedItems = computed<DecoratedItem[]>(() =>
  allCategoryItems.value.map((item) => {
    const currentStock = getLatestQuantity(item._id)
    const stockStatus = getStockStatus(currentStock, item.reorderPoint || 0)
    return { ...item, currentStock, stockStatus }
  }),
)

const outOfStockCount = computed(() =>
  decoratedItems.value.filter((item) => item.currentStock <= 0).length,
)

const categoryItems = computed<DecoratedItem[]>(() => {
  if (showOutOfStock.value) return decoratedItems.value
  return decoratedItems.value.filter((item) => item.currentStock > 0)
})

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => categoryItems.value.length)
)

const columns: TableColumn<DecoratedItem>[] = [
  sortableColumn<DecoratedItem>('name', 'Name'),
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    id: 'inventory',
    accessorKey: 'currentStock',
    header: 'Inventory',
    cell: ({ row }) => formatWithUnits(row.original.currentStock, row.original),
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
    accessorKey: 'stockStatus',
    header: 'Status',
    cell: ({ row }) => {
      const color = getStockStatusColor(row.original.stockStatus)
      return h(UBadge, { color, variant: 'subtle', size: 'sm' }, () => row.original.stockStatus)
    },
  },
  actionsColumn<DecoratedItem>((row) => [
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
  ]),
]

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
</script>

<template>
  <TableWrapper
    v-model:search="search"
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
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="categoryItems"
        :columns="columns"
        :loading="itemStore.loading"
        @select="(_e: Event, row: Row<DecoratedItem>) => router.push(`/admin/items/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-package" title="No items found" description="Add items to this category to track inventory" action-label="Add Item" @action="newItem" />
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="item in categoryItems.filter(i => {
          if (!search) return true;
          const term = search.toLowerCase();
          return i.name.toLowerCase().includes(term) || (i.type || '').toLowerCase().includes(term);
        })"
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
            :color="getStockStatusColor(item.stockStatus)"
            variant="subtle"
            size="sm"
          >
            {{ item.stockStatus }}
          </UBadge>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Stock</span>
            <div class="text-parchment font-semibold">
              {{ formatWithUnits(item.currentStock, item) }}
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
      <BaseEmptyState v-if="categoryItems.length === 0" icon="i-lucide-package" title="No items in this category" description="Add items to this category to track inventory" action-label="Add Item" @action="newItem" />
    </div>
  </TableWrapper>
</template>
