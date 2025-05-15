<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Recipe } from "~/types";
import type { Row } from "@tanstack/vue-table";

const recipeStore = useRecipeStore();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const toast = useToast();

const search = ref("");

const columns: TableColumn<Recipe>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    header: "Volume",
    cell: ({ row }) =>
      `${row.original.volume} ${row.original.volumeUnit}` || "N/A",
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

function getRowItems(row: Row<Recipe>) {
  return [
    {
      label: "Edit cocktail",
      onSelect() {
        recipeStore.setRecipe(row.original._id.toString());
        openModal();
      },
    },
    {
      label: "Delete cocktail",
      variant: "danger",
      onClick() {
        recipeStore.deleteRecipe(row.original._id.toString());
        toast.add({
          title: "Cocktail deleted!",
          color: "error",
          icon: "i-lucide-trash",
        });
      },
    },
  ];
}
// Modal component info
import { ModalRecipe } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalRecipe);
const newRecipe = () => {
  recipeStore.resetRecipe();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <div>
    <UTable :data="recipeStore.recipes" :columns="columns">
      <template #expanded="{ row }">
        <div v-for="item in row.original.items">
          {{ item }}
        </div>
      </template>
    </UTable>
  </div>
</template>
