<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { CocktailIngredient } from "~/types";

const props = defineProps(["ingredients"]);
const { getIngredientName, getIngredientCostPerUnit } = useIngredientResolver();

const columns: TableColumn<CocktailIngredient>[] = [
  {
    accessorKey: "item",
    header: "Ingredient",
    cell: ({ row }) => {
      const name = getIngredientName(row.original);
      const tag = row.original.sourceType === 'bottle' ? ' (Bottle)' : '';
      return name + tag;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original.amount + " " + row.original.unit,
  },
  {
    header: "Cost Per Unit",
    cell: ({ row }) =>
      Dollar.format(getIngredientCostPerUnit(row.original)),
  },
  {
    header: "Total Cost",
    cell: ({ row }) =>
      Dollar.format(getIngredientCostPerUnit(row.original) * row.original.amount),
  },
];
</script>

<template>
  <div>
    <UTable :data="props.ingredients" :columns="columns" :empty="'No ingredients'" />
  </div>
</template>
