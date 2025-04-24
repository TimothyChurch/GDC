<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";

const itemStore = useItemStore();
const contactStore = useContactStore();

const UButton = resolveComponent("UButton");

const router = useRouter();

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
      if (row.getValue("pricePerUnit") > 0) {
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
];

const onSelect = (row) => {
  console.log(row.original._id);
  router.push(`items/${row.original._id}`);
};
</script>

<template>
  <UContainer>
    {{ itemStore.items[0] }}
    <UTable :data="itemStore.items" :columns="columns" @select="onSelect">
    </UTable>
  </UContainer>
</template>
