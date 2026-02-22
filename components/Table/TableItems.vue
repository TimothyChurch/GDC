<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";
import type { Row } from "@tanstack/vue-table";

const router = useRouter();
const itemStore = useItemStore();
const contactStore = useContactStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const columns: TableColumn<Item>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Name",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Type",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => {
      return (
        contactStore.getContactById(row.getValue("vendor"))?.businessName ||
        "Unknown vendor"
      );
    },
  },
  {
    accessorKey: "inventoryUnit",
    header: "Inventory Units",
  },
  {
    accessorKey: "pricePerUnit",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Price per Unit",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      if ((row.getValue("pricePerUnit") as unknown as number) > 0) {
        return (
          Dollar.format(row.getValue("pricePerUnit")) +
          " / " +
          row.getValue("inventoryUnit")
        );
      } else {
        return "Price not set";
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            }),
        ),
      );
    },
  },
];

function getRowItems(row: Row<Item>) {
  return [
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
  ];
}

// Panel slide-over
import { LazyPanelItem } from "#components";
const overlay = useOverlay();
const modal = overlay.create(LazyPanelItem);
const newItem = () => {
  itemStore.resetItem();
  openModal();
};
const openModal = async () => await modal.open();

const globalFilter = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
</script>

<template>
  <TableWrapper
    v-model:search="globalFilter"
    v-model:pagination="pagination"
    :total-items="itemStore.items.length"
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
        v-model:global-filter="globalFilter"
        v-model:pagination="pagination"
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
                item.pricePerUnit > 0
                  ? `${Dollar.format(item.pricePerUnit)} / ${item.inventoryUnit}`
                  : "Not set"
              }}
            </div>
          </div>
          <div>
            <span class="text-parchment/60">Vendor</span>
            <div class="text-parchment/70">
              {{
                contactStore.getContactById(item.vendor)?.businessName ||
                "Unknown"
              }}
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
