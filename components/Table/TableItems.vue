<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";
import type { Row } from "@tanstack/vue-table";

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
            content: {
              align: "end",
            },
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
            })
        )
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

// Modal component info
import { ModalItem } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalItem);
const newItem = () => {
  itemStore.resetItem();
  openModal();
};
const openModal = async () => await modal.open();

const globalFilter = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
</script>

<template>
  <UContainer>
    <div class="flex justify-between">
      <UInput v-model="globalFilter" placeholder="Search items..." />
      <UButton
        icon="i-heroicons-plus-circle"
        size="xl"
        @click="newItem"
        variant="ghost"
        >Add Item</UButton
      >
    </div>
    <div class="overflow-x-auto">
      <UTable
        v-model:global-filter="globalFilter"
        v-model:pagination="pagination"
        :data="itemStore.items"
        :columns="columns"
        :loading="itemStore.loading"
        :empty="{ icon: 'i-lucide-package', label: 'No items found' }"
      >
      </UTable>
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-2">
      <UFormGroup label="Results per Page">
        <USelect
          :options="[5, 10, 20, 100]"
          :model-value="pagination.pageSize"
          @update:model-value="pagination = { ...pagination, pageSize: Number($event), pageIndex: 0 }" />
      </UFormGroup>
      <UPagination
        :model-value="pagination.pageIndex + 1"
        @update:model-value="pagination = { ...pagination, pageIndex: $event - 1 }"
        :page-count="pagination.pageSize"
        :total="itemStore.items.length" />
    </div>
  </UContainer>
</template>
