<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const router = useRouter();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => itemStore.items.length)
);

const columns: TableColumn<Item>[] = [
  sortableColumn<Item>("name", "Name"),
  sortableColumn<Item>("type", "Type"),
  sortableColumn<Item>("category", "Category"),
  {
    id: "vendor",
    header: "Vendor",
    cell: ({ row }) => {
      return itemStore.getVendorName(row.original._id) || "\u2014";
    },
  },
  {
    accessorKey: "inventoryUnit",
    header: "Inventory Units",
  },
  {
    id: "pricePerUnit",
    header: "Price per Unit",
    cell: ({ row }) => {
      const price = itemStore.latestPrice(row.original._id);
      if (price > 0) {
        return (
          Dollar.format(price) + " / " + (row.original.inventoryUnit || "")
        );
      }
      return "Price not set";
    },
  },
  actionsColumn<Item>((row) => [
    {
      label: "Edit item",
      onSelect() {
        itemStore.setItem(row.original._id.toString());
        openModal();
      },
    },
    {
      label: "Delete item",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Item", row.original.name);
        if (confirmed) {
          itemStore.deleteItem(row.original._id.toString());
        }
      },
    },
  ]),
];

// Panel slide-over
import { LazyPanelItem } from "#components";
const overlay = useOverlay();
const modal = overlay.create(LazyPanelItem);
const newItem = () => {
  itemStore.resetItem();
  openModal();
};
const openModal = async () => await modal.open();
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
      <UButton
        icon="i-heroicons-plus-circle"
        size="xl"
        @click="newItem"
        variant="ghost"
        >Add Item</UButton
      >
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="itemStore.items"
        :columns="columns"
        :loading="itemStore.loading"
        :empty="'No items found'"
        @select="
          (_e: Event, row: any) =>
            router.push(`/admin/items/${row.original._id}`)
        "
        :ui="{ tr: 'cursor-pointer' }"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="item in itemStore.items"
        :key="item._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/items/${item._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">
              {{ item.name }}
            </div>
            <div class="text-xs text-parchment/60">
              {{ item.type || "No type" }}
            </div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/15 text-parchment/50 border border-brown/25"
          >
            {{ item.inventoryUnit || "N/A" }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Price</span>
            <div class="text-copper font-semibold">
              {{
                itemStore.latestPrice(item._id) > 0
                  ? `${Dollar.format(itemStore.latestPrice(item._id))} / ${item.inventoryUnit}`
                  : "Not set"
              }}
            </div>
          </div>
          <div>
            <span class="text-parchment/60">Vendor</span>
            <div class="text-parchment/70">
              {{ itemStore.getVendorName(item._id) || "\u2014" }}
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="itemStore.items.length === 0"
        class="text-center py-6 text-parchment/50 text-sm"
      >
        No items found
      </div>
    </div>
  </TableWrapper>
</template>
