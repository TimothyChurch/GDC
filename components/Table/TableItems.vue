<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";
import type { Row } from "@tanstack/vue-table";

const itemStore = useItemStore();
const contactStore = useContactStore();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const toast = useToast();

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
      onClick() {
        itemStore.deleteItem(row.original._id.toString());
        toast.add({
          title: "Cocktail item!",
          color: "error",
          icon: "i-lucide-trash",
        });
      },
    },
  ];
}

// Modal component info
import { ModalItem } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalItem);
const newCocktail = () => {
  itemStore.resetItem();
  openModal();
};
const openModal = async () => await modal.open();

const globalFilter = ref("");
</script>

<template>
  <UContainer>
    <UInput v-model="globalFilter" placeholder="Search items..." />
    <UTable
      v-model:global-filter="globalFilter"
      :data="itemStore.items"
      :columns="columns"
    >
    </UTable>
  </UContainer>
</template>
