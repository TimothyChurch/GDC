<script setup lang="ts">
import type { ObjectId } from "mongoose";
import type { TableColumn } from "@nuxt/ui";
import type { Cocktail } from "~/types";

const props = defineProps(["ingredients"]);
const itemStore = useItemStore();

const columns: TableColumn<Cocktail>[] = [
  {
    accessorKey: "item",
    header: "Ingredient",
    cell: ({ row }) =>
      itemStore.getItemById(row.original.item.toString())?.name,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original.amount + " " + row.original.unit,
  },
  {
    header: "Cost Per Unit",
    cell: ({ row }) =>
      Dollar.format(
        itemStore.getPriceById(row.original.item.toString()) as number
      ),
  },
  {
    header: "Total Cost",
    cell: ({ row }) =>
      Dollar.format(
        (row.original.amount *
          itemStore.getPriceById(row.original.item.toString())) as number
      ),
  },
];
</script>

<template>
  <div>
    <UTable :data="props.ingredients" :columns="columns" :empty="{ icon: 'i-lucide-list', label: 'No ingredients' }" />
  </div>
</template>
